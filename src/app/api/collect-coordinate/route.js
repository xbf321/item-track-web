import gcoord from 'gcoord';
import dayjs from 'dayjs';
import calculateDistance from '@/lib/calculate-distance';
import SendPusher from '@/lib/send-pusher';
import LogCenter from '@/lib/log-center';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// 最大距离
const MAX_DIFFERENCE = 30;
const MIN_SPEED = 0.7;

export async function POST(request) {
	const context = getRequestContext();
	const body = await request.json();
	const currentDateTime = dayjs().add(8, 'hour').format('YYYY-MM-DD HH:mm:ss');
	const sendPusher = SendPusher(context.env);
	const logCenter = LogCenter(context.env);
	let hasCoordinateValue = false;
	await logCenter({
		...body,
		message: 'Recieve GPS data',
	});
	const {
		imei = 0,
		iccid = 0,
		gps: rawGPS = {},
		lbs: rawLBS = {},
		csq = 0,
		datetime: LocateDateTime = 0
	} = body;
	const gps = {
		gcj02: [0, 0],
		bd09: [0, 0],
		wgs84: [0, 0]
	};

	// 转换坐标
	if (rawGPS.isFix) {
		gps.gcj02 = gcoord.transform(
			[rawGPS.lng || 0, rawGPS.lat || 0],
			gcoord.WGS84,
			gcoord.GCJ02
		);
		gps.bd09 = gcoord.transform(
			[rawGPS.lng || 0, rawGPS.lat || 0],
			gcoord.WGS84,
			gcoord.BD09
		);
		gps.wgs84 = [Number(rawGPS.lng), Number(rawGPS.lat)];
		gps.speed = Number(rawGPS.speed);
		hasCoordinateValue = true;
	}

	const lbs = {
		gcj02: gcoord.transform(
			[rawLBS.lng || 0, rawLBS.lat || 0],
			gcoord.WGS84,
			gcoord.GCJ02
		),
		bd09: gcoord.transform(
			[rawLBS.lng || 0, rawLBS.lat || 0],
			gcoord.WGS84,
			gcoord.BD09
		),
		wgs84: [Number(rawLBS.lng || 0), Number(rawLBS.lat || 0)]
	};

	if (Number(rawLBS.lng) > 0 && Number(rawLBS.lat) > 0) {
		hasCoordinateValue = true;
	}

	if (hasCoordinateValue === false) {
		await logCenter({
			...body,
			message: 'None invalidate value',
		});
		return new Response('None invalidate value');
	}

	const insertNewRow = async () => {
		const response = await context.env.DB.prepare('INSERT INTO records(imei, iccid, csq, gps, lbs, locate_datetime, create_datetime, update_datetime) VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)').bind(imei, iccid, csq, JSON.stringify(gps), JSON.stringify(lbs), LocateDateTime, currentDateTime, currentDateTime).all();
		// 插入失败，发送日志
		if (response.success === false) {
			await sendPusher('[Error] Insert item-track-db fail', {
				body,
				response
			});
		}
	};

	const updateRowById = async (id) => {
		const response = await context.env.DB.prepare('UPDATE records SET locate_datetime = ?2, update_datetime = ?3, gps = ?4, lbs = ?5 WHERE id = ?1').bind(id, LocateDateTime, currentDateTime, JSON.stringify(gps), JSON.stringify(lbs)).all();

		// 失败，发送日志
		if (response.success === false) {
			await sendPusher('[Error] Update item-track-db fail', {
				id,
				body,
				response
			});
		}
	};

	// 获得当天最新一条数据
	// 如果当天没有数据，直接插入
	// 如果当天有数据，获得当天数据最新一条和当前数据比较
	const { results: latestItem } = await context.env.DB.prepare("SELECT * FROM records WHERE locate_datetime >= date('now', 'start of day') AND imei = ?1  ORDER BY update_datetime DESC LIMIT 0,1").bind(imei).all();
	if (latestItem.length === 0) {
		await insertNewRow();
		await logCenter({
			...body,
			message: 'Insert the first row of today',
		});
		return new Response('Insert the first row of today');
	}

	// 有最近一条数据
	const { id, gps: latestItemGPS, lbs: latestItemLBS } = latestItem[0];
	const { wgs84: dbGPSWGS84 } = JSON.parse(latestItemGPS);
	const { wgs84: dbLBSWGS84 } = JSON.parse(latestItemLBS);
	const [dbLat, dbLng] = (dbGPSWGS84[0] > 1 && dbGPSWGS84[1] > 1) ? dbGPSWGS84 : dbLBSWGS84;
	const { lat: rawLat, lng: rawLng } = rawGPS.isFix ? rawGPS : rawLBS;

	// 解决GPS静态漂移问题
	// 通过数据发现，当设备静止时，speed 大部分在 1-0 之前，有的甚至超过 1 （这部分数据不正常，且不好过滤）
	// 所有先过滤掉大部分（0.7以下数据）
	if (rawGPS.isFix && gps.speed < MIN_SPEED) {
		await updateRowById(id);
		await logCenter({
			...body,
			message: 'Filter 0.5 blow data',
		});
		return new Response('Filter 0.5 blow data');
	}

	//	-> 如果距离大于 特定值 ，则插入
	//  -> 否则，不插入，更新当条数据
	const diff = calculateDistance(rawLat, rawLng, dbLat, dbLng);
	if (diff < MAX_DIFFERENCE) {
		await updateRowById(id);
		await logCenter({
			...body,
			diff,
			message: 'overcome the max distance',
		});
		return new Response('update ok');
	}
	await logCenter({
		...body,
		message: 'insert new row',
	});
	await insertNewRow();
	return new Response('insert new row');
}
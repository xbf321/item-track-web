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
	const isDebug = request.url.indexOf('debug') > 0
	const body = await request.json();
	const currentDateTime = dayjs().add(8, 'hour').format('YYYY-MM-DD HH:mm:ss');
	const sendPusher = SendPusher(context.env);
	const logCenter = LogCenter(context.env);
	const {
		// 获取GPS震动情况 0: 没震动 1 震动
		shake = 0,
		// 是否获得GPS，非LBS（基站定位）
		gps: isGPS = false,
		// gps 速度
		speed = 0,
		lat = 0,
		lng = 0,
		// 上报时间
		dt: LocateDateTime = 0
	} = body;
	await logCenter({
		...body,
		message: 'Recieve GPS data',
	});

	const gps = {
		isGPS,
		shake,
		speed: Number(speed),
		wgs84: [Number(lng), Number(lat)],
		gcj02: gcoord.transform(
			[Number(lng) || 0, Number(lat) || 0],
			gcoord.WGS84,
			gcoord.GCJ02
		),
		bd09: gcoord.transform(
			[Number(lng) || 0, Number(lat) || 0],
			gcoord.WGS84,
			gcoord.BD09
		),
	};
	if (gps.wgs84[0] + gps.wgs84[1] < 10) {
		await logCenter({
			...body,
			message: 'The value of lat and lng goes wrong',
		});
		return new Response(isDebug ? 'The value of lat and lng goes wrong' : '');
	}
	

	const insertNewRow = async () => {
		const response = await context.env.DB.prepare('INSERT INTO records(gps, locate_datetime, create_datetime, update_datetime) VALUES(?1, ?2, ?3, ?3)').bind(JSON.stringify(gps), LocateDateTime, currentDateTime).all();
		// 插入失败，发送日志
		if (response.success === false) {
			await sendPusher('[Error] Insert item-track-db fail', {
				body,
				response
			});
		}
	};

	const updateRowById = async (id) => {
		const response = await context.env.DB.prepare('UPDATE records SET locate_datetime = ?2, update_datetime = ?3, gps = ?4  WHERE id = ?1').bind(id, LocateDateTime, currentDateTime, JSON.stringify(gps)).all();

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
	const { results: latestItem } = await context.env.DB.prepare("SELECT * FROM records WHERE locate_datetime >= date('now', 'start of day') ORDER BY update_datetime DESC LIMIT 0,1").bind().all();
	if (latestItem.length === 0) {
		await insertNewRow();
		await logCenter({
			...body,
			message: 'Insert the first row of today',
		});
		return new Response(isDebug ? 'Insert the first row of today' : '');
	}

	// 有最近一条数据
	const { id, gps: latestItemGPS } = latestItem[0];
	const { wgs84: dbGPSWGS84 } = JSON.parse(latestItemGPS);
	const [dbLng, dbLat] = dbGPSWGS84;

	// 解决GPS静态漂移问题
	// 通过数据发现，当设备静止时，speed 大部分在 1-0 之前，有的甚至超过 1 （这部分数据不正常，且不好过滤）
	// 所有先过滤掉大部分（0.7以下数据）
	if (isGPS && gps.speed < MIN_SPEED) {
		await updateRowById(id);
		await logCenter({
			...body,
			message: 'Filter 0.5 blow data',
		});
		return new Response(isDebug ? 'Filter 0.5 blow data' : '');
	}

	//	-> 如果距离大于 特定值 ，则插入
	//  -> 否则，不插入，更新当条数据
	const diff = calculateDistance(lat, lng, dbLat, dbLng);
	if (diff < MAX_DIFFERENCE) {
		await updateRowById(id);
		await logCenter({
			...body,
			diff,
			message: 'In the max cycle',
		});
		return new Response(isDebug ? 'In the max cycle' : '');
	}
	await logCenter({
		...body,
		dbLat,
		dbLng,
		diff,
		message: 'Insert new row',
	});
	await insertNewRow();
	return new Response(isDebug ? 'Insert new row' : '');
}
import gcoord from 'gcoord';
import calculateDistance from '@/lib/calculate-distance';
import sendPusher from '@/lib/send-pusher';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// 最大10米
const MAX_DIFFERENCE = 10;

export async function POST(request) {
  const context = getRequestContext();
  const body = await request.json();
  let hasCoordinateValue = false;

  const {
		imei = 0,
		iccid = 0,
		vbatt =  0,
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
		gps.speed = rawGPS.speed;
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
		return new Response('None invalidate value');
	}

	const insertNewRow = async () => {
		// 没有数据直接插入
		const response = await context.env.DB.prepare('INSERT INTO records(imei, iccid,  vbatt, csq, gps, lbs, locate_datetime, create_datetime, update_datetime) VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)').bind(imei, iccid,  vbatt, csq, JSON.stringify(gps), JSON.stringify(lbs), LocateDateTime, Date.now(), Date.now()).all();
		// 插入失败，发送日志
		if (response.success === false) {
			await sendPusher(context.env, {
				body,
				response,
			});
		}
	};

	const updateRowById = async (id) => {
		const response= await context.env.DB.prepare('UPDATE records SET locate_datetime = ?2, update_datetime=?3 WHERE id = ?1').bind(id, LocateDateTime, Date.now()).all();
		// 失败，发送日志
		if (response.success === false) {
			await sendPusher(context.env, {
				body,
				response,
			});
		}
	};

	await insertNewRow();
	return new Response('insert ok');
	
	/*
	// 获得当天最新一条数据
	// 如果当天没有数据，直接插入
	// 如果当天有数据，获得当天数据最新一条和当前数据比较
	//	-> 如果距离大于 特定值 ，则插入
	//  -> 否则，不插入，更新当条数据
	const { results: latestItem } = await context.env.DB.prepare("SELECT * FROM records WHERE locate_datetime >= date('now', 'start of day') AND imei = ?1  ORDER BY update_datetime DESC LIMIT 0,1").bind(imei).all();
	console.info('result', latestItem);
	if (latestItem.length === 0) {
		await insertNewRow();
		return new Response('insert ok');
	}
	
	// 有最近一条数据
	const { id, gps: latestItemGPS, lbs: latestItemLBS } = latestItem[0];
	const { wgs84: gpsWGS84 } = JSON.parse(latestItemGPS);
	const { wgs84: lbsWGS84 } = JSON.parse(latestItemLBS);
	let diff = 0;
	// 获得 GPS 数据
	if (rawGPS.isFix) {
		// DB最近一条数据，可能有 gps 也可能没有
		if (gpsWGS84 && gpsWGS84.length === 2 && gpsWGS84[0] > 1 && gpsWGS84[1] > 1) {
			// 有，用这个计算
			diff = calculateDistance(gpsWGS84[1], gpsWGS84[0], rawGPS.lat, rawGPS.lng);
		} else {
			diff = calculateDistance(lbsWGS84[1], lbsWGS84[0], rawGPS.lat, rawGPS.lng);
		}
	} else {
		// 使用 rawLBS 计算
		if (gpsWGS84 && gpsWGS84.length === 2 && gpsWGS84[0] > 1 && gpsWGS84[1] > 1) {
			// 有，用这个计算
			diff = calculateDistance(gpsWGS84[1], gpsWGS84[0], Number(rawLBS.lat), Number(rawLBS.lng));
		} else {
			diff = calculateDistance(lbsWGS84[1], lbsWGS84[0], Number(rawLBS.lat), Number(rawLBS.lng));
		}
	}

	if (diff >= MAX_DIFFERENCE) {
		await insertNewRow();
		return new Response('insert ok');
	}

	await updateRowById(id);
	return new Response('update ok');*/
}
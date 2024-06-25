import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

// 返回 gcj02 坐标
function getCoordinate(gpsString, lbsString) {
  const gps = JSON.parse(gpsString);
  const lbs = JSON.parse(lbsString);
  let coordinate = gps.gcj02;
  if (coordinate[0] < 2 || coordinate[1] < 2) {
    coordinate = lbs.gcj02;
  }
  return coordinate;
}

export default async function getList(deviceId = '') {
  const context = getRequestContext();
  const response = {};
  // 默认获取今天数据
  const sql = "SELECT * FROM records WHERE locate_datetime >= date('now', 'start of day') AND imei = ?1  ORDER BY update_datetime DESC";
  const { results } = await context.env.DB.prepare(sql).bind(deviceId).all();

  if (results.length === 0) {
    return response;
  }
  const endPointItem = results[0];
  response.endPoint = {
  		vbatt: endPointItem.vbatt,
  		csq: endPointItem.csq,
  		locate_datetime: endPointItem.locate_datetime,
  		update_datatime: endPointItem.update_datatime,
  		coordinate: getCoordinate(endPointItem.gps, endPointItem.lbs),
  };
  // 转换并过滤数据
  response.lines = results.map((item) => {
  		return getCoordinate(item.gps, item.lbs);
  });
  
  return response;
}

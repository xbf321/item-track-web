import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// 返回 gcj02 坐标
function getCoordinate(gpsString) {
  const gps = JSON.parse(gpsString);
  return gps.gcj02;
}

export default async function getList() {
  const context = getRequestContext();
  const response = {};
  // 默认获取今天数据
  const sql =
    "SELECT * FROM records WHERE locate_datetime >= date('now', 'start of day') ORDER BY update_datetime DESC";
  const { results } = await context.env.DB.prepare(sql).bind().all();

  if (results.length === 0) {
    return response;
  }
  const { locate_datetime, update_datetime, create_datetime, gps: gpsString } = results[0];

  const gps = JSON.parse(gpsString);

  response.endPoint = {
    locate_datetime,
    update_datetime,
    create_datetime,
    gps,
  };

  // 转换并过滤数据
  response.lines = results.map((item) => {
    return getCoordinate(item.gps);
  });

  return response;
}

import AMap from './AMap';
import GetCoordinateListData from '@/data/coordinate-list';

export const runtime = 'edge';

export default async function Home() {
  const { endPoint, lines } = await GetCoordinateListData();

  const { locate_datetime, update_datetime, create_datetime, gps = {} } = endPoint || {};
  const { isGPS } = gps || {};

  return (
    <>
      <div className="p-2 text-sm text-yellow-800 bg-yellow-100" role="alert">
        {endPoint ? (
          <>
            <div>
              <b>上报类型：</b>
              {isGPS ? 'GPS' : '4G'}
            </div>
            <div>
              <b>上报时间：</b>
              {locate_datetime}
            </div>
            <div>
              <b>创建时间：</b>
              {create_datetime}
            </div>
            <div>
              <b>更新时间：</b>
              {update_datetime}
            </div>
          </>
        ) : (
          <span className="text-red-400">抱歉，当天没有轨迹数据。</span>
        )}
      </div>
      <div className="flex-1" id="container">
        <AMap lines={lines} endPoint={endPoint} />
      </div>
    </>
  );
}

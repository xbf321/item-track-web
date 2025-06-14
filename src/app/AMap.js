'use client';

import { useLayoutEffect, useRef } from 'react';

const SecurityJsCode = '3adb72e3e611c1726e8408e952400972';
const AMapKey = 'a81d30254c83ff15370da772a0e1af3d';
const DEFUALT_COORDINATE = [116.71601597742827, 39.51018439451933];

export default function AMap({ endPoint, lines }) {
  const mapRef = useRef(null);

  const { gps = {} } = endPoint || {};
  const { gcj02: coordinate = DEFUALT_COORDINATE } = gps || {};

  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      window._AMapSecurityConfig = {
        securityJsCode: SecurityJsCode,
      };
      // https://lbs.amap.com/api/javascript-api-v2/getting-started
      import('@amap/amap-jsapi-loader').then((AMapLoader) => {
        AMapLoader.load({
          key: AMapKey,
          version: '2.0',
          plugins: ['AMap.ToolBar', 'AMap.MoveAnimation', 'AMap.Scale'],
        })
          .then((AMap) => {
            mapRef.current = new AMap.Map('container', {
              resizeEnable: true,
              zoom: 16,
              center: coordinate,
            });

            mapRef.current.addControl(
              new AMap.ToolBar({
                position: {
                  top: '15px',
                  right: '15px',
                },
              }),
            );
            mapRef.current.addControl(new AMap.Scale());

            const marker = new AMap.Marker({
              map: mapRef.current.current,
              position: coordinate,
            });

            mapRef.current.add(marker);

            // 绘制轨迹
            const polyline = new AMap.Polyline({
              map: mapRef.current,
              path: lines,
              showDir: true,
              strokeColor: '#28F',
              strokeWeight: 6,
            });

            mapRef.current.add(polyline);
          })
          .catch((e) => {
            console.log(e);
          });
      });
    }

    return () => {
      mapRef.current?.destroy();
    };
  }, []);

  return <div className="p-2">Loading...</div>;
}

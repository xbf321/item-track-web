"use client";

import { useEffect } from "react";

const SecurityJsCode = "3adb72e3e611c1726e8408e952400972";
const AMapKey = "a81d30254c83ff15370da772a0e1af3d";

export default function AMap({ endPoint, lines }) {
  let map = null;

  const DEFUALT_COORDINATE = [116.71601597742827, 39.51018439451933];
  useEffect(() => {
    const { coordinate = DEFUALT_COORDINATE } = endPoint || {};
    if (typeof window !== "undefined") {
      window._AMapSecurityConfig = {
        securityJsCode: SecurityJsCode,
      };
      // https://lbs.amap.com/api/javascript-api-v2/getting-started
      import("@amap/amap-jsapi-loader").then((AMapLoader) => {
        AMapLoader.load({
          key: AMapKey,
          version: "2.0",
          plugins: [
            "AMap.ToolBar",
            "AMap.MoveAnimation",
            "AMap.Geolocation",
            "AMap.Scale",
          ],
        })
          .then((AMap) => {
            let marker,
              lineArr = lines;
            map = new AMap.Map("container", {
              resizeEnable: true,
              zoom: 16,
              center: coordinate || DEFUALT_COORDINATE,
            });

            const geolocation = new AMap.Geolocation({
              enableHighAccuracy: true,
              timeout: 10000,
              offset: [30, 530],
              zoomToAccuracy: true,
              position: "RB",
            });

            map.addControl(
              new AMap.ToolBar({
                position: {
                  top: "50px",
                  right: "30px",
                },
              })
            );
            map.addControl(new AMap.Scale());
            map.addControl(geolocation);

            marker = new AMap.Marker({
              map: map,
              position: coordinate || DEFUALT_COORDINATE,
            });

            // 绘制轨迹
            new AMap.Polyline({
              map: map,
              path: lineArr,
              showDir: true,
              strokeColor: "#28F",
              strokeWeight: 6,
            });

            const passedPolyline = new AMap.Polyline({
              map: map,
              strokeColor: "#AF5",
              strokeWeight: 6,
            });

            marker.on("moving", (e) => {
              passedPolyline.setPath(e.passedPath);
              map.setCenter(e.target.getPosition(), true);
            });

            // map.setCenter(coordinate);

            // map.setFitView();

            // window.setTimeout(() => {
            //   marker.moveAlong(lineArr, {
            //     // 每一段的时长
            //     duration: 500, //可根据实际采集时间间隔设置
            //     // JSAPI2.0 是否延道路自动设置角度在 moveAlong 里设置
            //     autoRotation: true,
            //   });
            // }, 5000);
          })
          .catch((e) => {
            console.log(e);
          });
      });
    }

    return () => {
      map?.destroy();
    };
  }, []);

  return <div id="container" className="w-full h-screen" />;
}

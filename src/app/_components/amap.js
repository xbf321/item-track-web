"use client";

import { useEffect } from "react";

const SecurityJsCode = "3adb72e3e611c1726e8408e952400972";
const AMapKey = "a81d30254c83ff15370da772a0e1af3d";

export default function AMap({ endPoint, lines }) {
  let map = null;

  const DEFUALT_COORDINATE = [116.71601597742827, 39.51018439451933];
  useEffect(() => {
    const { coordinate } = endPoint || {};
    if (typeof window !== "undefined") {
      window._AMapSecurityConfig = {
        securityJsCode: SecurityJsCode,
      };
      import("@amap/amap-jsapi-loader").then((AMapLoader) => {
        AMapLoader.load({
          key: AMapKey,
          version: "2.0",
          // plugins: ["AMap.Scale"],
        })
          .then((AMap) => {
            AMap.plugin("AMap.MoveAnimation", function () {
              let marker,
                lineArr = lines;
              map = new AMap.Map("container", {
                resizeEnable: true,
                zoom: 12,
                center: coordinate || DEFUALT_COORDINATE,
              });
              marker = new AMap.Marker({
                map: map,
                position: coordinate || DEFUALT_COORDINATE,
                icon: "https://a.amap.com/jsapi_demos/static/demo-center-v2/car.png",
                offset: new AMap.Pixel(-13, -26),
              });

              // 绘制轨迹
              var polyline = new AMap.Polyline({
                map: map,
                path: lineArr,
                showDir: true,
                strokeColor: "#28F",
                strokeWeight: 6, //线宽
              });

              var passedPolyline = new AMap.Polyline({
                map: map,
                strokeColor: "#AF5", //线颜色
                strokeWeight: 6, //线宽
              });

              marker.on("moving", function (e) {
                passedPolyline.setPath(e.passedPath);
                map.setCenter(e.target.getPosition(), true);
              });

              map.setFitView();

              // window.setTimeout(() => {
              //   marker.moveAlong(lineArr, {
              //     // 每一段的时长
              //     duration: 500, //可根据实际采集时间间隔设置
              //     // JSAPI2.0 是否延道路自动设置角度在 moveAlong 里设置
              //     autoRotation: true,
              //   });
              // }, 5000);
            });
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

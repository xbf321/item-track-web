'use client';

import { useEffect } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';

export default function MapContainer() {
  let map = null;

  useEffect(() => {
    window._AMapSecurityConfig = {
      securityJsCode: '3adb72e3e611c1726e8408e952400972',
    };
    
        AMapLoader.load({
        key: 'a81d30254c83ff15370da772a0e1af3d',
        version: '2.0',
        //   plugins: ["AMap.Scale"],
        }).then((AMap) => {
            AMap.plugin('AMap.MoveAnimation', function(){
                var marker, lineArr = [[116.478935,39.997761],[116.478939,39.997825],[116.478912,39.998549],[116.478912,39.998549],[116.478998,39.998555],[116.478998,39.998555],[116.479282,39.99856],[116.479658,39.998528],[116.480151,39.998453],[116.480784,39.998302],[116.480784,39.998302],[116.481149,39.998184],[116.481573,39.997997],[116.481863,39.997846],[116.482072,39.997718],[116.482362,39.997718],[116.483633,39.998935],[116.48367,39.998968],[116.484648,39.999861]];
                map = new AMap.Map('container', {
                    resizeEnable: true,
                    zoom: 11,
                    center: [116.397428, 39.90923],
                });
                marker = new AMap.Marker({
                    map: map,
                    position: [116.478935,39.997761],
                    icon: "https://a.amap.com/jsapi_demos/static/demo-center-v2/car.png",
                    offset: new AMap.Pixel(-13, -26),
                });
        
                // 绘制轨迹
                var polyline = new AMap.Polyline({
                    map: map,
                    path: lineArr,
                    showDir:true,
                    strokeColor: "#28F",  //线颜色
                    // strokeOpacity: 1,     //线透明度
                    strokeWeight: 6,      //线宽
                    // strokeStyle: "solid"  //线样式
                });
        
                var passedPolyline = new AMap.Polyline({
                    map: map,
                    strokeColor: "#AF5",  //线颜色
                    strokeWeight: 6,      //线宽
                });
        
        
                marker.on('moving', function (e) {
                    passedPolyline.setPath(e.passedPath);
                    map.setCenter(e.target.getPosition(),true)
                });
        
                map.setFitView();

                window.setTimeout(() =>{
                    marker.moveAlong(lineArr, {
                        // 每一段的时长
                        duration: 500,//可根据实际采集时间间隔设置
                        // JSAPI2.0 是否延道路自动设置角度在 moveAlong 里设置
                        autoRotation: true,
                    });
                }, 5000);
            });
        }).catch((e) => {
            console.log(e);
        });

    return () => {
      map?.destroy();
    };
  }, []);

  return (
    <div
      id="container"
      class="w-full h-screen"
    />
  );
}
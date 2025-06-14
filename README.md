## 定位系统

演示地址：[https://item-track.xingbaifang.com/](https://item-track.xingbaifang.com/)

## 背景

早上骑电动车去上班，停在高铁站，没想到晚上找不到，丢了。

关键是这个电动车还是 N 年之前买的二手的，基本上处于报废阶段，小偷好车不偷，还偷破车，真是穷到家了，后来想了想，有可能，拿着我这个破车就换购新车了。买新电动车时，如果有旧电动车，能抵扣 400 元大洋，估计是这个原因。

现在买了一台新电动车，为了防止被盗，就开发了这个系统，实时监控电动车位置。

原理是：

定位模块，实时上报坐标 -> Server <- Web 查看位置。

* 定位模块放在电动车上，使用 12V供电（电动车是48V的，需要使用降压电源），实时上报当前坐标信息，支持基站和GPS两种方式。
* Server 端，使用 Cloudflare D1 数据库保存坐标信息。
* Web 端，也部署在 Cloudflare。

硬件采用[「银尔达4GDTU」](https://yinerda.yuque.com/yt1fh6/4gdtu/ngp5mg9s7uavzhdv)模块，小巧还便宜。

> 为了节省流量，定位模块在晚上9点半到第二天早上6点取消上报。
> 第一年用的年费 4 元，每月 30M 流量，用了一段时间总超。
> 第二年升级为每年年 6 元，每月 100M流量，够用的。

## 部署

### Deploy Database

只在第一次需要。

```bash
npx wrangler d1 execute item-track-db --remote --file=./db-schema.sql
```

## Deploy Pages

```bash
npm run deploy
```

## 配置 LogCenter 上报地址

需要在 Cloudflare 后台设置。

路径： 设置 -> 变量和机密

## Development

First, create local database if it not exists.

```bash
npx wrangler d1 execute item-track-db --file=./db-schema.sql
```

then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 本地 D1 查询

list from local db

```bash
npx wrangler d1 execute item-track-db --local --command="SELECT * FROM records"
```

### 测试数据

```
{
  "shake": 0,
  "gps": true,
  "speed": 0,
  "lat": "116.7092",
  "lng": "39.49602",
  dt: "2025-06-14 10:02:01"
}
```

## 文档

[地图纠偏](https://old.openluat.com/GPS-Offset.html)

[Air780说明](https://yinerda.yuque.com/yt1fh6/4gdtu/gsccog81mv0hpii7#K9Gdv)

[高德地图文档](https://lbs.amap.com/demo/javascript-api-v2/example/map-lifecycle/loader)

[Nextjs](https://nextjs.org/docs/getting-started/installation)

## 4G DTU 上报脚本

```bash
function 
  sys.wait(15000)
  local taskname="userTask"
  log.info(taskname,"start")
  local nid=1
  local needup=1
  local count=0
  local netsta=0
  PronetStopProRecCh(1)
  UartStopProRecCh(1)
  GpsInit()
  GpsExecAgnss()
  LbsCheckLbs()
  while true do
    local d ={}
    d.time=os.date("%Y-%m-%d %H:%M:%S")
    d.shake=PerGetGpsZdSta()
    d.gps=libgnss.isFix()
    if libgnss.isFix() then
      local tg =libgnss.getRmc(2)
      d.lat=tg.lat
      d.lng=tg.lng
      d.speed=tg.speed
    else
      d.lng,d.lat = GetLbs()
    end
    local updata = json.encode(d)
    local netsta = PronetGetNetSta(nid)
    log.info(taskname,"updata",updata,"netsta",netsta)
    if needup ==1 and netsta ==1 then 
      needup =0
      count =0
      PronetSetSendCh(nid,updata)
      log.info("sendData", updata)
    end
    count = count+1
    if count > 40 then 
      needup =1
      count =0
    end 
    sys.wait(1000)
  end 
end
```
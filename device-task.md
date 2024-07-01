# 设备 Task

[API](https://yinerda.yuque.com/yt1fh6/4gdtu/ngp5mg9s7uavzhdv)

```bash
function 
  sys.wait(15000)
  local taskname="userTask"
  log.info(taskname,"start")
  local nid=1
  local needup=1
  local count=0
  local netsta=PronetGetNetSta(nid)
  PronetStopProRecCh(1)
  UartStopProRecCh(1)
  GpsInit()
  GpsExecAgnss()
  LbsCheckLbs()
  libgnss.on("raw", function(data)
    log.info("GNSS", data)
  end)
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
    log.info(taskname,"updata",updata,"netsta",netsta)
    if needup ==1 and netsta ==1 then 
      needup =0
      count =0
      PronetSetSendCh(nid,updata)
    end
    count = count+1
    if count > 60 then 
      needup =1
      count =0
    end 
    sys.wait(1000)
  end 
end
```

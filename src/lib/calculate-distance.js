function calculateDistance(lat1, lng1, lat2, lng2) {
  const radLat1 = (Number(lat1) * Math.PI) / 180.0;
  const radLat2 = (Number(lat2) * Math.PI) / 180.0;
  const a = radLat1 - radLat2;
  const b = (Number(lng1) * Math.PI) / 180.0 - (Number(lng2) * Math.PI) / 180.0;
  let s =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) +
          Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
      )
    );
  s = s * 6378137.0;
  s = Math.round(s * 10000) / 10000;
  return s;
}
export default calculateDistance;

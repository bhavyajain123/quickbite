function calculateDistance(lat1, lon1,lat2,lon2){
    const toRadians=(degrees)=>(degrees*Math.PI)/180;
    const earthRadiusKm=6371;
    const dLat = toRadians(lat2-lat1);
    const dLon= toRadians(lon2 -lon1);
    const a =Math.sin(dLat/2)**2 +
     Math.cos(toRadians(lat1))* 
     Math.cos(toRadians(lat2))* 
     Math.sin(dLon/2)**2;

    const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
    return Number((earthRadiusKm*c).toFixed(2));
}

function isValidCoordinates(latitude,longitude){
    return(Number.isFinite(Number(latitude))&& Number.isFinite(Number(longitude))&& Number(latitude)>= -90 && Number(latitude)<=90 && Number(longitude)>= -180&& Number(longitude)<=180);
}
module.exports={calculateDistance,isValidCoordinates,};
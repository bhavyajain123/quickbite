const{Queue}= require("bullmq");
const connection =require("../config/redis");

const orderQueue= new Queue("order",{connection});

module.exports= orderQueue;

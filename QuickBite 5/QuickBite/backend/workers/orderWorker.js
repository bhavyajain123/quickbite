const{Worker}= require("bullmq");
const connection= require("../config/redis");
const orderWorker= new Worker("order", async(job)=>{
    if(job.name ==="order-created"){
        const{orderId, customerId}= job.data;
    
    console.log("processing new order:", orderId);
    console.log("csutomer id:", customerId);
    return{success:true , orderId,};
}
throw new Error(`unkown order job:" ${job.name}`);
},
{connection});

orderWorker.on("completed",(job)=>{
    console.log("order job completed:", job.id);
});
orderWorker.on("failed",(job,error)=>{
    console.log("order job failed:", job?.id, error.message);
});
orderWorker.on('error',(error)=>{
    console.error("order worker error:", error.message);
});
module.exports= orderWorker;

const{Worker}= require("bullmq");
const connection= require("../config/redis");
const{sendEmail}= require("../services/emailService");
const emailWorker= new Worker("email", async(job)=>{
    console.log("processing email job:", job.name, job.id);
    const{to,subject,text,html}= job.data;
    const result= await sendEmail({to, subject, text,html});

    console.log("email job data:", job.id);
    return{success:true, messageId:result.messageId,};
},
{connection});

emailWorker.on("completed",(job)=>{
    console.log("email job completed:", job.id);
});
emailWorker.on("failed",(job,error)=>{
    console.log("email job failed:",job?.id, error.message);
});
emailWorker.on("error",(error)=>{
    console.log("email worker error:" ,error.message);
});

module.exports= emailWorker;
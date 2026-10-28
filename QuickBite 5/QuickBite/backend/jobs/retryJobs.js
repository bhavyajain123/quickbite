async function addWithRetry(queue, jobName, data, options={}){
    return queue.add(jobName,data,{
        attempts:3, 
        backoff:{type:"exponential", delay:1000,},
        removeOnComplete:1000,
        removeOnFail:5000,
        ...options,
    });
}
module.exports={addWithRetry};
const { Queue } = require("bullmq");
const connection = require("../config/redis");

const orderQueue = new Queue("order", { connection });

orderQueue.on("error", (err) => {
  console.warn("order queue error:", err.code || err.message);
});

module.exports = orderQueue;
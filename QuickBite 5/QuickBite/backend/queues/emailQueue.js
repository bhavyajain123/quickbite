const { Queue } = require("bullmq");
const connection = require("../config/redis");

const emailQueue = new Queue("email", { connection });

emailQueue.on("error", (err) => {
  console.warn("email queue error:", err.code || err.message);
});

module.exports = emailQueue;
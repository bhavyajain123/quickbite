const { Queue } = require("bullmq");
const connection = require("../config/redis");

const notificationQueue = new Queue("notification", { connection });

notificationQueue.on("error", (err) => {
  console.warn("notification queue error:", err.code || err.message);
});

module.exports = notificationQueue;
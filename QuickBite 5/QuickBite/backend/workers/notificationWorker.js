const { Worker } = require("bullmq");
const connection = require("../config/redis");
const {
  createNotification,
} = require("../services/notificationService");

const notificationWorker = new Worker(
  "notification",
  async (job) => {
    console.log("Processing notification job:", job.id);

    const notification = await createNotification(job.data);

    console.log("Notification saved:", notification._id);

    return {
      success: true,
      notificationId: notification._id.toString(),
    };
  },
  {connection}
);

notificationWorker.on("completed", (job) => {
  console.log("Notification job completed:", job.id);
});

notificationWorker.on("failed", (job, error) => {
  console.error("Notification job failed:", job?.id, error.message);
});

notificationWorker.on("error", (error) => {
  console.error("Notification worker error:", error.message);
});

module.exports = notificationWorker;

require("dotenv").config();

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  keepAlive: 10000,
  retryStrategy: (times) => Math.min(times * 500, 5000),
};

if (process.env.REDIS_TLS === "true") {
  connection.tls = { servername: process.env.REDIS_HOST };
}

module.exports = connection;
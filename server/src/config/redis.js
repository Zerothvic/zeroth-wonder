import IORedis from "ioredis";

// BullMQ requires this exact option. One shared connection is reused
// by both the queue producer (server) and the queue consumer (worker).
export const redisConnection = new IORedis(
  process.env.REDIS_URL || "redis://localhost:6379",
  { maxRetriesPerRequest: null }
);
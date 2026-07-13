import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const generationQueue = new Queue("generation", { connection: redisConnection });
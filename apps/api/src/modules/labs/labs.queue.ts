import { Queue } from "bullmq";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null
});
export const provisionQueue = new Queue("provision-lab", { connection: redis });
export const gradeQueue = new Queue("grade-submission", { connection: redis });

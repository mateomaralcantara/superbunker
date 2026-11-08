import "dotenv/config";
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client");
type PrismaClient = import("@prisma/client").PrismaClient;

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null
});

export const queues = {
  provision: new Queue("provision-lab", { connection: redis }),
  grade: new Queue("grade-submission", { connection: redis }),
  leaderboard: new Queue("compute-leaderboard", { connection: redis })
};

// Worker: provision lab (SAFE stub)
new Worker(
  "provision-lab",
  async (job) => {
    const { labInstanceId } = job.data as { labInstanceId: string };
    await prisma.labInstance.update({ where: { id: labInstanceId }, data: { status: "PROVISIONING" } });

    // MVP: simula provisioning (en producción: K8s/Terraform/Proxmox).
    await new Promise((r) => setTimeout(r, 1500));

    await prisma.labInstance.update({
      where: { id: labInstanceId },
      data: { status: "RUNNING", metadata: { endpoint: "internal://lab/" + labInstanceId } }
    });

    return { ok: true };
  },
  { connection: redis }
);

// Worker: grade submission (SAFE stub)
new Worker(
  "grade-submission",
  async (job) => {
    const { submissionId } = job.data as { submissionId: string };
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "GRADED", score: 80, feedback: "Buen trabajo. Próximo paso: evidencias más claras y remediación priorizada." }
    });
    return { ok: true };
  },
  { connection: redis }
);

// Worker: compute leaderboard (placeholder)
new Worker(
  "compute-leaderboard",
  async () => {
    return { ok: true };
  },
  { connection: redis }
);

console.log("✅ SupBunker workers up");

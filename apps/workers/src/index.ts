import "dotenv/config";
import net from "node:net";
import { createHash } from "node:crypto";
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { createRequire } from "node:module";
import { inScope, parsePorts, parseAllowlist } from "@supbunker/shared";

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

// Worker: escaneo de red TCP-connect (SOLO dentro del alcance autorizado).
const scanAllow = parseAllowlist(process.env.SCAN_ALLOWLIST ?? "127.0.0.1/32");

function tcpProbe(host: string, port: number, timeout = 1200): Promise<"open" | "closed" | "filtered"> {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    let done = false;
    const finish = (r: "open" | "closed" | "filtered") => {
      if (done) return;
      done = true;
      sock.destroy();
      resolve(r);
    };
    sock.setTimeout(timeout);
    sock.once("connect", () => finish("open"));
    sock.once("timeout", () => finish("filtered"));
    sock.once("error", (e: any) => finish(e?.code === "ECONNREFUSED" ? "closed" : "filtered"));
    sock.connect(port, host);
  });
}

async function probeAll(host: string, ports: number[]) {
  const results: { port: number; state: "open" | "closed" | "filtered" }[] = [];
  const batchSize = 30;
  for (let i = 0; i < ports.length; i += batchSize) {
    const batch = ports.slice(i, i + batchSize);
    const states = await Promise.all(batch.map((p) => tcpProbe(host, p)));
    batch.forEach((p, idx) => results.push({ port: p, state: states[idx] }));
  }
  return results.sort((a, b) => a.port - b.port);
}

new Worker(
  "scan-network",
  async (job) => {
    const { scanJobId } = job.data as { scanJobId: string };
    const scan = await prisma.scanJob.findUnique({ where: { id: scanJobId } });
    if (!scan) return { ok: false };

    // Defensa en profundidad: el worker vuelve a validar el alcance.
    if (!inScope(scan.target, scanAllow)) {
      await prisma.scanJob.update({
        where: { id: scanJobId },
        data: { status: "DENIED", reason: "out_of_scope", finishedAt: new Date() }
      });
      return { ok: false, denied: true };
    }

    await prisma.scanJob.update({ where: { id: scanJobId }, data: { status: "RUNNING" } });

    try {
      const ports = parsePorts(scan.ports);
      const ports_ = await probeAll(scan.target, ports);
      const open = ports_.filter((p) => p.state === "open").map((p) => p.port);
      const result = { target: scan.target, scanned: ports.length, open, ports: ports_ };
      const resultHash = createHash("sha256").update(JSON.stringify(result)).digest("hex");

      await prisma.scanJob.update({
        where: { id: scanJobId },
        data: { status: "DONE", result, resultHash, finishedAt: new Date() }
      });
      return { ok: true, open: open.length };
    } catch (err) {
      await prisma.scanJob.update({
        where: { id: scanJobId },
        data: { status: "FAILED", reason: String(err), finishedAt: new Date() }
      });
      return { ok: false };
    }
  },
  { connection: redis }
);

console.log("✅ SupBunker workers up");

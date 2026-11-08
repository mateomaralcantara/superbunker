import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { CreateScanSchema, normalizeTarget, parsePorts, inScope, parseAllowlist } from "@supbunker/shared";
import { loadEnv } from "../../config/env";
import { scanQueue } from "./scan.queue";

@Injectable()
export class ScanService {
  private readonly allowlist = parseAllowlist(loadEnv().SCAN_ALLOWLIST);

  constructor(private prisma: PrismaService, private audit: AuditService) {}

  get scope() {
    return this.allowlist;
  }

  async create(payload: unknown, req: any) {
    const data = CreateScanSchema.parse(payload);
    const ip = normalizeTarget(data.target);
    const ports = parsePorts(data.ports);

    if (!ip) throw new BadRequestException("Objetivo inválido: usa una IPv4 o 'localhost'.");
    if (ports.length === 0) throw new BadRequestException("No hay puertos válidos que escanear.");

    // Deny-by-default: el objetivo debe estar en el alcance autorizado.
    if (!inScope(ip, this.allowlist)) {
      await this.prisma.scanJob.create({
        data: { userId: req.user.sub, target: data.target, ports: data.ports, status: "DENIED", reason: "out_of_scope" }
      });
      await this.audit.log({
        actorId: req.user.sub,
        action: "SCAN_DENIED",
        target: data.target,
        reason: "fuera de alcance",
        ip: req.ip,
        ua: req.headers["user-agent"]
      });
      throw new ForbiddenException(
        `Objetivo fuera del alcance autorizado. Permitidos: ${this.allowlist.join(", ")}`
      );
    }

    const job = await this.prisma.scanJob.create({
      data: { userId: req.user.sub, target: ip, ports: ports.join(","), status: "PENDING" }
    });

    await scanQueue.add("scan", { scanJobId: job.id });

    await this.audit.log({
      actorId: req.user.sub,
      action: "SCAN_CREATE",
      target: job.id,
      ip: req.ip,
      ua: req.headers["user-agent"]
    });

    return job;
  }

  mine(req: any) {
    return this.prisma.scanJob.findMany({
      where: { userId: req.user.sub },
      orderBy: { createdAt: "desc" },
      take: 20
    });
  }
}

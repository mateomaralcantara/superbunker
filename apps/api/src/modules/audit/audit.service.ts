import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: { actorId?: string; action: string; target?: string; ip?: string; ua?: string; reason?: string }) {
    await this.prisma.auditLog.create({ data: { ...params } });
  }
}

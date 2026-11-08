import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../courses/jwtAuth.guard";
import { RequireRoles, RolesGuard } from "../common/rbac";
import { AuditService } from "../audit/audit.service";
import { CreateLabInstanceSchema, CreateLabTemplateSchema } from "@supbunker/shared";
import { provisionQueue } from "./labs.queue";

@Controller("labs")
export class LabsController {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  @Get("templates")
  async listTemplates() {
    return this.prisma.labTemplate.findMany({ orderBy: { createdAt: "desc" } });
  }

  @Post("templates")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles("RANGE_ADMIN", "INSTRUCTOR")
  async createTemplate(@Body() body: unknown, @Req() req: any) {
    const data = CreateLabTemplateSchema.parse(body);
    const tpl = await this.prisma.labTemplate.create({ data });
    await this.audit.log({
      actorId: req.user.sub,
      action: "LAB_TEMPLATE_CREATE",
      target: tpl.id,
      ip: req.ip,
      ua: req.headers["user-agent"]
    });
    return tpl;
  }

  @Post("instances")
  @UseGuards(JwtAuthGuard)
  async createInstance(@Body() body: unknown, @Req() req: any) {
    const data = CreateLabInstanceSchema.parse(body);
    const inst = await this.prisma.labInstance.create({
      data: { templateId: data.templateId, userId: req.user.sub, status: "PENDING" }
    });

    await provisionQueue.add("provision", { labInstanceId: inst.id });

    await this.audit.log({
      actorId: req.user.sub,
      action: "LAB_INSTANCE_CREATE",
      target: inst.id,
      ip: req.ip,
      ua: req.headers["user-agent"]
    });
    return inst;
  }

  @Get("instances/me")
  @UseGuards(JwtAuthGuard)
  async myInstances(@Req() req: any) {
    return this.prisma.labInstance.findMany({ where: { userId: req.user.sub }, orderBy: { createdAt: "desc" } });
  }
}

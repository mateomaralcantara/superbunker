import { Body, Controller, Get, Post, UseGuards, Req } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "./jwtAuth.guard";
import { RequireRoles, RolesGuard } from "../common/rbac";
import { CreateCourseSchema } from "@supbunker/shared";
import { AuditService } from "../audit/audit.service";

@Controller("courses")
export class CoursesController {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  @Get()
  async list() {
    return this.prisma.course.findMany({ orderBy: { createdAt: "desc" } });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles("INSTRUCTOR", "PROGRAM_DIRECTOR")
  async create(@Body() body: unknown, @Req() req: any) {
    const data = CreateCourseSchema.parse(body);
    const course = await this.prisma.course.create({ data: { ...data, level: data.level } });
    await this.audit.log({
      actorId: req.user.sub,
      action: "COURSE_CREATE",
      target: course.id,
      ip: req.ip,
      ua: req.headers["user-agent"]
    });
    return course;
  }
}

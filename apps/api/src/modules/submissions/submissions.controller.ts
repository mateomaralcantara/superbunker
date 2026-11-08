import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../courses/jwtAuth.guard";
import { CreateSubmissionSchema } from "@supbunker/shared";
import { AuditService } from "../audit/audit.service";
import { gradeQueue } from "../labs/labs.queue";

@Controller("submissions")
export class SubmissionsController {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: unknown, @Req() req: any) {
    const data = CreateSubmissionSchema.parse(body);
    const sub = await this.prisma.submission.create({
      data: { assignmentId: data.assignmentId, userId: req.user.sub, content: data.content, status: "SUBMITTED" }
    });

    await gradeQueue.add("grade", { submissionId: sub.id });

    await this.audit.log({
      actorId: req.user.sub,
      action: "SUBMISSION_CREATE",
      target: sub.id,
      ip: req.ip,
      ua: req.headers["user-agent"]
    });
    return sub;
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async mine(@Req() req: any) {
    return this.prisma.submission.findMany({ where: { userId: req.user.sub }, orderBy: { createdAt: "desc" } });
  }
}

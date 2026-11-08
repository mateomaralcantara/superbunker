import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { CoursesModule } from "./courses/courses.module";
import { LabsModule } from "./labs/labs.module";
import { SubmissionsModule } from "./submissions/submissions.module";

@Module({
  imports: [PrismaModule, AuditModule, AuthModule, HealthModule, CoursesModule, LabsModule, SubmissionsModule]
})
export class AppModule {}

import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { CoursesModule } from "./courses/courses.module";
import { LabsModule } from "./labs/labs.module";
import { SubmissionsModule } from "./submissions/submissions.module";
import { loadEnv } from "../config/env";

const env = loadEnv();

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: env.THROTTLE_TTL * 1000, limit: env.THROTTLE_LIMIT }]),
    PrismaModule,
    AuditModule,
    AuthModule,
    HealthModule,
    CoursesModule,
    LabsModule,
    SubmissionsModule
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule {}

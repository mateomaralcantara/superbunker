import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { JwtAuthGuard } from "../courses/jwtAuth.guard";
import { ScanService } from "./scan.service";
import { loadEnv } from "../../config/env";

const env = loadEnv();

@Controller("scan")
@UseGuards(JwtAuthGuard)
export class ScanController {
  constructor(private scan: ScanService) {}

  /** Alcance autorizado (para mostrarlo en la UI). */
  @Get("scope")
  scope() {
    return { allowlist: this.scan.scope };
  }

  @Post("network")
  @Throttle({ default: { limit: env.AUTH_THROTTLE_LIMIT, ttl: env.THROTTLE_TTL * 1000 } })
  async network(@Body() body: unknown, @Req() req: any) {
    return this.scan.create(body, req);
  }

  @Get("me")
  async mine(@Req() req: any) {
    return this.scan.mine(req);
  }
}

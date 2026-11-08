import { Body, Controller, Post, Req } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { loadEnv } from "../../config/env";

const env = loadEnv();
// Límite estricto para endpoints de autenticación (anti fuerza bruta).
const authThrottle = { default: { limit: env.AUTH_THROTTLE_LIMIT, ttl: env.THROTTLE_TTL * 1000 } };

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post("register")
  @Throttle(authThrottle)
  async register(@Body() body: unknown, @Req() req: any) {
    return this.auth.register(body, req);
  }

  @Post("login")
  @Throttle(authThrottle)
  async login(@Body() body: unknown, @Req() req: any) {
    return this.auth.login(body, req);
  }
}

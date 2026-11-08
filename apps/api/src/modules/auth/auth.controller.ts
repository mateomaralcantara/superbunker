import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post("register")
  async register(@Body() body: unknown, @Req() req: any) {
    return this.auth.register(body, req);
  }

  @Post("login")
  async login(@Body() body: unknown, @Req() req: any) {
    return this.auth.login(body, req);
  }
}

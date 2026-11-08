import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { RegisterSchema, LoginSchema } from "@supbunker/shared";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private audit: AuditService) {}

  async register(payload: unknown, req: any) {
    const data = RegisterSchema.parse(payload);
    const passwordHash = await argon2.hash(data.password);

    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        passwordHash,
        roles: { create: [{ role: "STUDENT" }] }
      },
      select: { id: true, email: true, name: true }
    });

    await this.audit.log({
      actorId: user.id,
      action: "AUTH_REGISTER",
      ip: req.ip,
      ua: req.headers["user-agent"]
    });

    return { user };
  }

  async login(payload: unknown, req: any) {
    const data = LoginSchema.parse(payload);
    const user = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: { roles: true }
    });

    if (!user) throw new UnauthorizedException("Credenciales inválidas");
    const ok = await argon2.verify(user.passwordHash, data.password);
    if (!ok) throw new UnauthorizedException("Credenciales inválidas");

    const token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role)
    });

    await this.audit.log({
      actorId: user.id,
      action: "AUTH_LOGIN",
      ip: req.ip,
      ua: req.headers["user-agent"]
    });

    return { token, user: { id: user.id, email: user.email, name: user.name, roles: user.roles } };
  }
}

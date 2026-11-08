import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const RequireRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const required: string[] = Reflect.getMetadata(ROLES_KEY, ctx.getHandler()) ?? [];
    if (required.length === 0) return true;

    const userRoles: string[] = req.user?.roles ?? [];
    const ok = required.some((r) => userRoles.includes(r));
    if (!ok) throw new ForbiddenException("No autorizado");
    return true;
  }
}

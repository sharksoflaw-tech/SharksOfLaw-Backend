import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(ctx: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            ctx.getHandler(),
            ctx.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) return true;

        const req = ctx.switchToHttp().getRequest();
        const user = req.user;

        // If JWT is not wired, user may be undefined → deny
        if (!user?.role) return false;

        return requiredRoles.includes(user.role);
    }
}
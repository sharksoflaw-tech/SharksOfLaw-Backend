import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
    canActivate(ctx: ExecutionContext): boolean {
        const req = ctx.switchToHttp().getRequest();
        const key = req.headers['x-admin-key'];
        return Boolean(key && process.env.ADMIN_API_KEY && key === process.env.ADMIN_API_KEY);
    }
}
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const result = context.switchToHttp().getRequest<Request>().isAuthenticated();
    if (!result) {
      throw new UnauthorizedException();
    }
    return result;
  }
}

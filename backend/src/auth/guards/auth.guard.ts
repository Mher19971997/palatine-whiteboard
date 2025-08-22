import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from '@palatine_whiteboard_backend/src/auth/guards/jwt-auth.guard';

@Injectable()
export class AuthGuard extends JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    return true;
  }
}

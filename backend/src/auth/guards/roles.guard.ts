import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@palatine_whiteboard_backend/src/auth/guards/auth.guard';
import { CryptoService } from '@palatine_whiteboard_backend/shared/src/crypto/crypto.service';
import { Logger } from '@palatine_whiteboard_backend/shared/src/util/logger';
import { UserService } from '@palatine_whiteboard_backend/src/user/user.service';

@Injectable()
export class RolesGuard extends AuthGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  protected baseCanActivate = super.canActivate;

  constructor(
    readonly cryptoService: CryptoService,
    readonly userService: UserService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() === 'http') {
      return this.canActivateHttp(context);
    }
  }

  async canActivateHttp(context: ExecutionContext): Promise<boolean> {
    const reqContext = context.switchToHttp().getRequest();
    const auth = reqContext.header('Authorization');
    const operation = `${reqContext.method}:${reqContext?.route?.path}`;
    const [type] = (auth && auth.split(' ')) || [null];

    this.logger.debug(
      {
        request: context.getType(),
        operation,
        body: reqContext.body,
        query: reqContext.query,
        params: reqContext.params,
        user: reqContext.user,
      },
      null,
      { request: context.getType(), operation, user: reqContext.user },
    );
    if (type && type === 'Bearer') {
      await this.baseCanActivate(context);
    }

    return this.validateUser(reqContext.user?.userUuid);
  }

  protected async validateUser(userUuid: string) {
    if (!userUuid) {
      return false;
    }

    const user = await  this.getUser(userUuid);
    return !!user;
  }

  protected async getUser(userUuid: string) {
    const user = await this.userService.findOne({ uuid: userUuid })
    if (!user) {
      return null;
    }
    return user;
  }
}

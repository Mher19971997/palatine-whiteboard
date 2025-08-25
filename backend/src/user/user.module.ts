import { Module } from '@nestjs/common';
import { UserController } from '@palatine_whiteboard_backend/src/user/user.controller';
import { UserService } from '@palatine_whiteboard_backend/src/user/user.service';
import { CryptoService } from '@palatine_whiteboard_backend/shared/src/crypto/crypto.service';
import { JwtStrategy } from '@palatine_whiteboard_backend/src/auth/strategies/jwt.strategy';

@Module({
  controllers: [UserController],
  providers: [UserService, CryptoService, JwtStrategy],
  exports: [UserService]
})
export class UserModule { }

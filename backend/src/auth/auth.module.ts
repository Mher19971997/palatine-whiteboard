import { Global, Module } from '@nestjs/common';
import { AuthController } from '@palatine_whiteboard_backend/src/auth/auth.controller';
import { AuthService } from '@palatine_whiteboard_backend/src/auth/auth.service';
import { UserService } from '@palatine_whiteboard_backend/src/user/user.service';
import { CryptoService } from '@palatine_whiteboard_backend/shared/src/crypto/crypto.service';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@palatine_whiteboard_backend/shared/src/config/config.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@palatine_whiteboard_backend/src/auth/strategies/jwt.strategy';

@Global()
@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: true,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => {
        return configService.get<JwtModuleOptions>('crypto.jwt');
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy, CryptoService],
  exports: [AuthService]
})
export class AuthModule { }

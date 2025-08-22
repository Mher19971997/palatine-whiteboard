import { CryptoService } from '@palatine_whiteboard_backend/shared/src/crypto/crypto.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@palatine_whiteboard_backend/shared/src/config/config.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService, private readonly cryptoService: CryptoService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('crypto.jwt.secret'),
    });
  }

  authenticate(req: Request, options?: any) {
    super.authenticate(req, options);
  }

  async validate(payload: { sub: string }) {
    return { userId: payload.sub, userUuid: await this.cryptoService.decrypt(payload.sub) };
  }
}

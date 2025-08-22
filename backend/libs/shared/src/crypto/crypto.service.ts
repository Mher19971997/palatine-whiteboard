import util from 'util';
import assert from 'assert';
import crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@palatine_whiteboard_backend/shared/src/config/config.service';
import { l10n } from '@palatine_whiteboard_backend/shared/src/config/l10n-constants';

@Injectable()
export class CryptoService {
  constructor(private readonly configService: ConfigService) {}

  async encrypt(_id: string): Promise<string> {
    const cipher = crypto.createCipheriv(
      this.configService.get<string>('crypto.cipheriv.algorithm'),
      this.configService.get<string>('crypto.cipheriv.key'),
      Buffer.from(this.configService.get<string>('crypto.cipheriv.iv'), 'hex'),
    );
    let encrypted = cipher.update(_id, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  async decrypt(_id: string): Promise<string> {
    const decipher = crypto.createDecipheriv(
      this.configService.get<string>('crypto.cipheriv.algorithm'),
      this.configService.get<string>('crypto.cipheriv.key'),
      Buffer.from(this.configService.get<string>('crypto.cipheriv.iv'), 'hex'),
    );

    return Buffer.concat([decipher.update(Buffer.from(_id, 'hex')), decipher.final()]).toString();
  }

  async hashPassword(password: string, secret: string) {
    return (
      await util.promisify(crypto.pbkdf2)(
        password,
        secret,
        this.configService.get<number>('crypto.pbkdf2.iterations'),
        this.configService.get<number>('crypto.pbkdf2.keylen'),
        this.configService.get<string>('crypto.pbkdf2.digest'),
      )
    ).toString('hex');
  }

  async checkPassword(hashedPassword: string, password: string, secret: string) {
    return assert((await this.hashPassword(password, secret)) === hashedPassword, l10n.wrong_password);
  }

  numGen(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}

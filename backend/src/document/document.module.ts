import { Module } from '@nestjs/common';
import { DocumentController } from '@palatine_whiteboard_backend/src/document/document.controller';
import { DocumentService } from '@palatine_whiteboard_backend/src/document/document.service';
import { DocumentGateway } from '@palatine_whiteboard_backend/src/document/document.gateway';
import { CacheModule } from '@palatine_whiteboard_backend/shared/src/cache/cache.module';
import { UserModule } from '../user/user.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@palatine_whiteboard_backend/shared/src/config/config.service';
import { PassportModule } from '@nestjs/passport';

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
    CacheModule, UserModule],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentGateway],
  exports: [DocumentService],
})
export class DocumentModule { }
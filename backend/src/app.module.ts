import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path'

import { UserModule } from '@palatine_whiteboard_backend/src/user/user.module';
import { AuthModule } from '@palatine_whiteboard_backend/src/auth/auth.module';
import { ServiceModule } from '@palatine_whiteboard_backend/service/src/service.module';
import { ConfigModule } from '@palatine_whiteboard_backend/shared/src/config/config.module';
import { SequelizeModule } from '@palatine_whiteboard_backend/shared/src/sequelize/sequelize.module';
import { FilesModule } from '@palatine_whiteboard_backend/shared/src/files/files.module';
import { DocumentModule } from './document/document.module';
import { CryptoService } from '@palatine_whiteboard_backend/shared/src/crypto/crypto.service';

@Module({
  imports: [
    ServiceModule.register(),
    ServeStaticModule.forRoot({ rootPath: path.resolve(__dirname, 'static') }),
    ConfigModule.forRoot(),
    AuthModule,
    UserModule, 
    SequelizeModule,
    FilesModule,
    DocumentModule
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}

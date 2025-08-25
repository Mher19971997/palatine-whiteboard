import { Module } from '@nestjs/common';
import { DocumentController } from '@palatine_whiteboard_backend/src/document/document.controller';
import { DocumentService } from '@palatine_whiteboard_backend/src/document/document.service';
import { DocumentGateway } from '@palatine_whiteboard_backend/src/document/document.gateway';
import { CacheModule } from '@palatine_whiteboard_backend/shared/src/cache/cache.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [CacheModule, UserModule],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentGateway],
  exports: [DocumentService],
})
export class DocumentModule { }
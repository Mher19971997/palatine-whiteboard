import { Module } from '@nestjs/common';
import { DocumentController } from '@palatine_whiteboard_backend/src/document/document.controller';
import { DocumentService } from '@palatine_whiteboard_backend/src/document/document.service';
import { DocumentGateway } from '@palatine_whiteboard_backend/src/document/document.gateway';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService, DocumentGateway],
  exports: [DocumentService],
})
export class DocumentModule { }
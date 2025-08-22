// src/whiteboard/whiteboard.module.ts
import { Module } from '@nestjs/common';
import { DocumentModule } from '../document/document.module';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [DocumentModule, ImageModule],
  exports: [DocumentModule, ImageModule],
})
export class WhiteboardModule {}
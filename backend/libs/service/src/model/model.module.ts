import { DynamicModule, Module } from '@nestjs/common';
import { UserEntry } from '@palatine_whiteboard_backend/service/src/model/user/user';
import { DocumentEntry } from '@palatine_whiteboard_backend/service/src/model/document/document';
import { ImageEntry } from '@palatine_whiteboard_backend/service/src/model/image/image';

const models: DynamicModule[] = [
  UserEntry,
  DocumentEntry,
  ImageEntry
];

@Module({
  imports: models,
  exports: models
})
export class ModelModule { }

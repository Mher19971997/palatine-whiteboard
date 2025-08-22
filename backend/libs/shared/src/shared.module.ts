import { Module } from '@nestjs/common';
import { SharedService } from '@palatine_whiteboard_backend/shared/src/shared.service';

@Module({
  providers: [SharedService],
  exports: [SharedService],
})
export class SharedModule {}

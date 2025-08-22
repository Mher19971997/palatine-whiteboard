import { Global, Module } from '@nestjs/common';
import { CacheService } from '@palatine_whiteboard_backend/shared/src/cache/cache.service';
import { Redis } from '@palatine_whiteboard_backend/shared/src/cache/redis';

@Global()
@Module({
  providers: [CacheService, Redis],
  exports: [CacheService],
})
export class CacheModule {}

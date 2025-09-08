import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { VaultConfigCommand } from './command/vault.command';
import { ConfigModule } from '@palatine_whiteboard_backend/shared/src/config/config.module';
import '@palatine_whiteboard_backend/shared/src/util/global';

@Module({
  imports: [
    CommandModule,
  ],
  providers: [VaultConfigCommand],
})
export class VaultModule {}

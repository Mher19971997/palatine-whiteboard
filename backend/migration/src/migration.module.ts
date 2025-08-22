import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { ConfigModule } from '@palatine_whiteboard_backend/shared/src/config/config.module';
import { SequelizeModule } from '@palatine_whiteboard_backend/shared/src/sequelize/sequelize.module';
import { CryptoService } from '@palatine_whiteboard_backend/shared/src/crypto/crypto.service';
import { MigrationCommand } from '@palatine_whiteboard_backend/migration/src/command/migration.command';
import { MigrationService } from '@palatine_whiteboard_backend/migration/src/migration.service';
import { MigrationEntry } from '@palatine_whiteboard_backend/migration/src/command/repository/migration.repository';

@Module({
  imports: [
    CommandModule,
    ConfigModule.forRoot(),
    SequelizeModule,
    // CryptoService,
    MigrationEntry,
  ],
  providers: [CryptoService, MigrationCommand, MigrationService],
})
export class MigrationModule {}

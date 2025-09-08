import 'source-map-support/register';
import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from 'nestjs-command';
import { VaultModule } from './vault.module';
import '@palatine_whiteboard_backend/shared/src/util/global';

(async function bootstrap() {
  const app = await NestFactory.createApplicationContext(VaultModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  try {
    await app.select(CommandModule).get(CommandService).exec();
    await app.close();
  } catch (error) {
    console.error(error);
    await app.close();
    process.exit(1);
  }
})();

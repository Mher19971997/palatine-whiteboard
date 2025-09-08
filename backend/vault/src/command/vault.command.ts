import { Injectable } from '@nestjs/common';
import { loadConfig } from '@palatine_whiteboard_backend/service/src';
import { Command } from 'nestjs-command';

@Injectable()
export class VaultConfigCommand {
  @Command({
    command: 'generate:config',
    describe: 'Generate configuration files from Vault',
  })
  async run(): Promise<void> {        // <-- здесь обязательно run()
    console.log('Generating config files...');
    await loadConfig();
    console.log('Config files generated.');
  }
}

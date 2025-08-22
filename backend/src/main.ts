import { AppModule } from '@palatine_whiteboard_backend/src/app.module';
import { startApp } from '@palatine_whiteboard_backend/service/src/index';

(async function bootstrap() {
  process.env['app.name'] = 'app-api';
  await startApp(AppModule, 'app-api');
})();

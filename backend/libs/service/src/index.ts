import 'source-map-support/register';
import '@palatine_whiteboard_backend/shared/src/util/global';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@palatine_whiteboard_backend/shared/src/util/logger';
import { ConfigService } from '@palatine_whiteboard_backend/shared/src/config/config.service';
import { ValidationPipe } from '@palatine_whiteboard_backend/shared/src/pipes/validation.pipe';
import { UrlParserInspector } from '@palatine_whiteboard_backend/shared/src/inspector/url-parser.inspector';
import { EmptyResponseInspector } from '@palatine_whiteboard_backend/shared/src/inspector/empty-response.inspector';
import { AllExceptionsFilter } from '@palatine_whiteboard_backend/shared/src/filters/all-exceptions.filter';
import { NestFactory } from '@nestjs/core';

export const server = async (app: NestExpressApplication, mod: any, confPref: string) => {
    const configs = app.get(ConfigService);
    global.Configs = configs;
    const logger = new Logger(mod.name);
    const appConf = configs.get<any>(confPref);
    
    app.useLogger([configs.get<any>('app.logging')]);
    app.useGlobalPipes(new ValidationPipe(logger));
    // app.useGlobalInterceptors(new RequestLimitInspector());
    app.useGlobalInterceptors(new UrlParserInspector());
    app.useGlobalInterceptors(new EmptyResponseInspector());
    app.useGlobalFilters(new AllExceptionsFilter());
    app.setGlobalPrefix(`${appConf.endpoint}/${appConf.version}`);
    app.enableCors({ origin: '*' });
    app.useStaticAssets('static');
  
    await app.listen(Number(appConf.http.port), appConf.http.host);
    logger.log(`Application is running on: ${await app.getUrl()}`);
  };
  
export const loadConfig = async () => {
 
};

export const startApp = async (mod: any, confPref: string) => {
  await loadConfig();
  const logger = new Logger(mod.name);
  const app = await NestFactory.create<NestExpressApplication>(mod, { logger });

  await server(app, mod, confPref);
};
  
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
import dotenv from 'dotenv';
import client from 'node-vault';
import fs from 'fs';
import path from 'path';

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
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

  const [env, endpoint, token] = [
    process.env['app.env'],
    process.env['VAULT_DEV_ENDPOINT'],
    process.env['VAULT_DEV_ROOT_TOKEN_ID'],
  ];

  // const vClientCreds = await client({ endpoint }).userpassLogin({ username, password });
  // const vClient = client({ endpoint, token: vClientCreds?.auth?.client_token });
  const vClient = client({ endpoint, token });
  /*await vClient.mount({ type: 'kv', mount_point: `kv/${env}/backend` });*/

  const vConfig = await vClient.read(`kv/data/${env}/backend`);
  fs.writeFileSync(path.resolve(process.cwd(), 'config', `config-${env}.json5`), vConfig?.data?.data.config);
};


export const startApp = async (mod: any, confPref: string) => {
  await loadConfig();
  const logger = new Logger(mod.name);
  const app = await NestFactory.create<NestExpressApplication>(mod, { logger });

  await server(app, mod, confPref);
};

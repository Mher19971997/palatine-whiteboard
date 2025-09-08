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
  // Подгружаем .env только если он существует
  const envPath = path.resolve(process.cwd(), './.env');
  if (fs.existsSync('.env')) {
    dotenv.config({ path: envPath });
  }

  // Если app.env не задан — дефолт 'prod'
  const env = process.env['APP_ENV'];
  const endpoint = process.env['VAULT_DEV_ENDPOINT'];
  const token = process.env['VAULT_DEV_ROOT_TOKEN_ID'];

  const vClient = client({ endpoint, token });

  let vConfig;
  try {
    vConfig = await vClient.read(`kv/data/${env}/backend`);
  } catch (err) {
    console.warn('Ошибка при чтении из Vault, используем пустой объект', err);
    vConfig = { data: { data: { config: '{}' } } };
  }

  const configStr = vConfig?.data?.data?.config;

  // === создаём config-dev.json5 или config-prod.json5 ===
  const cwd = process.cwd();
  const configDir = path.resolve(cwd, 'config');
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

  const configFile = path.resolve(configDir, `config-${env}.json5`);
  fs.writeFileSync(configFile, configStr, 'utf-8');
  console.log(`Файл создан: ${configFile}`);

  // === conf.json5 ===
  const options = { folder: 'config' };
  const confDir = path.resolve(cwd, options.folder);
  if (!fs.existsSync(confDir)) fs.mkdirSync(confDir, { recursive: true });

  const confFile = path.resolve(confDir, 'conf.json5');
  if (!fs.existsSync(confFile)) fs.writeFileSync(confFile, configStr, 'utf-8');
  console.log(`Файл создан: ${confFile}`);
};

export const startApp = async (mod: any, confPref: string) => {
  await loadConfig();
  const logger = new Logger(mod.name);
  const app = await NestFactory.create<NestExpressApplication>(mod, { logger });

  await server(app, mod, confPref);
};

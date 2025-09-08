# Use Node.js v20 as base
FROM node:20

RUN apt-get update && apt-get install -y bash

WORKDIR /app

# Копируем package.json и package-lock.json только
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем всё остальное (код + .env)
COPY . .

# Строим NestJS
RUN npm run build
RUN npm run vault:generate-config

# Открываем порт
EXPOSE 6001

# Запускаем миграции и приложение
CMD npm run migration:up && npm run start:prod

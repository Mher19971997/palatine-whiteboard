# Whiteboard Project

Проект Whiteboard использует стек: **Node.js/TypeScript backend**, **React frontend**, **PostgreSQL**, **Redis**, **Vault** для секретов и **Docker**.

---

## 🔹 Предварительные требования

- Docker & Docker Compose  
- Node.js >=18  
- npm или yarn  

---

## 🔹 Структура проекта

```
backend/
  docker-compose.vault.yml
  docker-compose.yml
  vault/
  init.sql
frontend/
.env
README.md
```

---

## 🔹 Настройка окружения

Создай `.env` файл в корне проекта:

```env
app.env=dev
VAULT_DEV_ENDPOINT=http://vault:8200
VAULT_DEV_ROOT_TOKEN_ID=root-token
VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200
REDIS_PASSWORD=rB4dRlyn38F75Sg13Xd5iNM1wf
POSTGRES_DB=palatine_whiteboard
POSTGRES_USER=whiteboard
POSTGRES_PASSWORD=Sg13Xd5iNM1wfSYZY708gh
VITE_API_URL=http://backend:6001/api/v1/
VITE_SOCKET_API_URL=http://backend:6001
```

---

## 🔹 Запуск Vault

1. Запусти Vault в dev-режиме с UI:

```bash
docker-compose -f docker-compose.vault.yml up -d
```

2. Открой UI Vault: [http://localhost:8200/ui](http://localhost:8200/ui)

---

## 🔹 Видео-демо: Добавление конфига в Vault

[![Смотреть видео](assets/demo/vault-preview.png)](assets/demo/vault.mp4)

  
```json
{
  "app": {
    "env": "local",
    "name": "app",
    "logging": "debug"
  },
  "app-api": {
    "version": "v1",
    "endpoint": "/api",
    "http": {
      "port": 6001
    }
  },
  "transports": ["http", "tcp"],
  "db": {
    "postgres": {
      "url": "postgresql://whiteboard:Sg13Xd5iNM1wfSYZY708gh@postgres:5432/palatine_whiteboard",
      "logging": "debug",
      "dialect": "postgres",
      "database": "palatine_whiteboard",
      "repositoryMode": true,
      "retryDelay": 100,
      "retryAttempts": 1000,
      "autoLoadModels": true,
      "synchronize": false,
      "benchmark": true,
      "pool": {
        "min": 0,
        "max": 15,
        "idle": 0,
        "evict": 0
      }
    },
    "redis": {
      "url": "redis://:rB4dRlyn38F75Sg13Xd5iNM1wf@redis:6379/1"
    }
  },
  "crypto": {
    "pbkdf2": {
      "iterations": 1000,
      "keylen": 513,
      "digest": "sha512",
      "secret": "qwerqyuiqpasdqgqwerghjkmnnbvchjklzqcvbnm1234567890-=[];',./"
    },
    "cipheriv": {
      "algorithm": "aes-256-ctr",
      "key": "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3",
      "iv": "aecefb6794c7974085fb61aa86cccb3c"
    },
    "jwt": {
      "secret": "vOVH6sdmpaWjRRIqCardxsaa01lwHzfr3.aecefb679scx974085fb61ac8ccecb3c",
      "extraOptions": {
        "shortExpiresIn": "1 d",
        "longExpiresIn": "30 d"
      },
      "signOptions": {
        "algorithm": "HS256",
        "expiresIn": "365 d"
      }
    }
  },
  "service": {}
}
```

4. Сохрани секрет. Теперь он будет доступен через Vault UI.

---

## 🔹 Запуск базы данных и кэша

```bash
docker-compose -f docker-compose.yml up -d
```

Для инициализации PostgreSQL:

```bash
docker exec -i <postgres_container_name> psql -U whiteboard -d palatine_whiteboard -f init.sql
```

---

## 🔹 Запуск Backend

```bash
cd backend
npm install
npm run dev
# или
yarn install
yarn dev
```

Backend: `http://localhost:6001/api/v1/`

---

## 🔹 Запуск Frontend

```bash
cd frontend
npm install
npm run dev
# или
yarn install
yarn dev
```

Frontend: `http://localhost:5173`

---

## 🔹 Полезные команды

```bash
# Проверка контейнеров
docker ps

# Перезапуск всех сервисов
docker-compose -f docker-compose.yml up -d --build

# Остановка сервисов
docker-compose -f docker-compose.yml down

# Проверка логов Vault
docker logs vault -f
```


# Используем официальный Node.js
FROM node:20

# Рабочая директория
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все исходники
COPY . .

# Копируем .env
COPY .env .env

# Открываем порт 3000
EXPOSE 3000

# Запуск Vite dev server на 0.0.0.0:3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

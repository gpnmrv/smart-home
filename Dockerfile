# Стадия сборки
FROM node:18-alpine AS build-stage
WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Стадия продакшена
FROM nginx:alpine AS production-stage
RUN rm -rf /usr/share/nginx/html/*

# Копируем собранное приложение
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/health || exit 1

# Проверка конфигурации Nginx
RUN nginx -t

# Открываем порт и запускаем Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
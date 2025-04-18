#!/bin/bash

LOG_FILE="/var/log/deploy.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_error() {
  if [ $? -ne 0 ]; then
    log "Ошибка: $1"
    exit 1
  fi
}

log "Начало деплоя VPN by Oxy"

cd ~/app || {
  log "Ошибка: Не удалось перейти в директорию ~/app"
  exit 1
}

log "Обновление кода из ветки production"
git pull origin production
check_error "Не удалось обновить код из ветки production"

log "Установка зависимостей в корне проекта"
yarn install --frozen-lockfile
check_error "Не удалось установить корневые зависимости"

log "Деплой фронтенда"
cd packages/frontend || {
  log "Ошибка: Не удалось перейти в директорию packages/frontend"
  exit 1
}

log "Очистка старых файлов фронтенда в /var/www/frontend"
sudo rm -rf /var/www/frontend/*
check_error "Не удалось очистить /var/www/frontend"

log "Копирование готового билда фронтенда в /var/www/frontend"
sudo cp -r dist/* /var/www/frontend
check_error "Не удалось скопировать билд фронтенда в /var/www/frontend"

log "Настройка прав доступа для /var/www/frontend"
sudo chown -R www-data:www-data /var/www/frontend
sudo chmod -R 755 /var/www/frontend
check_error "Не удалось настроить права доступа для /var/www/frontend"

log "Деплой бэкенда"
cd ../backend || {
  log "Ошибка: Не удалось перейти в директорию packages/backend"
  exit 1
}

log "Установка зависимостей бэкенда"
yarn install --frozen-lockfile
check_error "Не удалось установить зависимости бэкенда"

log "Генерация клиента Prisma"
yarn prisma generate
check_error "Не удалось сгенерировать клиент Prisma"

log "Синхронизация базы данных через Prisma"
yarn prisma db pull
check_error "Не удалось выполнить синхронизацию базы данных"

log "Перезапуск процесса бэкенда в PM2"
pm2 reload ecosystem.config.js --env production
check_error "Не удалось перезапустить процесс бэкенда в PM2"

log "Проверка конфигурации Nginx"
sudo nginx -t
check_error "Ошибка в конфигурации Nginx"

log "Перезапуск Nginx"
sudo systemctl restart nginx
check_error "Не удалось перезапустить Nginx"

log "Проверка статуса PM2"
pm2 list | tee -a "$LOG_FILE"

log "Проверка статуса Nginx"
sudo systemctl status nginx --no-pager | tee -a "$LOG_FILE"

log "Деплой успешно завершён"
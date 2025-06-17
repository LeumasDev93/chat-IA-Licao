# Etapa 1: build do projeto
FROM node:18 AS builder

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Etapa 2: produção com Chromium para Puppeteer
FROM node:18-slim

# Instalar dependências do Chromium
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  && rm -rf /var/lib/apt/lists/*

# Dica para Puppeteer encontrar o Chromium no sistema
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Preparar diretório do app
WORKDIR /app
COPY --from=builder /app ./

# Instalar apenas dependências de produção
RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "start"]

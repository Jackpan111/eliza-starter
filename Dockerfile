# === builder stage ===
FROM node:23.3.0-slim AS builder

# zainstaluj pnpm i narzędzia systemowe
RUN npm install -g pnpm@9.15.1 \
 && apt-get update \
 && apt-get install -y git python3 make g++ \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# skopiuj pliki projektu
COPY package.json        ./
COPY pnpm-lock.yaml      ./
COPY tsconfig.json       ./
COPY ./src               ./src
COPY ./characters        ./characters
COPY ./agent-sdk         ./agent-sdk

# zainstaluj zależności i zbuduj
RUN pnpm install
RUN pnpm run build:chat

# === final stage ===
FROM node:23.3.0-slim

WORKDIR /app
COPY --from=builder /app/dist      ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

CMD ["node", "dist/chat-server.js", "--non-interactive"]
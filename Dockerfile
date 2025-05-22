# Stage 1: build
FROM node:23.3.0-slim AS builder

# Zainstaluj pnpm i narzędzia systemowe
RUN npm install -g pnpm@9.15.1 \
  && apt-get update \
  && apt-get install -y git python3 make g++ \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Skopiuj najpierw manifesty i lokalny SDK
COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY ./agent-sdk ./agent-sdk

# Skopiuj kod źródłowy i dodatkowe zasoby
COPY ./src ./src
COPY ./characters ./characters

# Zainstaluj zależności (teraz uwzględniają local:./agent-sdk)
RUN pnpm install

# Zbuduj chat-server
RUN pnpm run build:chat

# Stage 2: runtime
FROM node:23.3.0-slim

RUN npm install -g pnpm@9.15.1 \
  && apt-get update \
  && apt-get install -y git python3 \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Przenieś node_modules i skompilowany kod z buildera
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/agent-sdk ./agent-sdk
COPY --from=builder /app/characters ./characters

CMD ["node", "dist/chat-server.js", "--non-interactive"]
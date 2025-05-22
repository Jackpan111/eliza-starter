# Stage 1: build
FROM node:23.3.0-slim AS builder

RUN npm install -g pnpm@9.15.1 \
  && apt-get update \
  && apt-get install -y git python3 make g++ \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY ./src ./src
COPY ./characters ./characters

RUN pnpm install
RUN pnpm build

# Stage 2: runtime
FROM node:23.3.0-slim

RUN npm install -g pnpm@9.15.1 \
  && apt-get update \
  && apt-get install -y git python3 \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/characters ./characters
COPY package.json pnpm-lock.yaml ./

CMD ["node", "dist/chat-server.js", "--non-interactive"]

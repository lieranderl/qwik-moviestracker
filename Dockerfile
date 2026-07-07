ARG BUN_VERSION=1.3.11

FROM oven/bun:${BUN_VERSION} AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM oven/bun:${BUN_VERSION} AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM oven/bun:${BUN_VERSION} AS prod-deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:${BUN_VERSION}-distroless
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=prod-deps /app/node_modules ./node_modules

CMD ["server/entry.bun.js"]

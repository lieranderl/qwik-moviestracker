# syntax=docker/dockerfile:1
ARG BUN_VERSION=1.3.14

FROM --platform=$BUILDPLATFORM oven/bun:${BUN_VERSION} AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache \
	bun install --frozen-lockfile

FROM --platform=$BUILDPLATFORM oven/bun:${BUN_VERSION} AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM --platform=$BUILDPLATFORM oven/bun:${BUN_VERSION} AS prod-deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache \
	bun install --frozen-lockfile --production --ignore-scripts

FROM oven/bun:${BUN_VERSION}-distroless AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=prod-deps --chown=65532:65532 /app/node_modules ./node_modules
COPY --from=build --chown=65532:65532 /app/dist ./dist
COPY --from=build --chown=65532:65532 /app/public ./public
COPY --from=build --chown=65532:65532 /app/server ./server

USER 65532:65532
EXPOSE 3000

CMD ["server/entry.bun.js"]

# syntax=docker/dockerfile:1
ARG BUN_IMAGE=oven/bun:1.3.14@sha256:e10577f0db68676a7024391c6e5cb4b879ebd17188ab750cf10024a6d700e5c4
ARG BUN_RUNTIME_IMAGE=oven/bun:1.3.14-distroless@sha256:c28c51287af70bab8e0b66fc4b6a30cfb92a727ebc88045223adc9f4c9d09307

FROM --platform=$BUILDPLATFORM ${BUN_IMAGE} AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache \
	bun install --frozen-lockfile

FROM --platform=$BUILDPLATFORM ${BUN_IMAGE} AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM --platform=$BUILDPLATFORM ${BUN_IMAGE} AS prod-deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache \
	bun install --frozen-lockfile --production --ignore-scripts

FROM ${BUN_RUNTIME_IMAGE} AS runtime
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

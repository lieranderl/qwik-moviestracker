FROM node:18-bullseye-slim AS build-server
ARG VITE_TMDB_API_KEY
ARG VITE_GC_API_KEY
ARG VITE_FIREBASE_CONFIG
ARG AUTH_SECRET
ARG GOOGLE_SECRET
ENV VITE_TMDB_API_KEY=$VITE_TMDB_API_KEY
ENV VITE_GC_API_KEY=$VITE_GC_API_KEY
ENV VITE_FIREBASE_CONFIG=$VITE_FIREBASE_CONFIG
ENV AUTH_SECRET=$AUTH_SECRET
ENV GOOGLE_ID=695761327713-fmfiitn3og9cgd76dhogaupqtm8n23v5.apps.googleusercontent.com
ENV GOOGLE_SECRET=$GOOGLE_SECRET
COPY src /app/src
COPY package.json /app/package.json
COPY public /app/public
COPY adapters /app/adapters
COPY tsconfig.json /app/tsconfig.json
COPY vite.config.ts /app/vite.config.ts
COPY postcss.config.js /app/postcss.config.js
COPY .eslintrc.cjs /app/.eslintrc.cjs
COPY .eslintignore /app/.eslintignore

WORKDIR /app
RUN npm install -g pnpm
RUN pnpm i --force
RUN pnpm run build

FROM node:18-bullseye-slim AS build-env
COPY --from=build-server dist /app/dist
COPY --from=build-server server /app/server
COPY --from=build-server package.json /app/package.json
COPY --from=build-server public /app/public

WORKDIR /app

RUN npm install -g pnpm
RUN pnpm i --force


# A light-weight image for running the app
FROM gcr.io/distroless/nodejs18-debian11

COPY --from=build-env /app /app
WORKDIR /app

CMD ["server/entry.cloud-run.js"]

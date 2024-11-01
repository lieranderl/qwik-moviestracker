FROM node:20-bullseye-slim AS build-env
COPY dist /app/dist
COPY server /app/server
COPY package.json /app/package.json
COPY public /app/public

WORKDIR /app

RUN npm i --force

# A light-weight image for running the app
FROM gcr.io/distroless/nodejs20-debian11

COPY --from=build-env /app /app
WORKDIR /app

CMD ["server/entry.cloud-run.js"]

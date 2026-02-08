# Stage 1: Building the application
FROM node:23-bookworm-slim AS build
# Set the working directory
WORKDIR /app
ENV NODE_ENV=production
ARG TMDB_API_KEY
ARG GC_API_KEY
ARG VITE_FIREBASE_CONFIG
ARG GOOGLE_SECRET
ARG AUTH_SECRET
ARG MONGO_URI
ENV TMDB_API_KEY=$TMDB_API_KEY
ENV GC_API_KEY=$GC_API_KEY
ENV VITE_FIREBASE_CONFIG=$VITE_FIREBASE_CONFIG
ENV GOOGLE_SECRET=$GOOGLE_SECRET
ENV AUTH_SECRET=$AUTH_SECRET
ENV MONGO_URI=$MONGO_URI

# Install Bun package manager
RUN npm install -g bun
# Copy package.json and bun.lockb (if available) for dependency installation
COPY package.json /app/
# Install project dependencies
RUN bun install
# Copy only necessary files for the build
COPY . .
# Build the application
RUN bun run build
# A light-weight image for running the app
FROM oven/bun:distroless
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/node_modules ./node_modules

CMD ["server/entry.bun.js"]

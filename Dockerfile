# Stage 1: Building the application
FROM node:23-bookworm-slim AS build
# Set the working directory
WORKDIR /app
ENV NODE_ENV=production

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

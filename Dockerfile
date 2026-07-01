FROM node:24-alpine AS build

RUN apk add --no-cache python3 make g++

WORKDIR /app

# Coolify injects NODE_ENV=production at build time — force dev deps for ace/vite/tsc.
ARG NODE_ENV=development
ENV NODE_ENV=development
ENV NPM_CONFIG_PRODUCTION=false

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
COPY docker/.env.build .env

RUN node ace build --ignore-ts-errors

# Install production deps inside build output (native modules e.g. better-sqlite3 need g++).
WORKDIR /app/build
RUN npm ci --omit=dev

FROM node:24-alpine AS production

RUN apk add --no-cache dumb-init wget curl

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S adonis && adduser -S adonis -G adonis

COPY --from=build --chown=adonis:adonis /app/build ./

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
  && mkdir -p storage/app/documents storage/app/report-templates tmp/sessions \
  && chown -R adonis:adonis storage tmp

USER adonis

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=30s \
  CMD curl -sf http://127.0.0.1:${PORT:-3333}/health || exit 1

ENTRYPOINT ["dumb-init", "/entrypoint.sh"]
CMD ["node", "bin/server.js"]

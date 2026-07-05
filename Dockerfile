FROM node:24-alpine AS build

RUN apk add --no-cache python3 make g++

WORKDIR /app

# Coolify injects NODE_ENV=production at build time — inline env + --include=dev
# so devDependencies install even when build args/env override Dockerfile ENV.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    NODE_ENV=development NPM_CONFIG_PRODUCTION=false npm ci --include=dev --no-audit --no-fund

COPY . .
COPY docker/.env.build .env

# Cap heap only for ace build; 1536MB leaves room for gcc/vite on small Coolify hosts.
RUN NODE_ENV=development NODE_OPTIONS="--max-old-space-size=1536" node ace build --ignore-ts-errors

# Install production deps inside build output (native modules e.g. better-sqlite3 need g++).
WORKDIR /app/build
RUN NODE_ENV=production npm ci --omit=dev --no-audit --no-fund || \
  (sleep 5 && NODE_ENV=production npm ci --omit=dev --no-audit --no-fund)

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

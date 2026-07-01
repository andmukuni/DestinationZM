FROM node:24-alpine AS build

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN node ace build --ignore-ts-errors

FROM node:24-alpine AS production

RUN apk add --no-cache dumb-init wget

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/build ./
RUN npm ci --omit=dev

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
  && mkdir -p storage/app/documents storage/app/report-templates tmp/sessions \
  && addgroup -S adonis && adduser -S adonis -G adonis \
  && chown -R adonis:adonis /app

USER adonis

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3333}/health || exit 1

ENTRYPOINT ["dumb-init", "/entrypoint.sh"]
CMD ["node", "bin/server.js"]

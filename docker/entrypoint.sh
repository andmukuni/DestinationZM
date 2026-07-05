#!/bin/sh
set -e

mkdir -p storage/app/documents storage/app/report-templates tmp/sessions

# Drop build-time localhost APP_URL so Coolify SERVICE_URL_APP can apply at runtime.
case "${APP_URL:-}" in
  http://localhost:*|https://localhost:*|http://127.0.0.1:*|https://127.0.0.1:*)
    unset APP_URL
    ;;
esac

if [ "$RUN_MIGRATIONS" = "true" ]; then
  node ace migration:run --force
  node ace db:seed --files database/seeders/10_accommodations_seeder.ts
fi

exec "$@"

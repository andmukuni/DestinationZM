#!/bin/sh
set -e

mkdir -p storage/app/documents storage/app/report-templates tmp/sessions

if [ "$RUN_MIGRATIONS" = "true" ]; then
  node ace migration:run --force
fi

exec "$@"

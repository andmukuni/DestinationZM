# DestinationZM — Coolify Deployment

Deploy DestinationZM as a single Docker container on [Coolify](https://coolify.io), connecting to external MySQL and Redis services.

## Architecture

```
Browser → Coolify (HTTPS) → App container :3333 → MySQL + Redis (external)
                              ↓
                    Volumes: /app/storage, /app/tmp
```

The app container does **not** include MySQL or Redis. Point environment variables at your existing remote services.

## Prerequisites

- Coolify server with Docker
- Git repository connected to Coolify
- External MySQL database (migrations already applied)
- External Redis instance (ACL auth supported via `REDIS_USERNAME`)
- Network access from Coolify server to MySQL and Redis ports

## Coolify setup

### 1. Create application

1. In Coolify: **New Resource** → **Application**
2. Connect your Git repository
3. **Build Pack**: Dockerfile (or Docker Compose — both work; compose no longer binds host port 3333)
4. **Dockerfile location**: `Dockerfile` (repo root)
5. **Port Exposes**: `3333` (container port — Coolify proxy handles public HTTPS)

### 2. Health check

| Setting | Value |
|---------|-------|
| Path | `/health` |
| Port | `3333` |
| Expected response | `{"status":"ok"}` |

### 3. Persistent storage

Mount these paths so uploads and sessions survive redeploys:

| Container path | Purpose |
|----------------|---------|
| `/app/storage` | Uploaded documents, report templates |
| `/app/tmp` | File-based sessions (`SESSION_DRIVER=file`) |

In Coolify: **Storages** → add both paths as persistent volumes.

### 4. Environment variables

Set all variables in the Coolify UI. **Do not commit secrets to Git.**

Coolify auto-generates `SERVICE_URL_APP` and `SERVICE_FQDN_APP`. The app uses `SERVICE_URL_APP` as `APP_URL` when `APP_URL` is not set. See [coolify-env.example](./coolify-env.example) for a full copy-paste template.

#### Required

| Variable | Example | Notes |
|----------|---------|-------|
| `NODE_ENV` | `production` | |
| `HOST` | `0.0.0.0` | Must bind all interfaces in container |
| `PORT` | `3333` | Must match exposed port |
| `TZ` | `UTC` | |
| `LOG_LEVEL` | `info` | |
| `APP_KEY` | *(generate)* | Run `node ace generate:key` locally; keep stable across redeploys |
| `APP_URL` | `http://vikwerqjk3n08u5bjy2uwqok.13.140.178.28.sslip.io` | Public URL (no trailing slash). Optional if `SERVICE_URL_APP` is set. |
| `SESSION_DRIVER` | `file` | Requires `/app/tmp` volume |
| `DB_HOST` | `13.140.178.27` | External MySQL host |
| `DB_PORT` | `3310` | |
| `DB_USER` | `mysql` | |
| `DB_PASSWORD` | *(secret)* | |
| `DB_DATABASE` | `default` | |
| `REDIS_HOST` | `13.140.178.27` | External Redis host |
| `REDIS_PORT` | `6378` | |
| `REDIS_USERNAME` | `default` | Required for Redis ACL auth |
| `REDIS_PASSWORD` | *(secret)* | |

#### Optional

| Variable | Example | Notes |
|----------|---------|-------|
| `RUN_MIGRATIONS` | `true` | Run `migration:run --force` on container start. Set `true` on first deploy or after schema changes; disable afterward if preferred. |
| `QUICKBOOKS_*` | | Fallback only — credentials are stored in Settings UI |

### 5. Deploy

1. Save environment variables
2. Deploy the application
3. Confirm health check is green
4. Visit `http://vikwerqjk3n08u5bjy2uwqok.13.140.178.28.sslip.io/login`

### 6. Post-deploy

- **QuickBooks OAuth**: update redirect URI in the Intuit developer portal to `http://vikwerqjk3n08u5bjy2uwqok.13.140.178.28.sslip.io/settings/quickbooks/callback`
- **SMTP / SMS / WhatsApp**: configure via **Settings** in the admin UI (stored in database)
- **Seed data**: if the database is empty, run seeders manually or set `RUN_MIGRATIONS=true` and exec into the container:

  ```bash
  node ace db:seed
  ```

## Local Docker testing

Before deploying to Coolify, smoke-test the image locally:

```bash
# Build
docker build -t destination-zm .

# Create a local env file (gitignored)
cp .env.example .env.production
# Edit .env.production: set HOST=0.0.0.0, NODE_ENV=production, remote DB/Redis values

# Run
docker run --env-file .env.production -p 3333:3333 destination-zm

# Or with docker-compose (includes persistent volumes)
docker compose -f docker-compose.local.yml up --build
```

Verify:

```bash
curl http://localhost:3333/health
# → {"status":"ok"}
```

## Build details

The multi-stage Dockerfile:

1. **Build stage**: installs dependencies, runs `node ace build --ignore-ts-errors` (includes Vite asset compilation)
2. **Production stage**: copies compiled output, installs production deps only, runs as non-root `adonis` user

Entrypoint (`docker/entrypoint.sh`):

- Ensures storage/tmp directories exist
- Optionally runs migrations when `RUN_MIGRATIONS=true`
- Starts `node bin/server.js`

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `Bind for 0.0.0.0:3333 failed: port is already allocated` | Another container or app on the server already uses host port 3333 | Redeploy after pulling latest `docker-compose.yml` (no host port bind). Or stop the other service using 3333. In Coolify, only set **Port Exposes** to `3333` (container port) — do not add a duplicate host port mapping. |
| Exited (10x restarts) | Missing required env vars (`APP_KEY`, `DB_*`, `REDIS_*`, `HOST`) | Paste full template from [coolify-env.example](./coolify-env.example) into Coolify Environment Variables |
| Health check fails | App not binding to `0.0.0.0` | Set `HOST=0.0.0.0` |
| 502 from Coolify | Wrong port | Expose port `3333` |
| DB connection refused | Firewall / wrong host | Verify Coolify server can reach MySQL port |
| Redis auth error | Missing username | Set `REDIS_USERNAME=default` |
| Sessions lost on redeploy | No tmp volume | Mount `/app/tmp` |
| Uploads missing | No storage volume | Mount `/app/storage` |
| Assets 404 | Build failed | Check Coolify build logs; ensure `node ace build` succeeded |
| Cookies not set | Wrong APP_URL | Must match public HTTPS URL exactly |

## Security

- Store all secrets in Coolify environment variables only
- Rotate DB and Redis passwords if they were ever exposed
- Keep `APP_KEY` stable — changing it invalidates encrypted sessions and cookies
- Use HTTPS via Coolify's built-in SSL (Let's Encrypt)

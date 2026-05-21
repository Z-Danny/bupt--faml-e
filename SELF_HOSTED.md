# Self-hosted deployment

This branch removes the managed backend dependency from the browser app.

Runtime layout:

- `web`: Vite build served by Nginx on `127.0.0.1:8081`
- `api`: Node/Express API on `127.0.0.1:8787`
- `db`: PostgreSQL on `127.0.0.1:5432`
- global Caddy routes `famlee.zdanny.cn` to `web`, `/api/*`, and `/uploads/*`

Required production secrets:

```env
POSTGRES_PASSWORD=
DATABASE_URL=
JWT_SECRET=
PUBLIC_BASE_URL=https://famlee.zdanny.cn
DOUBAO_API_KEY=
DOUBAO_MODEL=
```

Deploy:

```bash
cp .env.production.example .env.production
# edit .env.production
docker compose up -d --build
```

Caddy route:

```caddyfile
famlee.zdanny.cn {
  reverse_proxy /api/* 127.0.0.1:8787
  reverse_proxy /uploads/* 127.0.0.1:8787
  reverse_proxy 127.0.0.1:8081
}
```

# Cloudflare quick tunnel

Exposes the local FastAPI app on a free temporary public URL (`*.trycloudflare.com`).

No Cloudflare account, login, DNS, or paid plan required. The URL changes each time you start the tunnel.

## Prerequisites

- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) (`brew install cloudflared`)
- Local Postgres with `DATABASE_URL` set (see `../.envrc`)

## Usage

**Two terminals:**

```bash
make run
make tunnel
```

**Or one command:**

```bash
make run-public
```

`cloudflared` prints a URL like:

```text
https://random-words.trycloudflare.com
```

Share that base URL with others while the process is running:

- API: `https://....trycloudflare.com`
- Swagger: `https://....trycloudflare.com/docs`
- Health: `https://....trycloudflare.com/health/db`

Stop the tunnel (Ctrl+C) to take the public URL offline.

## Optional env

| Variable | Default |
|----------|---------|
| `CLOUDFLARE_LOCAL_URL` | `http://127.0.0.1:8000` |

## Notes

- Quick tunnels are for local dev/demo only — not for production.
- There is no auth on the API yet; anyone with the URL can call it while the tunnel is up.
- Browser front-ends on other origins may need CORS in `main.py`.

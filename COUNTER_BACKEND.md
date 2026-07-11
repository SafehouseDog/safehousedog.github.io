# Shared 1999-signal gate

GitHub Pages cannot securely increment a global counter. The frontend therefore calls the Cloudflare Worker in `api-worker/`.

## Formula

```text
combined signals = accepted Pass 1 completions + verified whole-USDT credits
```

The Worker returns both the unclamped `rawCombined` and the UI value capped at the 1999 target.

## Abuse controls

The completion flow is:

1. the first matrix interaction requests a one-time challenge;
2. the challenge is bound to a pseudonymous browser client hash;
3. a minimum solve time and movement count are enforced;
4. the completed browser state produces a challenge-bound SHA-256 proof;
5. Cloudflare Turnstile is verified server-side;
6. D1 enforces one completion per case/client hash and one-time challenge use;
7. a daily HMAC network cap adds abuse resistance without storing raw IP addresses.

The code never uses IP as the sole identity. Households and shared networks can still contribute up to the configured daily cap.

## Deploy

```bash
cd api-worker
cp wrangler.toml.example wrangler.toml
npm install
npx wrangler login
npx wrangler d1 create last-safe-house-counter
# Insert the returned database_id in wrangler.toml.
npx wrangler d1 execute last-safe-house-counter --remote --file=schema.sql
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put HASH_PEPPER
npx wrangler deploy
```

Create a Turnstile widget for the production hostname and put only its **public site key** in `data/site.json`. The secret belongs exclusively in the Worker.

## Custom API hostname

Route the Worker to:

```text
api.whiteduck.online/*
```

or use the generated `workers.dev` URL in `progress.apiUrl`.

If the API hostname is not `https://api.whiteduck.online`, also edit the `connect-src` directive in the Content-Security-Policy meta tag in `index.html`; otherwise the browser will block the request before CORS is evaluated.

Add every browser origin to `ALLOWED_ORIGINS`, including the final GitHub Pages origin if the custom domain is not active yet.

## Record donation credits

The endpoint sets the current total of verified whole-USDT credits:

```bash
cd api-worker
export API_URL='https://api.whiteduck.online'
export ADMIN_TOKEN='your-secret'
./scripts/set-donations.sh 1000
```

A total of `1000` donation credits plus `999` unique accepted completions opens Pass 2.

## Production checklist

- `REQUIRE_TURNSTILE = "true"`
- `HASH_PEPPER` is long and random
- `ADMIN_TOKEN` is long and random
- `TURNSTILE_SECRET` is never committed
- D1 schema applied remotely
- frontend site key configured
- API origin allowed by CSP and Worker CORS
- `/v1/progress` returns valid JSON
- local `?dev=1` solves do not affect production totals

## Honest limitation

A determined attacker can automate a public browser puzzle and obtain new browser identities. The backend makes elementary counter manipulation and mass replay substantially harder, while preserving anonymous participation. It is not equivalent to identity verification, and it deliberately avoids registrations, emails, or passport-style gates.

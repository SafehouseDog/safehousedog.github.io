# Production deployment checklist

## Frontend / GitHub Pages

- [ ] Put the frontend root files in the repository root.
- [ ] Keep `CNAME` as `whiteduck.online`, or edit/remove it for another hostname.
- [ ] Add MP3 files `01`–`14` using the exact names in `README.md`.
- [ ] Encrypt Track 15 into `audio/15_final.enc`; never commit the plaintext source.
- [ ] Verify the four wallet addresses and QR images with small test transfers.
- [ ] Enable GitHub Pages from `main / root`.

## Counter Worker

- [ ] Create the D1 database and put its ID in `api-worker/wrangler.toml`.
- [ ] Apply `api-worker/schema.sql` remotely.
- [ ] Create a Turnstile widget for the production site.
- [ ] Set Worker secrets: `TURNSTILE_SECRET`, `ADMIN_TOKEN`, `HASH_PEPPER`.
- [ ] Keep `REQUIRE_TURNSTILE = "true"` in production.
- [ ] Set `ALLOWED_ORIGINS` to the custom domain and any temporary Pages domain.
- [ ] Deploy the Worker and route `api.whiteduck.online/*`, or use its `workers.dev` URL.

## Connect frontend to backend

- [ ] Put the public Turnstile site key into `data/site.json`.
- [ ] Put the Worker origin into `data/site.json → progress.apiUrl`.
- [ ] If the Worker uses another origin, add it to `connect-src` in `index.html` CSP.
- [ ] Regenerate `js/data.js` after changing `data/site.json`.

## Smoke test

- [ ] `GET https://api.whiteduck.online/health` returns `{ "ok": true }`.
- [ ] `GET https://api.whiteduck.online/v1/progress` returns the public totals.
- [ ] EN/RU buttons translate UI and terminal text; matrix glyphs do not change.
- [ ] Pass 1 unlocks encrypted Track 15.
- [ ] A verified Pass 1 completion adds exactly one public signal.
- [ ] Repeating Pass 1 from the same anonymous browser does not add another signal.
- [ ] Pass 2 remains sealed below 1999 and opens globally at 1999.
- [ ] Passenger Audit starts after 75 active playback seconds or 7 matrix moves.
- [ ] Lyrics/carrier phrases do not overwrite active terminal input or audit questions.
- [ ] `?dev=1` controls work only locally and never change production totals.

## Donation credits

Update the **total** verified whole-USDT credit:

```bash
cd api-worker
export API_URL='https://api.whiteduck.online'
export ADMIN_TOKEN='...'
./scripts/set-donations.sh 1000
```

The public formula is:

```text
unique accepted Pass 1 completions + verified whole-USDT credits >= 1999
```

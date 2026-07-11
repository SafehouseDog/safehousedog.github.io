# THE LAST SAFE HOUSE — v29 bilingual public gate

GitHub Pages frontend for Case 001 / Follow White Duck.

This build preserves the existing radio, 37-column matrix, encrypted Track 15, hidden operator route, tone controls, donation routes, watcher, signal band, encrypted oracle, and Passenger Audit. It adds:

- English / Russian interface switching;
- Russian site and terminal/oracle text while the matrix/code letters remain unchanged;
- a shared `1999`-signal gate;
- `1 verified Pass 1 completion = 1 signal`;
- `1 whole verified USDT = 1 signal`;
- Pass 2 opens globally when the combined total reaches `1999`;
- a persistent, self-starting Passenger Audit after `75` active listening seconds or `7` matrix moves;
- a Cloudflare Worker + D1 + Turnstile counter backend that prevents trivial localStorage/DevTools counter inflation.

## Local frontend test

```bash
python3 -m http.server 8080
```

Open:

```text
http://localhost:8080
```

Local-only test helpers:

```text
http://localhost:8080/?dev=1
```

Local dev solves intentionally do **not** increment the production counter. The dev panel also includes an **open public gate** button so Pass 2 can be tested without touching production totals.

## GitHub Pages

Put the frontend files in the repository root and enable Pages from `main / root`. This package includes `CNAME` for `whiteduck.online`; remove or edit it if you deploy under another hostname.

The global counter is not hosted by GitHub Pages. Deploy `api-worker/` separately and point `data/site.json → progress.apiUrl` to it. See [`COUNTER_BACKEND.md`](COUNTER_BACKEND.md).

## Audio files expected

```text
audio/01_inspect_the_lock.mp3
audio/02_more_then_the_key.mp3
audio/03_without_even_realizing_it.mp3
audio/04_may_be_a_vision.mp3
audio/05_the_gate_is_a_mirror.mp3
audio/06_duck.mp3
audio/07_coordinates.mp3
audio/08_code_speaks.mp3
audio/09_the_loudest_line.mp3
audio/10_lock_the_door.mp3
audio/11_timed.mp3
audio/12_data_sold.mp3
audio/13_without_a_face.mp3
audio/14_discipline.mp3
```

Track 15 remains encrypted and joins the playlist only after Pass 1:

```bash
node tools/encrypt-final.mjs source/15_final.mp3 audio/15_final.enc
```

Commit `audio/15_final.enc`, never the plaintext source.

## Languages

- `js/i18n.js` contains site translations and Russian terminal/track display text.
- `data/oracle.en.enc` and `data/oracle.ru.enc` contain encrypted terminal/oracle maps.
- Matrix glyphs, puzzle key letters, routes, hashes, and raw code fragments are never translated.

See [`I18N.md`](I18N.md).

## Terminal timing

The Passenger Audit starts once per visit after either:

- 75 seconds of **active** playback, or
- 7 matrix moves.

The threshold is configurable in `data/site.json`. Once the user enters the terminal or the audit starts, lyric echoes and random carrier phrases no longer overwrite the conversation. The audit question remains persistent and a visible terminal beacon points back to it. Type `abort / exit / cancel` (or Russian equivalents) to leave the audit. A completed Passenger Audit receipt is restored from local storage on later visits.

## Public gate accounting

The browser only displays progress. The Worker is the source of truth.

```text
accepted Pass 1 completions + verified whole-USDT credits >= 1999
```

Donation credits are updated by the operator through an authenticated Worker endpoint. Exact blockchain indexing is intentionally not bundled into this version.

## Files to configure before production

1. `data/site.json`
   - `progress.apiUrl`
   - `progress.turnstileSiteKey`
   - wallet routes / URLs
2. `api-worker/wrangler.toml`
   - D1 database ID
   - allowed origins
3. Worker secrets
   - `TURNSTILE_SECRET`
   - `ADMIN_TOKEN`
   - `HASH_PEPPER`
4. Regenerate `js/data.js` after editing JSON data files.

## Security boundary

No public static site can make a global counter secure by “encrypting JavaScript.” Any browser-delivered rule can be inspected. This build moves durable accounting and human verification server-side; it prevents elementary edits to localStorage or DOM from changing the public total and raises the cost of automated abuse. It does not claim perfect proof of human intent.

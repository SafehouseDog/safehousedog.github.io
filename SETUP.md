# Frontend setup

## 1. Configure the site

Edit `data/site.json`:

```json
"progress": {
  "apiUrl": "https://api.whiteduck.online",
  "target": 1999,
  "turnstileSiteKey": "YOUR_PUBLIC_TURNSTILE_SITE_KEY",
  "autoAuditSeconds": 75,
  "autoAuditMatrixMoves": 7
}
```

Verify all wallet addresses and route warnings before publication. If you use a Worker URL other than `https://api.whiteduck.online`, add that origin to `connect-src` in the CSP meta tag in `index.html`.

## 2. Regenerate the bundled data file

After editing any file in `data/` except encrypted oracle packs:

```bash
python3 - <<'PY'
import json
from pathlib import Path
obj = {
  'nodes': json.load(open('data/nodes.json')),
  'tracks': json.load(open('data/tracks.json')),
  'lyrics': json.load(open('data/lyrics.json')),
  'quest': json.load(open('data/quest.json')),
  'site': json.load(open('data/site.json')),
}
Path('js/data.js').write_text('window.WDR_DATA = ' + json.dumps(obj, ensure_ascii=False, indent=2) + ';\n')
PY
```

## 3. Add audio

Use the exact filenames listed in `README.md`. Encrypt Track 15 with the included tool.

## 4. Test locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`. Use `?dev=1` for local controls: solve Pass 1, open the public 1999-signal gate, and test the route. These controls never submit production counter credits.

## 5. Deploy GitHub Pages

Copy the frontend root into a public repository and enable Pages from `main / root`.

## 6. Deploy the counter API

Follow `COUNTER_BACKEND.md`. The frontend remains usable if the counter API is offline, but Pass 2 stays globally sealed until an authenticated progress response reaches 1999.

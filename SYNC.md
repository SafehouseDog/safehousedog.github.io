# Subtitle sync

The site now uses exact cue times from `data/lyrics.json`. It does not stretch the lyric lines automatically.

If your final MP3 renders do not match the draft timing document, use the local sync lab:

```bash
python3 -m http.server 8080
```

Open:

```text
http://localhost:8080/?sync=1
```

Play a track. Press **tap cue** or **F8** at the first spoken word of each subtitle cue. Then press **save local** to test immediately, or **export** to download `lyrics.sync-overrides.json`.

To make the corrected sync permanent, copy the exported cue arrays into `data/lyrics.json` and `js/data.js`.

For seeking problems with MP3 files, re-encode the tracks to CBR MP3:

```bash
ffmpeg -i input.wav -ar 44100 -ac 2 -c:a libmp3lame -b:a 192k -write_xing 1 audio/01_inspect_the_lock.mp3
```

Some browsers, especially Safari, may refuse accurate seeking for MP3 files with broken or missing duration / Xing metadata.

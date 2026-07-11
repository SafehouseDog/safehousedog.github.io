# Terminal Oracle / Passenger Audit — bilingual encrypted packs

The public build contains only encrypted response maps:

```text
data/oracle.en.enc
data/oracle.ru.enc
data/oracle.enc      # English compatibility alias
```

The terminal is not an AI model. It combines:

- weighted keyword/intention matching;
- deterministic response variation;
- English and Russian response packs;
- a stateful Passenger Audit;
- traps, escape commands, break-loop mode, silence intervals, a water timer, and an open final koan.

## Automatic start

The audit starts after 75 active listening seconds or seven matrix moves, whichever comes first. Its question remains visible until the visitor responds. Once the terminal is active, lyrics and random signal fragments cannot interrupt it.

## Leaving the audit

Use ordinary exit language such as:

```text
abort / exit / cancel / quit
выход / отмена / стоп
```

## Encryption boundary

The pack is AES-GCM encrypted with a PBKDF2-derived key. This prevents casual direct reading of the JSON file but is an ARG layer, not a server secret: the browser must eventually decrypt any content it can display.

The hidden operator phrase remains separate. It is checked against salted SHA-256 hashes in `js/app.js` and does not appear in either oracle pack.

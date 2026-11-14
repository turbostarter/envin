---
"envin": patch
---

Fix `defineEnv` mutating `process.env` and the passed `env`/`envStrict` object when treating empty strings as missing. Empty values are now filtered into a copy, so frozen objects no longer throw.

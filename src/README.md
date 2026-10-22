# Source authority

The JavaScript embedded in each fresh workflow export is the authoritative deployed/draft implementation for that variant. `delivery-core.js` and `live-policy.js` are development source modules retained with their tests. `historical-v2/` preserves the earlier modular multi-portfolio/baseline implementation and its fixtures; it is not a replacement for the current live policy. Do not regenerate current workflows from historical modules.

The offline regression runner tests the actual exported node code. `python scripts/extract-code.py` optionally creates an ignored, readable code view without duplicating every bundled Code node in Git.

# Analyzer contract (current live policy)

The authoritative checks are embedded in B's **Deterministic validation** and the retained `src/live-policy.js`. This is a readable contract summary, not a replacement validator or a claim that JSON Schema alone authorizes a database write.

The extracted top-level object has exactly `schema_version`, `source_id`, `classification`, `events`, `non_trade_mentions`, `uncertainties`. Version is `2.1`; source must match the verified input. Classifications are `TRADE`, `NO_TRADE` and `UNCERTAIN`. There may be up to ten event candidates and up to twenty mentions/uncertainties.

Each event has exactly these keys:

| Field | Meaning |
| --- | --- |
| `ticker` | Exact reported symbol, including suffix; format and evidence checked |
| `company_name` | Identifiable name, otherwise null |
| `portfolio_label`, `portfolio_evidence_quote` | Reported portfolio and exact supporting text; deterministic alias map resolves identity |
| `reported_action`, `action` | Source wording and candidate OPEN/ADD/REDUCE/CLOSE, or null when not established |
| `announcement_date`, `announcement_timestamp` | Reported dates, not inferred execution timestamps |
| `evidence_quote` | Exact supporting substring; no invented transaction |
| `certainty`, `missing_fields`, `ambiguities` | Extraction confidence and explicit unresolved information |
| `reported_metadata` | Null or exactly allocation_percent, transaction_price, currency_symbol, currency_code; absent information remains null |

Non-trade mentions have exactly `ticker`, `reason`, `evidence_quote`. Interview/research mentions do not create trades. Reported prices/allocations are metadata, not independently verified market data. A portfolio label cannot be assigned arbitrarily when missing.

The validated return adds candidates, accepted events, observations, uncertainties, `review_required`, `validation` flags/issues and provenance hashes/version information. The validator can return `INVALID` even if the model labeled its output `TRADE`. Only deterministic eligibility plus C's historical-state validation permits a database update.

Dick-specific source policy includes owner-approved allocation/price shorthand and bare “sold” as full exit when the deterministic context rules allow it. Negation, hypothetical intent, interview context, conflicting actions, missing ticker/portfolio, unsupported evidence and historical state conflicts still block automatic application. No missing quantities, earlier holdings or trades are invented.


# Commands and data stores

## Discord commands

| Command | Handler and dependencies | Stored/read result |
| --- | --- | --- |
| `/positions` | D | Personal Current Positions plus import freshness; ephemeral, authorized user only |
| `/position-add` | D personal writer branch | Records a manual BUY, recalculates weighted-average cost, writes personal Sheets and verifies readback |
| `/position-sell` | D personal writer branch | Selects a held ticker, validates shares/price, records SELL, derives remaining shares and realized profit/loss |
| `/dicks-positions` | D creator read branch | Dick Capital's portfolio-specific baseline-backed and subsequent positions |
| `/history` | D creator history read | Recorded Dick Capital updates for the requested ticker, respecting portfolio/dataset identity |
| `/analyze` | D → A → B/C when eligible | Review/analysis status or one eligible notification; no-op when recent messages were already handled |
| `/brief` | D reads F's saved output | Most recent stored market briefing |
| `/news` | D reads F's article records | Recent news filtered by selected creator/source |

D authenticates the interaction, checks the allowed Discord user and guild, handles PING, acknowledges promptly, and returns private responses. It does not independently run every command's AI analysis. Outbound Discord webhooks cannot receive slash commands; the signed interaction endpoint in D is a separate mechanism.

Personal add/sell changes are recorded in Sheets. The relevant nodes are **Build personal transaction update → Write personal transaction → Read back personal transaction**, guarded by writer ownership and result verification. Stored valuation prices are imported/manual, not a continuous live quote feed. Currency fields remain in the data schema for historical integrity even when the current user-facing portfolio is USD-only.

## Existing Google Sheets

| Database | Link | Main tabs |
| --- | --- | --- |
| Creator positions | [Open creator database](https://docs.google.com/spreadsheets/d/1re2wClNHgrLDp8uSXF4Leb_TqPLV4jTW7OGxR2sKjqM/edit) | Sources, Trade History, Current Positions, Processing Log |
| Personal portfolio | [Open personal database](https://docs.google.com/spreadsheets/d/13eDJnuSS2Fq_1QSC3tEo8kYpUsyonyaB3ifrmjmibdc/edit) | Schema Notes, Import Log, Personal Trade History, Current Positions |
| Market intelligence | [Open news database](https://docs.google.com/spreadsheets/d/1-yhFwFQEUMf8f_6_6qkvtdSgoEbaDgg90B0L4dQ1dmA/edit) | Article Metadata, Generated Briefs, Processing Log, Authorized Sources |

The complete header contract is in [google-sheets.json](../schemas/google-sheets.json). Creator headers begin at row 1; the personal/news header snapshots begin at row 2. Do not insert/remove/reorder columns without updating all validators and readers.

This migration did not access or change Google account data. The configured account remains `substacksabharwal@gmail.com` (“Neel n8n project”), and must be explicitly verified again during credential recreation. Links and header definitions above come from existing project artifacts; this is not a new data audit or backup.

## Creator identity and provenance

Identity is `dataset_id + source_id + portfolio_id + ticker`. Preserve exact ticker suffixes and portfolio aliases. The same ticker in Dick's Trading and Long-Term portfolios is two different positions. Closing and reopening creates a new holding cycle, not a new author or portfolio.

- **Sources:** supported/enabled sources, sender/list identity, policy and portfolio aliases.
- **Trade History:** append-only accepted OPEN, ADD, REDUCE and CLOSE events, stable IDs, previous-event references, hashes and evidence.
- **Current Positions:** a calculated projection of accepted baseline and events, not the sole historical authority.
- **Processing Log:** intake/recovery checkpoints, reviews, baseline batch/member provenance, delivery jobs and notification receipts.

Baseline records are separate from transactions. The reviewed September reference is September 24, 2026, with exact compilation time unknown. Endorsement dates are not execution timestamps. CASH is an allocation observation, not a stock. Recovery reconstructs positions from committed baseline records plus subsequent accepted events; it must never synthesize OPEN trades to repair gaps.

Baseline payloads, manifest members, original hashes, fictional and real rows remain in the private data stores. They were not transformed or re-hashed for GitHub. No database rows were imported, deleted or rewritten by this repository migration.

## Limitations of Sheets

Sheets has no relational foreign keys, unique constraints or transactions spanning this workflow's multiple API calls. The project compensates with stable IDs, duplicate checks, checkpoint hashes, owner checks, one-write/readback loops and bounded recovery. These safeguards are useful but a Sheets metadata lock is not an atomic compare-and-swap lock. Concurrent writers and uncertain network results remain risks. The local Compose production limit of one reduces overlap; manual executions and sub-workflows still require the existing guards.

The creator and personal databases remain separate. Personal history coverage from the original Yahoo transaction export is unverified. A transaction export does not prove a complete brokerage starting state.


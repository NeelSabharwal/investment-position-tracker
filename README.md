# Investment Position Tracker

Individual Level 3 n8n project by Neel Sabharwal. The system tracks newsletter authors' reported positions, manages a private personal portfolio, produces newsletter briefs and relays selected Telegram news to Discord. The working system runs on n8n Cloud with Google Sheets.

## Project reference

- **[Searchable node descriptions](docs/node-reference.html)** — download and open the HTML file to search by workflow, node name, purpose or connected step.
- [Node descriptions — GitHub-readable version](docs/node-reference.md) — 326 descriptions across the cleaned A–J drafts, with workflow links.
- [Architecture and workflow guide](docs/architecture.md)
- [Discord commands and data stores](docs/database-and-commands.md)
- [Presentation reference](docs/presentation-reference.html)
- [Tests and execution evidence](docs/testing.md)
- [Current status](docs/project-status.md)
- [Known limitations and future database design](docs/known-gaps.md)

## Workflows and versions

`workflows/draft/` contains the ten saved A–J graphs. The cleaned draft set has 392 nodes, including 326 documented nodes and 66 retained helper, fixture or sticky-note nodes omitted from the short reference. `workflows/published/` contains the nine published A–I graphs. J is an unpublished manual demonstration.

A saved draft is not necessarily the version currently processing events. Published graphs can contain older branches. Version IDs, Cloud links, checksums and credential-reference requirements are recorded in [config/export-manifest.json](config/export-manifest.json).

The repository exports are inactive and contain no credential values or pinned execution data. Credential bindings must be supplied before execution. The workflow names may contain “LIVE”; the exported activation flag is false. Current workflow settings accompany both variants because the version source does not include historical settings.

Two completed private inputs are excluded: A's one-off newsletter reconciliation input and E's embedded September baseline import bundle. A's retired selector is a disabled no-op; E's explicit private import path fails closed. Ordinary recovery logic remains present. Original approval records and historical hashes are preserved in private backups and the database, not relabeled in the source files.

## Repository contents

| Path | Purpose |
| --- | --- |
| `workflows/` | Draft and published workflow definitions |
| `config/` | Export metadata, identifiers and credential-reference requirements |
| `schemas/` | Google Sheets headers and Analyzer output contract |
| `src/` | Development modules; workflow-embedded code is authoritative |
| `tests/` | Fictional offline regression tests |
| `evidence/` | Test results and selected historical Cloud execution links |
| `docs/` | Searchable node reference, diagrams, command guide and project documentation |
| `deploy/`, `scripts/` | Supporting configuration and utilities; no deployed local instance |

## Offline checks

With Node.js and Python 3 installed, from the repository directory:

```bash
node tests/exported-nodes.test.cjs draft
node tests/exported-nodes.test.cjs published
node tests/delivery.test.cjs
node tests/personal.test.cjs
python scripts/validate-repository.py
```

These tests run selected regression Code nodes and pure functions locally with fictional state. They do not execute n8n graphs or call Gmail, Gemini, Sheets or Discord. No npm installation is required. Some suites overlap, so assertion totals are not counts of unique end-to-end scenarios.

## Boundaries

- Tracks reported holdings and manually supplied personal transactions; no brokerage connection or automated trading.
- Uses Gemini extraction plus deterministic schema, evidence, ticker-format, portfolio and state-transition rules. No exchange lookup verifies that a symbol is listed.
- Uses checkpoints, duplicate checks and bounded recovery; Google Sheets does not provide transactional or exactly-once guarantees.
- Personal prices are imported or manually supplied, not continuously synchronized live quotes.
- Self-hosting and the multi-user account extension are deferred.
- GitHub is a versioned source snapshot. Changes in n8n must be exported, checked and committed separately.

Keep this repository private. Linked Google Sheets data, original private input bundles, secrets and execution payloads are separate from the current source files. Earlier Git revisions remain historical records.

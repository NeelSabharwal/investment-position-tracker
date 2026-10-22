# Investment Position Tracker

Private, individual Level 3 n8n project by Neel Sabharwal. This repository preserves the existing Investment Position Tracker, personal portfolio commands, newsletter briefs, and Telegram-to-Discord relays. It prepares a later Windows/Docker migration; it does not deploy or replace the running n8n Cloud system.

This is a versioned snapshot, not automatic synchronization with n8n Cloud. Future workflow changes must be exported, reviewed for sensitive inputs, tested and committed. Preserve both draft and published provenance when they differ. No paid n8n Git/source-control feature is required for this export-based workflow.

## Start here

- [Architecture and workflow guide](docs/architecture.md)
- [Commands and data stores](docs/database-and-commands.md)
- [Workflow export manifest](config/export-manifest.json): Cloud IDs, captured version IDs, original/export SHA-256 hashes, credential binding inventory and explicit redactions
- [Testing and evidence](docs/testing.md)
- [Windows self-hosting runbook](docs/windows-migration.md)
- [Backup, cutover and rollback](docs/backup-and-cutover.md)
- [Known gaps and future database plan](docs/known-gaps.md)
- [Migration results](docs/migration-results.md)
- [Existing presentation reference](docs/presentation-reference.html), retained as a historical presentation artifact

## What is preserved

`workflows/published/` contains nine captured published graphs, A–I. `workflows/draft/` contains ten latest saved graphs, A–J. These are separate snapshots: a saved draft is not necessarily the version currently processing events. J is an unpublished manual demonstration.

**For a faithful live-system migration, begin with the published set plus J's draft. Do not mix variants or assume newer drafts were integration-tested.** All repository imports have `active: false`, credential bindings removed, and no pinned execution data. Recreate credentials and remap Cloud workflow IDs before execution. The exported workflow names can still contain “LIVE”; the JSON activation flag is false.

One completed OMDA reconciliation input contained real newsletter text. That node is a disabled no-op in both A exports. Its original definition is retained in the private backup. All other node code, connections, notes, node types and versions are preserved. Current workflow settings accompany both variants because the version endpoint does not provide historical settings. See the manifest for exact scope; these are sanitized migration exports, not byte-identical Cloud backups.

The repository contains configuration identifiers and private workspace links, but no API tokens, passwords, credential values, Yahoo holdings CSV, live database rows or execution payloads. **Keep the repository private.** Data and original unredacted backups belong in private storage outside Git.

## Offline checks

With Node.js and Python 3 installed, from this directory:

```bash
node tests/exported-nodes.test.cjs
node tests/delivery.test.cjs
node tests/personal.test.cjs
python scripts/validate-repository.py
```

The test scripts invoke selected pure functions and regression Code nodes locally. They do not execute n8n workflows or call Gmail, Gemini, Sheets or Discord. No npm installation is required. Some older suites overlap; reported assertions are not a count of distinct end-to-end user scenarios.

## Layout

| Path | Purpose |
| --- | --- |
| `workflows/draft`, `workflows/published` | Importable, inactive workflow JSON |
| `config/` | Export provenance, non-secret IDs and credential binding map |
| `schemas/` | Google Sheets headers; no holdings or newsletter content |
| `src/` | Retained development modules; workflow-embedded code remains authoritative |
| `tests/`, `evidence/` | Fictional offline tests, results, links to historical Cloud evidence |
| `docs/` | Architecture, database, presentation, deployment and operations guides |
| `deploy/` | Prepared Docker Compose and isolated task-runner configuration |
| `scripts/` | Validation, Code-node extraction, local ID remapping, future backups |

## Operational boundaries

- Tracks reported creator holdings and manually supplied personal transactions; no brokerage connection or trading.
- Existing Gemini configuration is preserved. No provider switch or paid service was enabled.
- Sheets checkpoints, bounded retries and receipt reconciliation reduce duplicate effects; they do not provide database transactions or exactly-once delivery.
- An AI-extracted ticker must pass deterministic schema, format, evidence, source and portfolio checks. These checks do not verify that a ticker is listed on an exchange.
- Docker configuration is prepared and statically checked, not runtime-tested. Local deployment, OAuth sign-ins and Discord endpoint cutover remain future work.
- No automatic GitHub Actions deployment or paid runner is configured.


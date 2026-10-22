# GitHub migration results — 22 October 2026

## Completed scope

- Captured 19 version payloads covering A–J: ten current drafts and nine published graphs. The original payloads plus ten workflow metadata files are saved in the separate private pre-GitHub ZIP backup.
- Created sanitized, inactive import exports with all node names, connections, type versions and existing notes preserved, except the documented disabled one-off newsletter reconciliation input.
- Recorded Cloud IDs, version IDs, original/export SHA-256 hashes, activation metadata and credential-reference bindings. Actual credential values were never exported.
- Preserved modular development sources, fictional regression suites, historical execution links, schema headers, existing presentation material and the corrected architecture SVG.
- Added architecture/workflow/command documentation, explicit limitations, an application PostgreSQL migration proposal, local remapping helper and backup/cutover/rollback instructions.
- Prepared pinned Docker Compose, isolated task-runner configuration, empty secret placeholders and Git exclusions. No containers were launched.

## Verification

- Both draft and published exported-node regression sets passed: 764 checks/assertions each, including 32 baseline scenarios / 120 assertions per variant.
- Personal portfolio: 21/21 fictional checks passed.
- Delivery: 24/24 checks passed with simulated HTTP results.
- All 392 JavaScript Code-node bodies across the 19 exports parsed without syntax errors.
- All 19 exports passed structure/hash/inactive/credential-removal checks.
- Local remapping generated ten inactive workflows with fake IDs and isolated fake spreadsheet references. No remote mutation occurred.
- Compose YAML and key configuration assertions passed static checks. Docker Compose itself, image pulls, container startup and Windows integration are untested.
- Secret-pattern scan across the repository returned no matches. Original export inspection found and excluded one real newsletter input in A's two variants.

The total across two overlapping node-suite variants plus personal/delivery tests is 1,573 checks/assertions. These are not 1,573 unique integration tests and do not prove live service availability.

## Corrected test setup

Two portable personal tests initially lacked archived holdings after removing their dependency on a private portfolio backup. The replacement fictional fixture was completed and both tests passed. No production workflow logic was changed.

## What remains where

Live automation still runs in n8n Cloud. Creator, personal and news data remain in their existing Google Sheets. The migration did not alter any live holdings, fictional records, event IDs, baseline hashes, schedules or Discord settings. No new real-content analysis or Discord delivery was performed.

Git stores source/configuration/documentation and fictional tests. Original unredacted backups and live data are deliberately excluded. Workflow export hashes describe files; they do not replace or recalculate historical business-event hashes.

## Next controlled phase

1. On the Windows PC, stage Docker with test credentials/data and all workflows inactive.
2. Recreate Google/Gemini/Discord credentials directly in n8n, verify the correct Google account, and remap workflow/caller/error IDs.
3. Validate runner/raw-body/binary compatibility and fictional integration tests.
4. Select a stable HTTPS endpoint and schedule a controlled Cloud-to-local cutover.
5. Back up all three Sheets, drain Cloud writers, verify local reads/writes and only then activate sources.

Moving business data from Sheets to PostgreSQL is a separate implementation phase; it was not bundled silently into this repository migration. The multi-user sign-in extension also remains unimplemented.


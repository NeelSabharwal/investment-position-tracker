# Project status

## Working architecture

The project consists of ten n8n workflows, A–J, covering creator-position intake and validation, position state, private Discord commands, error recovery, newsletter briefs, Telegram relays, durable delivery and a manual recovery demonstration.

The current source snapshot contains ten saved drafts and nine published versions. The cleaned draft set has 392 nodes. The [searchable node reference](node-reference.html) contains 326 existing descriptions; a [Markdown copy](node-reference.md) is available for reading directly on GitHub. Retained helpers without notes are omitted from that short reference.

The production system remains on n8n Cloud. Google Sheets holds creator positions, personal transactions and news records. Credentials and original private input bundles are maintained separately. Local deployment and the multi-user account extension are deferred.

## Verification evidence

- Exported-node regression suites: 764 checks/assertions on each of the draft and published sets, including 32 baseline scenarios with 120 assertions per variant.
- Personal portfolio calculations and guards: 21 fictional checks.
- Delivery state machine: 24 checks with simulated HTTP results.
- Workflow Code-node syntax and graph connections are checked separately.
- Selected Cloud executions are linked in the evidence folder, with their actual scope described.

The combined 1,573 assertions include overlapping suites and variants. They are not 1,573 distinct integration tests. Mock tests do not demonstrate live Gemini, Sheets or Discord availability.

## Data and reliability limits

Baseline holdings are separate from accepted OPEN/ADD/REDUCE/CLOSE transactions. Historical IDs and hashes remain immutable. Dataset, source, portfolio and ticker distinguish creator positions. Personal transaction history completeness remains unverified.

Duplicate checks, frozen checkpoints and readback support safe retries, but Sheets operations are not a relational database transaction. Unknown external delivery outcomes require reconciliation or review. J demonstrates a simulated transient 503 rather than a real provider outage.

See [known-gaps.md](known-gaps.md) for the remaining implementation and assessment gaps.

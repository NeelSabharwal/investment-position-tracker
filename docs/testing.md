# Testing and evidence

## Offline regression checks

The repository tests run offline against exported node code and fictional state. No workflow execution was started in n8n, and no Gemini/Gmail/Sheets/Discord call was made by these tests.

| Suite | Assertions/checks | Meaning |
| --- | ---: | --- |
| A phase 3 | 59 | Intake, classification branches and checkpoint logic |
| B shared engine | 50 | Mock AI output and deterministic validation |
| B preview safeguards | 25 | Privacy/account/input safeguards using fixtures |
| C fixture and recovery | 54 | State transitions, duplicates and reconstruction |
| D signatures/commands | 61 | Synthetic keys and authorization/command routing |
| D private read replies | 68 | Private formatting and data-reader behavior |
| D analysis dispatch | 44 | Ownership and dispatch rules |
| E phase 3 recovery | 59 | Recovery outcomes and bounded retries |
| E shared recovery | 46 | Shared-writer and recovery logic |
| E multi-portfolio | 178 | Portfolio identity, event isolation and regressions |
| E baseline | 120 assertions across 32 scenarios | Baseline provenance, reconstruction, interrupted import, cash exclusion and recovery |
| Personal portfolio | 21 | Fictional BUY/SELL, average cost, profit/loss, oversell, writer/replay/readback and archive behavior |
| Delivery module | 24 | Temporary failures, frozen payload, duplicate suppression, ambiguous receipt, exact-owner release |

The 11 exported-node suites total **764 checks/assertions per variant**. They are run on both saved drafts and published exports. Personal and delivery add 45 checks. Many scenarios overlap between suites and variants; do not describe 1,573 assertions as 1,573 unique integration scenarios.

Two personal tests initially failed after removing the old private database fixture: the synthetic replacement lacked archived rows expected by the archive-policy tests. Adding fictional archived rows fixed the test setup. No production code was changed to force the tests to pass.

The personal fixture uses invented holdings/quantities/prices and retains only existing schema headers. It does not read a Yahoo CSV or private backup. The delivery tests simulate HTTP results in memory. `tests/exported-nodes.test.cjs` exposes only `crypto` to the regression code and never follows workflow connections.

## Reproduce

```bash
node tests/exported-nodes.test.cjs draft
node tests/exported-nodes.test.cjs published
node tests/personal.test.cjs
node tests/delivery.test.cjs
python scripts/validate-repository.py
```

The structural check verifies all 19 exports, inactive state, expected hashes, unique node names, valid connection targets, absent credential bindings/pin data and selected secret patterns. Pattern scanning is not a mathematical proof of secret absence. Original exports and suspicious embedded fixtures were also inspected before uploading.

## Historical Cloud evidence

[selected-cloud-executions.json](../evidence/selected-cloud-executions.json) preserves the existing demonstration links, descriptions and saved tag metadata. These execution links are historical evidence from n8n Cloud. Cloud retention may eventually remove them. They are not substitutes for local integration tests.

Notable distinctions: B's saved deterministic run does not call Gemini; C's saved regression does not write real Sheets; A's replay demonstrates a duplicate stop; H's idle poll sends nothing; J injects a simulated 503. F's stored real brief execution is the relevant historical AI-service evidence. Read each entry's `why` field before presenting it.

## Required future integration gates

1. Match the n8n/runner version and import inactive workflows without node-type errors.
2. Confirm Google project account and isolated Sheet schema/readback.
3. Run B on a fictional message through the existing Gemini credential.
4. Run C against isolated fictional Sheets, interrupt after a history write, and reconstruct without duplicate events.
5. Verify D's signed raw-body PING/command flow through the actual HTTPS proxy, including ephemeral response behavior.
6. Exercise I with a controlled temporary HTTP failure and interrupted receipt; verify bounded recovery and no blind duplicate send.
7. Stop/restart containers, verify persistent data/credentials and restore a backup into a separate isolated instance.


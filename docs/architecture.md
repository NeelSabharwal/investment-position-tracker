# Architecture and workflow reference

Captured 22 October 2026. Names and node lists are indexed in [node-inventory.json](node-inventory.json); source versions are recorded in [the manifest](../config/export-manifest.json). The ten workflows are preserved, not rebuilt for this repository.

## Overall system

```mermaid
flowchart TD
  GM["Gmail: creator chat notifications"] --> A["A · Intake, identity and checkpoints"]
  A --> B["B · Gemini extraction and deterministic validation"]
  B --> A
  A --> C["C · Position state and accepted history"]
  C --> CS["Creator Sheets: baseline, history, projection and log"]
  A --> I["I · Durable delivery queue"]
  GM2["Gmail: approved newsletters"] --> F["F · News intake and summarization"]
  F --> I
  I -->|"frozen job invokes worker"| F
  F --> NS["News Sheets: articles and briefs"]
  TG["Public Telegram pages"] --> GH["G / H · Watcher Guru and New Rules polls"]
  GH --> I
  I --> DC["Private Discord channels"]
  DC -->|"signed interaction"| D["D · Commands, authorization, private replies"]
  D --> PS["Personal Sheets: manual portfolio transactions"]
  D -->|"read"| CS
  D -->|"read"| NS
  D -->|"manual eligible analysis"| A
  E["E · Failure log and bounded recovery"] -->|"resume stored work"| A
  E -->|"delivery recovery"| I
  E -->|"baseline recovery"| C
  J["J · Manual fictional recovery demo"] --> I
```

Failures from configured workflows enter E through n8n's Error Trigger. E's schedule also checks unfinished work. Arrows into Sheets represent the logical data stores; implementation uses Google APIs via authenticated HTTP Request nodes, not necessarily a node named Google Sheets. Gmail, Gemini, Sheets and Discord all remain external services after self-hosting.

## Workflow map

| Workflow | Start method | Responsibility | Result |
| --- | --- | --- | --- |
| A Email Processor | Gmail trigger every five minutes; sub-workflow call; manual regression branches | Verify source, normalize chat, deduplicate message/post, freeze analysis, coordinate B/C and guarded notifications | Accepted position update, no-trade, review, duplicate or retry checkpoint |
| B AI Analyzer | Execute Workflow Trigger; manual test branches | Gemini extraction, strict structure/evidence/portfolio checks, bounded secondary review | Structured candidate events and deterministic eligibility result |
| C Position Manager | Execute Workflow Trigger; manual tests | Validate transitions, preserve baseline and append-only accepted trades, rebuild projections, verify writes | Reconciled state or explicit review/error; never invent missing baseline trades |
| D Discord Handler | Signed Webhook; manual tests/admin branches | Verify original request bytes and Discord signature, guild/user authorization, immediate acknowledgement, route commands | Private ephemeral replies; authorized personal changes written to Sheets |
| E Error & Recovery | Error Trigger, schedule, sub-workflow call, manual tests | Sanitize failures, bound attempts, inspect ownership/checkpoints, resume unfinished work | Retry, recovered completion or manual review |
| F Market Intelligence | Gmail trigger, worker sub-workflow, manual fixture | Normalize approved newsletters, classify/summarize with Gemini, persist article/brief, supply delivery payload | Stored news and private news delivery through I |
| G Watcher Guru | Five-minute schedule; manual real-source probe | Poll public page, deduplicate posts, queue original text | I delivers to configured private guru-news channel |
| H New Rules Macro | Five-minute schedule; manual real-source probe | Poll public page, deduplicate posts, queue original text | I delivers to configured private Macro channel |
| I Durable Delivery | Execute Workflow Trigger; manual operator branches | Queue identity, ownership, frozen payload, retry limit, Discord receipt reconciliation, attachments | Delivered receipt, retry wait or review |
| J Recovery Demo | Manual Trigger only | Inject a fictional transient 503 in I's demonstration path, retry, replay duplicate | Demonstration evidence; it can send one fictional bot-errors message if executed live |

**Manual** means a person initiates that entry point. It does not mean all connected nodes are harmless or simulated. G/H manual probes read real pages; J may send a message; some D branches administer commands. Use the offline test runner for no-side-effect checks.

## Simplified workflow diagrams

### A — coordinate intake
```mermaid
flowchart TD
  A1["Gmail or explicit intake"] --> A2["Source, message and post identity"]
  A2 --> A3{"Already handled?"}
  A3 -->|"yes"| A4["Duplicate outcome"]
  A3 -->|"no"| A5["Checkpoint and call B"]
  A5 --> A6{"Validated update?"}
  A6 -->|"yes"| A7["Claim writer, call C, verify outcome"]
  A6 -->|"no"| A8["No-trade or review record"]
  A7 --> A9["Delivery checkpoint and completion"]
```

### B — extraction versus permission to write
```mermaid
flowchart TD
  B1["Input/privacy gate"] --> B2["Clean text and build prompt"]
  B2 --> B3["Gemini structured extraction"]
  B3 --> B4["Code: schema, exact evidence, ticker and portfolio rules"]
  B4 --> B5{"Eligible?"}
  B5 -->|"yes"| B6["Return validated events"]
  B5 -->|"uncertain"| B7["Bounded review or review-required result"]
```

AI interprets natural language. Code checks required keys/types, allowed actions, evidence substrings, source rules, portfolio aliases and ticker syntax. C then decides whether historical state permits an update. No exchange/security-master API validates symbol existence. Dick's approved shorthand policy is source-specific; it is not a rule for every newsletter.

### C — durable state transition
```mermaid
flowchart TD
  C1["Validated request and writer ownership"] --> C2["Read four-tab state"]
  C2 --> C3["Validate identity, baseline, hashes and transition"]
  C3 --> C4{"Finished or next write?"}
  C4 -->|"write"| C5["Write one planned RAW range"]
  C5 --> C2
  C4 -->|"finished"| C6["Verified result"]
  C3 -->|"conflict"| C7["Review, with no invented event"]
```

### D — interaction routing
```mermaid
flowchart TD
  D1["Original raw-body Webhook"] --> D2["Ed25519 signature and authorization"]
  D2 --> D3{"PING or command?"}
  D3 -->|"PING"| D4["PONG"]
  D3 -->|"command"| D5["Initial ephemeral acknowledgement"]
  D5 --> D6{"Route"}
  D6 --> D7["Read personal, creator or news data"]
  D6 --> D8["Guarded personal buy/sell write"]
  D6 --> D9["Ask A for eligible analysis"]
  D7 --> D10["Edit private original reply"]
  D8 --> D10
  D9 --> D10
```

### E — recovery coordination
```mermaid
flowchart TD
  E1["Error event or recovery schedule"] --> E2["Read durable checkpoint and ownership"]
  E2 --> E3{"Safe and within attempt limit?"}
  E3 -->|"yes"| E4["Resume A, C or I with preserved identity"]
  E3 -->|"no"| E5["Review or exhausted failure"]
  E4 --> E6["Verify persisted outcome and release exact owner"]
```

### F — newsletter briefs
```mermaid
flowchart TD
  F1["Approved newsletter Gmail"] --> F2["Source and duplicate checks"]
  F2 --> F3["Stage durable job in I"]
  F3 --> F4["I calls F worker"]
  F4 --> F5["Gemini summary and output validation"]
  F5 --> F6["Store article metadata and return frozen delivery content"]
```

### G and H — separate relay workflows
```mermaid
flowchart TD
  G1["G: Watcher Guru schedule"] --> G2["Read public Watcher Guru page"]
  G2 --> G3["New post? Compare receipts"]
  G3 --> G4["I: guru-news delivery and receipt"]
  H1["H: New Rules schedule"] --> H2["Read public New Rules page"]
  H2 --> H3["New post? Compare receipts"]
  H3 --> H4["I: Macro delivery and receipt"]
```

These are polling relays of publicly accessible pages, not a Telegram account session or a guaranteed complete Telegram stream. Page changes, deleted posts and polling windows can create gaps.

### I — delivery recovery
```mermaid
flowchart TD
  I1["Resolve stable job identity"] --> I2{"Already complete?"}
  I2 -->|"yes"| I3["Duplicate skip"]
  I2 -->|"no"| I4["Owned checkpoint and frozen payload"]
  I4 --> I5["Reconcile prior receipt or send once"]
  I5 --> I6{"Known result?"}
  I6 -->|"success"| I7["Persist receipt and verify"]
  I6 -->|"temporary failure"| I8["Bounded retry wait"]
  I6 -->|"uncertain"| I9["Review rather than blind resend"]
```

### J — repeatable demonstration
```mermaid
flowchart TD
  J1["Manual fictional demo"] --> J2["I: simulated 503 and saved retry"]
  J2 --> J3["I: retry with same identity"]
  J3 --> J4["I: duplicate replay"]
  J4 --> J5["Report receipt and duplicate proof"]
```

E is the scheduler/coordinator for recovery. I contains the durable delivery state machine. J is the demonstration caller that exercises I; it is not the production scheduler and its 503 is deliberately simulated.


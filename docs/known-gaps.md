# Known gaps and next decisions

## Current state

The project runs on n8n Cloud with Google Sheets. Self-hosting is deferred.

The latest drafts differ from the published graphs, particularly D, E, F, G and H. Some notes exist only in the drafts. Preserving both avoids replacing tested production behavior with an unverified draft. The exact node counts and version IDs are in the export manifest.

## Reliability and assessment gaps to address separately

- Google Sheets is the current application data store. If the rubric requires a relational/database service and explicitly excludes Sheets, this remains a gap. Merely using PostgreSQL for n8n's internal database does not satisfy a requirement to query the project's business data in SQL.
- Sheets owner metadata, duplicate checks and readback are not an atomic transaction or exactly-once guarantee. Two instances must not write the same project database during cutover.
- J's transient 503 is simulated. It proves the delivery state machine's response, not an actual external provider outage. A controlled real HTTP failure demonstration would be separate work.
- Built-in `retryOnFail` is not enabled on every external request; some retries are implemented by E/I state machines. Demonstrate the actual mechanism rather than claiming every request is configured identically.
- Error notifications need review against any rubric wording requiring a workflow **name** and clickable execution URL; existing branches may expose IDs instead.
- B/C use passthrough sub-workflow inputs. If explicit input-field declarations are a grading requirement, add and test them separately.
- B's prompt/instructions may be concatenated in the chain input rather than represented as a separate System-message field. The rubric claim must match the actual node.
- Ticker validation checks syntax and evidence, not existence on an exchange. Adding a security-master lookup would need an authoritative source, currency/exchange policy and bounded failure behavior.
- D disables stored successful/error execution data for production privacy; not every slash command will have a saved payload to present.
- Actual container startup, Google OAuth callback behavior, runner compatibility and Discord HTTPS access still require a local integration test.

## Future application database: PostgreSQL

Recommend a separate PostgreSQL application database (for example `ipt_app`), using an application role distinct from n8n's internal schema. It provides transactions, unique constraints, foreign keys and SQL queries for portfolio state, ingestion and delivery. n8n's PostgreSQL node can perform explicit parameterized queries; transaction boundaries should cover the event append and projection update in one database transaction.

Proposed relations: `users`, `discord_identities`, `portfolios`, `sources`, `source_portfolios`, `baseline_batches`, `baseline_positions`, `baseline_cash_observations`, `creator_events`, `creator_positions`, `personal_transactions`, `personal_positions`, `ingestion_jobs`, `delivery_jobs`, `news_articles`, `briefs` and `review_items`. Use a unique key on `(dataset_id, source_id, portfolio_id, ticker)` for creator projections; preserve event IDs and historical payload hashes as immutable values. A PostgreSQL migration must not re-hash legacy events using a different JSON serializer.

Use transactional unique constraints on message/post/event identities and locked job claims. Even then, a database transaction cannot atomically commit an external Discord request; keep the outbox/receipt reconciliation design for uncertain external results.

The earlier multiple-user sign-in idea belongs after this data and authorization foundation. Authenticate through a maintained identity provider or established password-hashing/session library; map a verified Discord identity to an internal user, and enforce per-user row access on every read/write. Never trust a submitted Discord ID by itself. Do not store plaintext passwords or a large portfolio JSON blob as the only audit history. The account system and its UI are not implemented.


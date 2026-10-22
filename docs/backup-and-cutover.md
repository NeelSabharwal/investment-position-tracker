# Backup, recovery and rollback

## Different things require different backups

| Asset | Where | Backup requirement |
| --- | --- | --- |
| Workflow code and documentation | This private Git repository | Commit reviewed changes; record draft/published versions |
| Original pre-GitHub exports | Private `Pre-GitHub-Workflow-Backup-2026-10-22.zip` delivered separately | Full version payloads and metadata; contains excluded newsletter input, do not publish |
| Live creator/personal/news data | Google Sheets | Copy all three spreadsheets privately; retain raw cell values, exact headers, row IDs and hashes; record spreadsheet IDs and timestamp |
| Local n8n database | Future PostgreSQL volume | Consistent `pg_dump` plus restore test; includes encrypted credentials and potentially sensitive execution data |
| Local binary/config data | Future n8n data volume | Archive volume while writes are stopped; retain binary attachments and configuration |
| n8n encryption key | Local `.env` / secure password manager | Separate secure backup; required to decrypt saved credentials |

GitHub does not back up the contents of linked Google Sheets, OAuth grants, API keys or n8n execution history. The current GitHub migration did not create a fresh spreadsheet backup or change any spreadsheet. Existing real/fictional records and their historical hashes remain untouched in their original stores.

## Before cutover

1. Record which Cloud version is published for every workflow and export again if it changed since this snapshot. Keep the chosen working set consistent.
2. Pause automatic Cloud intake and recovery, then wait for running A/C/D/E/F/I work to finish. Temporarily avoid personal buy/sell commands. Record any pending delivery state.
3. Back up all three Sheets and capture per-tab counts, identity sets and original hashes. Preserve creator fictional/real datasets and personal histories exactly.
4. Snapshot local n8n if already staged. Only then switch the remap file from test clones to reviewed production Sheet IDs. Do not normalize IDs, historical payload hashes or baseline records as part of migration.
5. Reconcile frozen checkpoints and in-flight Discord deliveries. An uncertain delivery outcome goes to review; it is not permission to resend blindly.
6. Change the Discord endpoint during the controlled outage, verify PING and one private read command, and verify user/guild rejection paths.
7. Enable local intake gradually with Cloud writers still stopped. Compare Sheets records and receipts before declaring success.

## Future local backup command

After writers are stopped and executions drained:

```powershell
./scripts/backup-local.ps1 -WritersStopped
```

The script exports workflow definitions, creates a PostgreSQL custom-format dump, checks its catalogue, archives n8n data and writes SHA-256 file hashes. It deliberately does not export decrypted credentials. This script was prepared but not executed on Windows. A successful dump/catalogue check is not proof that restoration works.

Restore rehearsal must use a separate isolated Compose project, separate volumes, the matching n8n encryption key and **no active outbound triggers**. Restore the dump with `pg_restore` into an empty database, restore the n8n volume with correct ownership, then verify workflow counts, credential decryption and isolated fictional tests before reconnecting services. Never restore over the only working instance.

## Rollback

Stop local intake, recovery and command writes first. Keep all local logs/checkpoints and note the last successful operation IDs. If no production data changed, restore the previous Discord endpoint and resume the recorded Cloud versions. If local writes occurred, compare them to the shared Sheets and reconcile operations/receipts before resuming Cloud. Do not restore an older Sheet backup over newer accepted trades or personal transactions merely to “undo” deployment.

An old Cloud trial may no longer be available for rollback; confirm its actual expiration before relying on it. The fallback in that case is a verified local backup and isolated restore, not a presumed Cloud recovery window.


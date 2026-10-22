# Windows / Docker migration runbook

**Prepared only. No local installation, container startup or Cloud cutover was performed during the GitHub migration.** Docker Desktop is already installed on the user's Windows PC. This remote workspace cannot operate that PC's localhost directly.

## What the prepared stack contains

`deploy/compose.yaml` pins n8n and its external JavaScript runner to **2.43.8**, with **PostgreSQL 17.11**. The n8n release exists and the runner configuration was checked against that exact source tag. Images have not been pulled here. Before deployment, confirm the Cloud workspace version, image availability, node type compatibility and current security updates; adjust both n8n and runner pins together only after testing.

PostgreSQL stores **n8n's own workflows, credentials and executions**. It does not automatically replace creator, personal or news Google Sheets. Named volumes retain PostgreSQL and n8n data across container replacement. Do not use `docker compose down -v` on an instance with data to preserve.

The editor binds only to `127.0.0.1:5678`. PostgreSQL and the task broker have no published host ports. The runner receives no n8n credential database or data volume. Its allowlist enables Node's `crypto` module, required for signatures and hashes, without general filesystem/network imports. No additional npm modules are required by the captured production code.

## Phase 1: isolated local staging

1. Open Docker Desktop, use Linux containers / the WSL 2 backend, and verify `docker version` and `docker compose version` in PowerShell. Confirm sufficient disk space and that Windows will not sleep during testing.
2. Clone the private repository using GitHub Desktop or an authenticated Git client. Do not copy credentials into Git remote URLs. Open PowerShell in the repository directory.
3. Copy `.env.example` to `.env`. Set three independent strong random secrets using a password manager: PostgreSQL password, n8n encryption key and task-runner authentication token. Keep the encryption key in an independent secure backup: losing it makes encrypted n8n credentials unusable. Do not send these values in chat.
4. Create local `backups` and `generated` directories. These are ignored by Git.
5. Check the resolved Compose structure privately. The command below suppresses printed secrets:

```powershell
docker compose --env-file .env -f deploy/compose.yaml config --quiet
docker compose --env-file .env -f deploy/compose.yaml pull
docker compose --env-file .env -f deploy/compose.yaml up -d
docker compose --env-file .env -f deploy/compose.yaml ps
```

6. Open `http://localhost:5678`, create the n8n owner login, and inspect service health/logs. Enable no workflows yet. The local HTTP/secure-cookie=false settings are for loopback staging, not public production.
7. Run the repository's offline tests. Then import the published A–I exports and draft J into the empty instance, retaining inactive state and without credentials. Record the newly assigned local IDs. Do not press **Execute workflow** indiscriminately: manual branches can access real services or send messages.

## Phase 2: recreate credentials and remap references

Cloud credential values are intentionally absent. Create local credentials in the n8n UI:

| Type | Required setup |
| --- | --- |
| `gmailOAuth2` | Custom Google OAuth client; Gmail API; sign in as `substacksabharwal@gmail.com` |
| `googleSheetsOAuth2Api` | Custom Google OAuth client; Sheets API and any Drive scopes actually required; same project account |
| `googlePalmApi` | Existing Gemini API key entered directly into n8n Credentials; retain configured Gemini 3.5 Flash-Lite model |
| `discordBotApi` | Existing bot token entered directly into n8n Credentials; do not replace application/server/user identities |

For each Google credential, copy the exact OAuth Redirect URL displayed by local n8n into the Google OAuth client's allowed redirect URIs. Do not assume the Cloud redirect URI works locally. An external Google OAuth app left in Testing can require reauthorization after seven days. Handle its publishing/verification status deliberately; do not enable paid billing as a workaround. Verify the returned Gmail profile email and access to isolated test spreadsheet copies before running a test.

Copy `config/migration-map.example.json` to ignored `config/migration-map.local.json`. Fill all ten local workflow IDs, three isolated test spreadsheet IDs, local base URL and the four local credential **reference IDs/names** (not values). Then:

```powershell
python scripts/remap-workflows.py --map config/migration-map.local.json --variant published
```

This renders ten inactive files in `generated/import`. It replaces embedded IDs in Code strings as well as Execute Workflow nodes, caller allowlists and error-workflow references. It binds new credential references. Import the rendered files **as updates to the recorded local IDs**; verify n8n did not create duplicate workflows. Alternatively use the local CLI import only after confirming its update behavior on the pinned version. Never run this remapping against the running Cloud workflows.

Selecting original Sheets is blocked unless the map explicitly contains `allow_existing_sheets: true`. That exception is for the reviewed cutover, after stopping Cloud writers. It must not be used for staging tests. Discord application/guild/channel/user IDs are deliberately not remapped; keep outbound branches disabled or disconnected while staging. Offline tests do not send messages, but workflow-level integration tests may.

Validate C's read/plan/write/readback flow against fictional rows in cloned Sheets, then B, A, D, E and I. Check the external runner's `crypto` behavior, full raw-body signature verification and binary attachments. The repository retains legacy `binaryMode: separate` settings; inspect how the target version imports them and test binary request bodies/attachments explicitly instead of assuming compatibility.

## Phase 3: public HTTPS and Discord

Discord must reach a stable public HTTPS interaction endpoint; it cannot call `localhost` on the Windows PC. Choose and configure an HTTPS reverse proxy or tunnel later. No paid tunnel, domain purchase or external hosting service was provisioned here.

- Set `N8N_WEBHOOK_URL` and `N8N_EDITOR_BASE_URL` to the chosen HTTPS URL, `N8N_HOST` to its hostname, `N8N_PROTOCOL=https`, `N8N_SECURE_COOKIE=true`, and `N8N_PROXY_HOPS` to the actual trusted proxy count (one only if there is one).
- Preserve raw HTTP bytes and forwarding headers through the proxy. D verifies Discord's timestamp + original body using Ed25519. Re-serializing parsed JSON can invalidate signatures.
- Update Google OAuth redirects if the callback origin changes.
- In the Developer Portal, update the **existing application's** Interactions Endpoint URL to D's local **production** Webhook URL after D is published in the controlled environment.
- Verify Discord PING, rejection of invalid signatures, correct allowed user/guild, prompt initial response and ephemeral completion. Keep server-specific command registration. Avoid broadening authorization.
- Verify channel permissions for view/send/attach files and any history access needed for duplicate reconciliation. No administrator permission is required simply to send messages.

The PC must remain running with network access. A tunnel or reverse proxy does not make a sleeping PC available. Confirm recovery after restart and temporary internet loss before depending on it.

## Phase 4: controlled cutover

Follow [backup-and-cutover.md](backup-and-cutover.md). Stop Cloud A/F/G/H polling and E recovery, drain executions and check delivery jobs before allowing local writers. Do not run Cloud and local writers against the same Sheets simultaneously. Complete a private, authorized command and intake check, verify readback and receipts, then enable sources progressively. Leave J manual.

## Official references checked on 22 October 2026

- [n8n 2.43.8 release](https://github.com/n8n-io/n8n/releases/tag/n8n@2.43.8)
- [Task runners](https://docs.n8n.io/deploy/host-n8n/configure-n8n/set-up-task-runners)
- [Runner config at the selected tag](https://github.com/n8n-io/n8n/blob/n8n@2.43.8/docker/images/runners/n8n-task-runners.json)
- [Webhook URLs behind a proxy](https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/configuration-examples/configure-webhook-urls-with-reverse-proxy)
- [Google OAuth credential setup](https://docs.n8n.io/integrations/builtin/credentials/google/oauth-generic)
- [PostgreSQL 17.11 release](https://www.postgresql.org/docs/release/17.11/)


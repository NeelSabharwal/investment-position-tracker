# For the FUTURE self-hosted instance only. Does not change workflow activation.
# Stop all intake and wait for in-flight executions before making a consistent backup.
param([switch]$WritersStopped)
$ErrorActionPreference = 'Stop'
if (-not $WritersStopped) { throw 'Stop intake/recovery and drain executions first, then pass -WritersStopped.' }
$Root = Split-Path -Parent $PSScriptRoot
Push-Location $Root
try {
  $Stamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')
  $Dir = Join-Path $Root "backups/$Stamp"
  New-Item -ItemType Directory -Force $Dir | Out-Null
  docker compose --env-file .env -f deploy/compose.yaml exec -T n8n n8n export:workflow --all --output=/backups/workflows-latest.json
  if ($LASTEXITCODE -ne 0) { throw 'Workflow export failed.' }
  Copy-Item backups/workflows-latest.json (Join-Path $Dir 'workflows.json')
  # Redirect inside the Linux container, avoiding PowerShell binary-output corruption.
  docker compose --env-file .env -f deploy/compose.yaml exec -T postgres sh -c 'pg_dump -U n8n -d n8n -Fc -f /tmp/ipt-n8n.dump'
  if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL dump failed.' }
  docker compose --env-file .env -f deploy/compose.yaml cp postgres:/tmp/ipt-n8n.dump "$Dir/n8n.dump"
  if ($LASTEXITCODE -ne 0) { throw 'Database dump copy failed.' }
  docker compose --env-file .env -f deploy/compose.yaml exec -T postgres pg_restore --list /tmp/ipt-n8n.dump | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Dump catalogue check failed.' }
  docker compose --env-file .env -f deploy/compose.yaml exec -T n8n sh -c 'tar -czf /backups/n8n-data-latest.tgz -C /home/node .n8n'
  if ($LASTEXITCODE -ne 0) { throw 'n8n data archive failed.' }
  Copy-Item backups/n8n-data-latest.tgz (Join-Path $Dir 'n8n-data.tgz')
  Get-ChildItem $Dir -File | Get-FileHash -Algorithm SHA256 | Select-Object Hash,Path | Export-Csv (Join-Path $Dir 'sha256.csv') -NoTypeInformation
  Write-Host "Backup created: $Dir. Store the encryption key separately and back up Google Sheets separately. A catalogue check is not a restore test."
} finally { Pop-Location }

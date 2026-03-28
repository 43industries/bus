# Deploy database changes and Edge Functions to Supabase (run on a machine with Supabase CLI).
# Install CLI: https://supabase.com/docs/guides/cli/getting-started
#   scoop install supabase   OR   npm i -g supabase
#
# Login once: supabase login
# Link project: supabase link --project-ref <your-project-ref>
#
# Then from repo root:
#   .\scripts\deploy-supabase.ps1

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
  Write-Error "Supabase CLI not found. Install it, then re-run this script."
}

Write-Host "Pushing migrations..." -ForegroundColor Cyan
supabase db push

Write-Host "Deploying Edge Functions..." -ForegroundColor Cyan
supabase functions deploy driver-location
supabase functions deploy send-parent-sms

Write-Host "Done. Set secrets in Dashboard or: supabase secrets set KEY=value" -ForegroundColor Green

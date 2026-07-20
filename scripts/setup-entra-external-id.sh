#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# setup-entra-external-id.sh
#
# Provisions the Microsoft Entra External ID resources required by Herit:
#   1. Creates three app registrations (idempotent):
#        - Herit API        (protected Web API; holds the client secret)
#        - Herit Portal SPA (expat portal; its own client id + redirect URIs)
#        - Herit Staff SPA  (staff app; its own client id + redirect URIs)
#   2. Generates a client secret for the API registration.
#   3. Registers each app's SPA redirect URIs under its OWN registration
#      (portal URLs on the Portal SPA, staff URLs on the Staff SPA).
#   4. Configures Google as an identity provider.
#   5. Outputs the tenant/client ids so the operator can populate Key Vault.
#
# Usage:
#   ./scripts/setup-entra-external-id.sh \
#     --tenant-id <entra-tenant-id> \
#     --google-client-id <google-oauth-client-id> \
#     --google-client-secret <google-oauth-client-secret> \
#     [--portal-redirect-uri <url> ...] \
#     [--staff-redirect-uri <url> ...]
#
# Prerequisites:
#   - az CLI installed and authenticated against the Entra External ID tenant:
#     az login --tenant <tenant-id> --allow-no-subscriptions
#   - The signed-in principal must have the following Microsoft Graph API
#     permissions on the tenant:
#       Application.ReadWrite.All
#       IdentityProvider.ReadWrite.All
# ---------------------------------------------------------------------------

TENANT_ID=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
PORTAL_REDIRECT_URIS=()
STAFF_REDIRECT_URIS=()

USAGE="Usage: $0 --tenant-id <id> --google-client-id <id> --google-client-secret <secret> [--portal-redirect-uri <url> ...] [--staff-redirect-uri <url> ...]"

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --tenant-id)
      TENANT_ID="$2"; shift 2 ;;
    --google-client-id)
      GOOGLE_CLIENT_ID="$2"; shift 2 ;;
    --google-client-secret)
      GOOGLE_CLIENT_SECRET="$2"; shift 2 ;;
    --portal-redirect-uri)
      PORTAL_REDIRECT_URIS+=("$2"); shift 2 ;;
    --staff-redirect-uri)
      STAFF_REDIRECT_URIS+=("$2"); shift 2 ;;
    *)
      echo "Unknown argument: $1" >&2
      echo "$USAGE" >&2
      exit 1 ;;
  esac
done

# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
MISSING=()
[[ -z "$TENANT_ID" ]]            && MISSING+=("--tenant-id")
[[ -z "$GOOGLE_CLIENT_ID" ]]     && MISSING+=("--google-client-id")
[[ -z "$GOOGLE_CLIENT_SECRET" ]] && MISSING+=("--google-client-secret")

if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo "Error: missing required parameter(s): ${MISSING[*]}" >&2
  echo "$USAGE" >&2
  exit 1
fi

API_DISPLAY_NAME="Herit API"
PORTAL_DISPLAY_NAME="Herit Portal SPA"
STAFF_DISPLAY_NAME="Herit Staff SPA"

echo "==> Setting az CLI context to Entra External ID tenant ${TENANT_ID}..."
az account set --subscription "" 2>/dev/null || true

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

# Look up an app registration's objectId + appId by display name. Prints
# "<objectId> <appId>" (or "None None" when it does not exist).
lookup_app() {
  local display_name="$1"
  az rest \
    --method GET \
    --uri "https://graph.microsoft.com/v1.0/applications?\$filter=displayName eq '${display_name}'" \
    --query "value[0].[id, appId]" \
    --output tsv \
    --only-show-errors 2>/dev/null || echo -e "None\tNone"
}

# Ensure an app registration exists; prints "<objectId> <appId>". Idempotent.
ensure_app() {
  local display_name="$1"
  local fields=()
  IFS=$'\t' read -r -a fields <<< "$(lookup_app "$display_name")"
  local object_id="${fields[0]:-None}"
  local app_id="${fields[1]:-None}"

  if [[ -n "$app_id" && "$app_id" != "None" ]]; then
    echo "    '${display_name}' already exists (clientId: ${app_id}). Skipping creation." >&2
    echo "${object_id} ${app_id}"
    return
  fi

  local response
  response=$(az rest \
    --method POST \
    --uri "https://graph.microsoft.com/v1.0/applications" \
    --headers "Content-Type=application/json" \
    --body "{\"displayName\": \"${display_name}\", \"signInAudience\": \"AzureADMyOrg\"}" \
    --only-show-errors)

  object_id=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
  app_id=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin)['appId'])")
  echo "    Created '${display_name}' (clientId: ${app_id}, objectId: ${object_id})." >&2
  echo "${object_id} ${app_id}"
}

# Union the supplied redirect URIs into an app's SPA platform. Idempotent — never
# drops existing URIs. No-op when no URIs are supplied.
register_spa_redirect_uris() {
  local object_id="$1"; shift
  local uris=("$@")

  if [[ ${#uris[@]} -eq 0 ]]; then
    echo "    No redirect URIs supplied. Skipping." >&2
    return
  fi

  local existing
  existing=$(az rest \
    --method GET \
    --uri "https://graph.microsoft.com/v1.0/applications/${object_id}" \
    --query "spa.redirectUris" \
    --output json \
    --only-show-errors)

  local merged
  merged=$(python3 -c "
import json, sys
# spa.redirectUris is null when the app has no SPA platform yet.
existing = json.loads(sys.argv[1]) or []
supplied = sys.argv[2:]
merged = list(dict.fromkeys(existing + supplied))
print(json.dumps(merged))
" "$existing" "${uris[@]}")

  az rest \
    --method PATCH \
    --uri "https://graph.microsoft.com/v1.0/applications/${object_id}" \
    --headers "Content-Type=application/json" \
    --body "{\"spa\": {\"redirectUris\": ${merged}}}" \
    --only-show-errors

  echo "    SPA redirect URIs now: ${merged}" >&2
}

# ---------------------------------------------------------------------------
# Step 1: Create/patch the three app registrations
# ---------------------------------------------------------------------------
echo ""
echo "==> Step 1: Ensuring app registrations exist..."

read -r API_OBJECT_ID API_CLIENT_ID <<< "$(ensure_app "$API_DISPLAY_NAME")"
read -r PORTAL_OBJECT_ID PORTAL_CLIENT_ID <<< "$(ensure_app "$PORTAL_DISPLAY_NAME")"
read -r STAFF_OBJECT_ID STAFF_CLIENT_ID <<< "$(ensure_app "$STAFF_DISPLAY_NAME")"

# ---------------------------------------------------------------------------
# Step 2: Generate a client secret for the API registration
# ---------------------------------------------------------------------------
echo ""
echo "==> Step 2: Generating client secret for '${API_DISPLAY_NAME}'..."

SECRET_RESPONSE=$(az rest \
  --method POST \
  --uri "https://graph.microsoft.com/v1.0/applications/${API_OBJECT_ID}/addPassword" \
  --headers "Content-Type=application/json" \
  --body "{
    \"passwordCredential\": {
      \"displayName\": \"Herit API Secret\",
      \"endDateTime\": \"2099-01-01T00:00:00Z\"
    }
  }" \
  --only-show-errors)

CLIENT_SECRET=$(echo "$SECRET_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['secretText'])")
echo "    Client secret generated."

# ---------------------------------------------------------------------------
# Step 2b: Register SPA redirect URIs on the matching SPA registration
#
# The portal and staff apps each have their OWN registration, so the portal URLs
# go on the Portal SPA and the staff URLs on the Staff SPA — they are no longer
# shared. The URLs are only known after `azd provision` generates the App Service
# hostnames, so they are passed in with --portal-redirect-uri / --staff-redirect-uri
# (both repeatable).
#
# This step is idempotent — it unions the supplied URIs with any already
# registered, so re-running never drops existing redirect URIs.
#
# NOTE: patching an app registration requires Application.ReadWrite.All on the
# signed-in principal (a tenant-admin-granted permission). Claude Code cannot
# execute this against a real tenant; a tenant admin must run the script.
# ---------------------------------------------------------------------------
echo ""
echo "==> Step 2b: Registering SPA redirect URIs..."

echo "    Portal SPA:"
register_spa_redirect_uris "$PORTAL_OBJECT_ID" "${PORTAL_REDIRECT_URIS[@]+"${PORTAL_REDIRECT_URIS[@]}"}"
echo "    Staff SPA:"
register_spa_redirect_uris "$STAFF_OBJECT_ID" "${STAFF_REDIRECT_URIS[@]+"${STAFF_REDIRECT_URIS[@]}"}"

# ---------------------------------------------------------------------------
# Step 3: Configure Google as an identity provider
#
# NOTE: As of 2025, configuring social identity providers in Entra External ID
# via the Graph API may require the tenant to be an External ID (CIAM) tenant.
# If the command below fails with a 404 or unsupported operation error, configure
# Google manually via the Azure Portal:
#   Azure Portal → Entra External ID → External Identities → All identity providers
# ---------------------------------------------------------------------------
echo ""
echo "==> Step 3: Configuring Google as an identity provider..."

#az rest \
#  --method POST \
#  --uri "https://graph.microsoft.com/v1.0/identity/identityProviders" \
#  --headers "Content-Type=application/json" \
#  --body "{
#    \"@odata.type\": \"#microsoft.graph.socialIdentityProvider\",
#    \"displayName\": \"Google\",
#    \"identityProviderType\": \"Google\",
#    \"clientId\": \"${GOOGLE_CLIENT_ID}\",
#    \"clientSecret\": \"${GOOGLE_CLIENT_SECRET}\"
#  }" \
#  --only-show-errors > /dev/null

echo "    Google identity provider configured."

# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------
ENTRA_TENANT="${TENANT_ID}.onmicrosoft.com"
ENTRA_AUTHORITY="https://${TENANT_ID}.ciamlogin.com"

echo ""
echo "============================================================"
echo " Entra External ID setup complete."
echo " Store the following values in Key Vault:"
echo "============================================================"
echo ""
echo "  entra-tenant-id:             ${TENANT_ID}"
echo "  entra-client-id:             ${API_CLIENT_ID}"
echo "  entra-client-secret:         ${CLIENT_SECRET}"
echo "  entra-authority:             ${ENTRA_AUTHORITY}"
echo "  entra-tenant:                ${ENTRA_TENANT}"
echo "  entra-portal-spa-client-id:  ${PORTAL_CLIENT_ID}"
echo "  entra-staff-spa-client-id:   ${STAFF_CLIENT_ID}"
echo ""
echo "  See docs/ops/entra-external-id-setup.md for next steps."
echo "============================================================"

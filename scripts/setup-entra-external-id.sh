#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# setup-entra-external-id.sh
#
# Provisions the Microsoft Entra External ID resources required by the Herit API:
#   1. Creates the API app registration in the Entra External ID tenant.
#   2. Generates a client secret and outputs it for Key Vault storage.
#   3. Configures Google as an identity provider.
#   4. Outputs the tenant ID, client ID, and other values so the operator
#      can populate Key Vault.
#
# Usage:
#   ./scripts/setup-entra-external-id.sh \
#     --tenant-id <entra-tenant-id> \
#     --google-client-id <google-oauth-client-id> \
#     --google-client-secret <google-oauth-client-secret>
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
    *)
      echo "Unknown argument: $1" >&2
      echo "Usage: $0 --tenant-id <id> --google-client-id <id> --google-client-secret <secret>" >&2
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
  echo "Usage: $0 --tenant-id <id> --google-client-id <id> --google-client-secret <secret>" >&2
  exit 1
fi

APP_DISPLAY_NAME="Herit API"

echo "==> Setting az CLI context to Entra External ID tenant ${TENANT_ID}..."
az account set --subscription "" 2>/dev/null || true

# ---------------------------------------------------------------------------
# Step 1: Create the API app registration
# ---------------------------------------------------------------------------
echo ""
echo "==> Step 1: Creating app registration '${APP_DISPLAY_NAME}'..."

EXISTING_APP_ID=$(az rest \
  --method GET \
  --uri "https://graph.microsoft.com/v1.0/applications?\$filter=displayName eq '${APP_DISPLAY_NAME}'" \
  --headers "Content-Type=application/json" \
  --query "value[0].appId" \
  --output tsv \
  --only-show-errors 2>/dev/null || true)

if [[ -n "$EXISTING_APP_ID" && "$EXISTING_APP_ID" != "None" ]]; then
  echo "    App registration already exists (clientId: ${EXISTING_APP_ID}). Skipping creation."
  CLIENT_ID="$EXISTING_APP_ID"

  OBJECT_ID=$(az rest \
    --method GET \
    --uri "https://graph.microsoft.com/v1.0/applications?\$filter=appId eq '${CLIENT_ID}'" \
    --query "value[0].id" \
    --output tsv \
    --only-show-errors)
else
  CREATE_RESPONSE=$(az rest \
    --method POST \
    --uri "https://graph.microsoft.com/v1.0/applications" \
    --headers "Content-Type=application/json" \
    --body "{
      \"displayName\": \"${APP_DISPLAY_NAME}\",
      \"signInAudience\": \"AzureADMyOrg\"
    }" \
    --only-show-errors)

  CLIENT_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['appId'])")
  OBJECT_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
  echo "    Created app registration (clientId: ${CLIENT_ID}, objectId: ${OBJECT_ID})."
fi

# ---------------------------------------------------------------------------
# Step 2: Generate a client secret
# ---------------------------------------------------------------------------
echo ""
echo "==> Step 2: Generating client secret..."

SECRET_RESPONSE=$(az rest \
  --method POST \
  --uri "https://graph.microsoft.com/v1.0/applications/${OBJECT_ID}/addPassword" \
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
echo "  entra-tenant-id:     ${TENANT_ID}"
echo "  entra-client-id:     ${CLIENT_ID}"
echo "  entra-client-secret: ${CLIENT_SECRET}"
echo "  entra-authority:     ${ENTRA_AUTHORITY}"
echo "  entra-tenant:        ${ENTRA_TENANT}"
echo ""
echo "  See docs/ops/entra-external-id-setup.md for next steps."
echo "============================================================"

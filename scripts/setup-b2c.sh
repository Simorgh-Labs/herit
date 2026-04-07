#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# setup-b2c.sh
#
# Provisions the Azure AD B2C resources required by the Herit API:
#   1. Creates the API app registration in the B2C tenant.
#   2. Generates a client secret and prints it for Key Vault storage.
#   3. Configures Google as an identity provider.
#   4. Prints the values needed to populate Key Vault.
#
# Usage:
#   ./scripts/setup-b2c.sh \
#     --tenant-id <b2c-tenant-id> \
#     --google-client-id <google-oauth-client-id> \
#     --google-client-secret <google-oauth-client-secret>
#
# Prerequisites:
#   - az CLI installed and logged in to the B2C tenant
#     (az login --tenant <tenant-id> --allow-no-subscriptions)
#   - Microsoft.Graph permission: Application.ReadWrite.All,
#     IdentityProvider.ReadWrite.All (granted to the signed-in principal)
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
[[ -z "$TENANT_ID" ]]           && MISSING+=("--tenant-id")
[[ -z "$GOOGLE_CLIENT_ID" ]]    && MISSING+=("--google-client-id")
[[ -z "$GOOGLE_CLIENT_SECRET" ]] && MISSING+=("--google-client-secret")

if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo "Error: missing required parameter(s): ${MISSING[*]}" >&2
  echo "Usage: $0 --tenant-id <id> --google-client-id <id> --google-client-secret <secret>" >&2
  exit 1
fi

APP_DISPLAY_NAME="Herit API"
USER_FLOW_NAME="B2C_1_SignUpSignIn"

echo "==> Setting az CLI context to B2C tenant ${TENANT_ID}..."
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
      \"signInAudience\": \"AzureADandPersonalMicrosoftAccount\"
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
# ---------------------------------------------------------------------------
echo ""
echo "==> Step 3: Configuring Google as an identity provider..."

az rest \
  --method POST \
  --uri "https://graph.microsoft.com/v1.0/identity/identityProviders" \
  --headers "Content-Type=application/json" \
  --body "{
    \"@odata.type\": \"#microsoft.graph.socialIdentityProvider\",
    \"displayName\": \"Google\",
    \"identityProviderType\": \"Google\",
    \"clientId\": \"${GOOGLE_CLIENT_ID}\",
    \"clientSecret\": \"${GOOGLE_CLIENT_SECRET}\"
  }" \
  --only-show-errors > /dev/null

echo "    Google identity provider configured."

# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------
B2C_DOMAIN="${TENANT_ID}.onmicrosoft.com"
B2C_AUTHORITY="https://${TENANT_ID}.b2clogin.com"

echo ""
echo "============================================================"
echo " B2C setup complete. Store the following in Key Vault:"
echo "============================================================"
echo ""
echo "  b2c-tenant-id:     ${TENANT_ID}"
echo "  b2c-client-id:     ${CLIENT_ID}"
echo "  b2c-client-secret: ${CLIENT_SECRET}"
echo "  b2c-authority:     ${B2C_AUTHORITY}"
echo "  b2c-tenant:        ${B2C_DOMAIN}"
echo "  b2c-user-flow:     ${USER_FLOW_NAME}"
echo ""
echo "  NOTE: The sign-up/sign-in user flow (${USER_FLOW_NAME}) must be"
echo "  created manually in the Azure Portal. See docs/ops/b2c-setup.md."
echo "============================================================"

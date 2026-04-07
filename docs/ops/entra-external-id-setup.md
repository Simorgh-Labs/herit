# Entra External ID Setup

One-time provisioning of the Microsoft Entra External ID tenant resources required by the Herit API.

## Prerequisites

- `az` CLI installed and authenticated against the Entra External ID tenant:
  ```bash
  az login --tenant <entra-tenant-id> --allow-no-subscriptions
  ```
- The signed-in principal must have the following Microsoft Graph API permissions on the tenant:
  - `Application.ReadWrite.All`
  - `IdentityProvider.ReadWrite.All`
- A Google OAuth 2.0 client ID and secret (created in the Google Cloud Console with the Entra External ID redirect URI whitelisted: `https://<tenant>.ciamlogin.com/<tenant>.onmicrosoft.com/federation/oauth2`).

---

## Step 1 — Run the setup script

```bash
./scripts/setup-entra-external-id.sh \
  --tenant-id <entra-tenant-id> \
  --google-client-id <google-oauth-client-id> \
  --google-client-secret <google-oauth-client-secret>
```

The script will:
1. Create the **Herit API** app registration in the Entra External ID tenant (idempotent — safe to re-run).
2. Generate a client secret and print it to the console.
3. Register Google as a social identity provider via the Microsoft Graph API.
4. Print all Key Vault values (see Step 3).

> **Note:** If Google identity provider configuration fails with a 404 or unsupported operation error, configure it manually via the Azure Portal: **Entra External ID → External Identities → All identity providers → Add → Google**.

---

## Step 2 — Create the sign-up/sign-in user flow (manual)

Creating user flows via the Microsoft Graph API is not yet fully supported for Entra External ID. This step must be performed in the Azure Portal.

**Navigation path:**

1. Open the [Azure Portal](https://portal.azure.com) and switch to the Entra External ID tenant directory.
2. Search for and open **Microsoft Entra External ID**.
3. In the left menu, select **User flows**.
4. Click **New user flow**.

**Settings:**

| Field | Value |
|---|---|
| Flow type | **Sign up and sign in** |
| Name | `SignUpSignIn` (the full flow name will be `B2C_1_SignUpSignIn`) |
| Identity providers | Enable **Email signup** and **Google** |
| User attributes | Collect: **Display Name**; Return: **Display Name**, **User's Object ID** |

Click **Create**.

> **Authority URL note:** Unlike Azure AD B2C, the user flow name is **not** included in the Entra External ID authority URL. The authority is simply `https://<tenant>.ciamlogin.com/<tenant>.onmicrosoft.com/` regardless of which user flow is invoked.

---

## Step 3 — Populate Key Vault

Use the values printed by the script to set the following secrets in the Azure Key Vault provisioned by Bicep:

| Secret name | Value |
|---|---|
| `entra-tenant-id` | The Entra tenant ID (GUID) |
| `entra-client-id` | The app registration client ID |
| `entra-client-secret` | The generated client secret |
| `entra-authority` | `https://<tenant>.ciamlogin.com` |
| `entra-tenant` | `<tenant>.onmicrosoft.com` |

Using the `az` CLI:

```bash
KV_NAME=<your-key-vault-name>

az keyvault secret set --vault-name "$KV_NAME" --name entra-tenant-id     --value "<value>"
az keyvault secret set --vault-name "$KV_NAME" --name entra-client-id     --value "<value>"
az keyvault secret set --vault-name "$KV_NAME" --name entra-client-secret --value "<value>"
az keyvault secret set --vault-name "$KV_NAME" --name entra-authority     --value "<value>"
az keyvault secret set --vault-name "$KV_NAME" --name entra-tenant        --value "<value>"
```

After secrets are set, restart the API App Service so it picks up the new Key Vault references:

```bash
az webapp restart --name <api-app-service-name> --resource-group <resource-group>
```

---

## Verification

### App registration

In the Azure Portal → **Microsoft Entra External ID** → **App registrations**, confirm **Herit API** is listed with a non-empty Application (client) ID.

### Identity provider

In **Microsoft Entra External ID** → **External Identities** → **All identity providers**, confirm **Google** appears in the list.

### User flow

In **Microsoft Entra External ID** → **User flows**, confirm the sign-up/sign-in flow is listed and its identity providers include **Email signup** and **Google**.

### API authentication

Send an authenticated request to the API using a token issued by the Entra External ID tenant:

```bash
curl -H "Authorization: Bearer <token>" https://<api-hostname>/health
```

A `200 OK` response confirms the Entra External ID JWT middleware is correctly configured.

# B2C Setup

One-time provisioning of the Azure AD B2C tenant resources required by the Herit API.

## Prerequisites

- `az` CLI installed and authenticated against the B2C tenant:
  ```bash
  az login --tenant <b2c-tenant-id> --allow-no-subscriptions
  ```
- The signed-in principal must have the following Microsoft Graph API permissions on the B2C tenant:
  - `Application.ReadWrite.All`
  - `IdentityProvider.ReadWrite.All`
- A Google OAuth 2.0 client ID and secret (created in the Google Cloud Console with the B2C redirect URI whitelisted: `https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/oauth2/authresp`).

---

## Step 1 — Run the setup script

```bash
./scripts/setup-b2c.sh \
  --tenant-id <b2c-tenant-id> \
  --google-client-id <google-oauth-client-id> \
  --google-client-secret <google-oauth-client-secret>
```

The script will:
1. Create the **Herit API** app registration in the B2C tenant (idempotent — safe to re-run).
2. Generate a client secret and print it to the console.
3. Register Google as a social identity provider.
4. Print all Key Vault values (see Step 3).

---

## Step 2 — Create the sign-up/sign-in user flow (manual)

The Microsoft Graph API does not support creating B2C user flows. This step must be performed in the Azure Portal.

**Navigation path:**

1. Open the [Azure Portal](https://portal.azure.com) and switch to the B2C tenant directory.
2. Search for and open **Azure AD B2C**.
3. In the left menu, select **User flows**.
4. Click **New user flow**.

**Settings:**

| Field | Value |
|---|---|
| User flow type | **Sign up and sign in** |
| Version | **Recommended** |
| Name | `B2C_1_SignUpSignIn` (must match the `b2c-user-flow` Key Vault secret) |
| Identity providers | Enable **Email signup** and **Google** |
| Multifactor authentication | Off (or as required by your security policy) |
| User attributes and claims | Collect: **Display Name**; Return: **Display Name**, **User's Object ID** |

Click **Create**.

---

## Step 3 — Populate Key Vault

Use the values printed by the script to set the following secrets in the Azure Key Vault provisioned by Bicep:

| Secret name | Value |
|---|---|
| `b2c-tenant-id` | The B2C tenant ID (GUID) |
| `b2c-client-id` | The app registration client ID |
| `b2c-client-secret` | The generated client secret |
| `b2c-authority` | `https://<tenant>.b2clogin.com` |
| `b2c-tenant` | `<tenant>.onmicrosoft.com` |
| `b2c-user-flow` | `B2C_1_SignUpSignIn` |

Using the `az` CLI:

```bash
KV_NAME=<your-key-vault-name>

az keyvault secret set --vault-name "$KV_NAME" --name b2c-tenant-id     --value "<value>"
az keyvault secret set --vault-name "$KV_NAME" --name b2c-client-id     --value "<value>"
az keyvault secret set --vault-name "$KV_NAME" --name b2c-client-secret --value "<value>"
az keyvault secret set --vault-name "$KV_NAME" --name b2c-authority     --value "<value>"
az keyvault secret set --vault-name "$KV_NAME" --name b2c-tenant        --value "<value>"
az keyvault secret set --vault-name "$KV_NAME" --name b2c-user-flow     --value "B2C_1_SignUpSignIn"
```

After secrets are set, restart the API App Service so it picks up the new Key Vault references:

```bash
az webapp restart --name <api-app-service-name> --resource-group <resource-group>
```

---

## Verification

### App registration

In the Azure Portal → **Azure AD B2C** → **App registrations**, confirm **Herit API** is listed with a non-empty Application (client) ID.

### Identity provider

In **Azure AD B2C** → **Identity providers**, confirm **Google** appears in the list.

### User flow

In **Azure AD B2C** → **User flows**, confirm `B2C_1_SignUpSignIn` is listed and its identity providers include **Email signup** and **Google**.

### API authentication

Send an authenticated request to the API using a token issued by the B2C tenant:

```bash
curl -H "Authorization: Bearer <token>" https://<api-hostname>/health
```

A `200 OK` response confirms the B2C JWT middleware is correctly configured.

# Entra External ID Setup

One-time provisioning of the Microsoft Entra External ID tenant resources required by Herit.

## Registrations and user flows at a glance

The tenant holds **three app registrations** and **two user flows**:

| App registration | Purpose | Platform / redirect URIs | Requested scope |
|---|---|---|---|
| **Herit API** | Protected Web API; issues/validates `access_as_user`. Holds the Graph app permissions for user provisioning. | (no SPA redirect URIs) | — |
| **Herit Portal SPA** | Expat-facing portal (`frontend/portal`). | SPA platform → portal app URL(s) | `api://<API-client-id>/access_as_user` |
| **Herit Staff SPA** | Staff-facing app (`frontend/staff`). | SPA platform → staff app URL(s) | `api://<API-client-id>/access_as_user` |

Each SPA has its **own** client id (surfaced to the build as `VITE_AZURE_CLIENT_ID`), while both mint the API scope against the shared **API** registration's client id (`VITE_AZURE_API_CLIENT_ID`). API-side token validation is unchanged — the audience is always the API registration.

| User flow | Identity providers | Associated app(s) |
|---|---|---|
| **Portal sign-up/sign-in** | Google (social sign-in) | Herit Portal SPA |
| **Staff sign-in** | Email + password (local accounts, provisioned by the API with SSPR) | Herit Staff SPA |

Associate each user flow with its app registration under **User flows → \<flow\> → Applications**.

## Prerequisites

- `az` CLI installed and authenticated against the Entra External ID tenant:
  ```bash
  az login --tenant <entra-tenant-id> --allow-no-subscriptions
  ```
- The signed-in principal must have the following Microsoft Graph API permissions on the tenant:
  - `Application.ReadWrite.All`
  - `IdentityProvider.ReadWrite.All`
- A Google OAuth 2.0 client ID and secret, created in the Google Cloud Console with **both** Entra External ID redirect URI forms whitelisted (Entra may send either, depending on how the authority is referenced; Google matches exactly):
  - `https://<tenant>.ciamlogin.com/<tenant>.onmicrosoft.com/federation/oauth2`
  - `https://<tenant>.ciamlogin.com/<tenant-id-GUID>/federation/oauth2`

---

## Step 1 — Run the setup script

```bash
./scripts/setup-entra-external-id.sh \
  --tenant-id <entra-tenant-id> \
  --google-client-id <google-oauth-client-id> \
  --google-client-secret <google-oauth-client-secret> \
  --portal-redirect-uri https://<portal-app-service-hostname> \
  --staff-redirect-uri https://<staff-app-service-hostname>
```

The script will:
1. Create/patch the **Herit API**, **Herit Portal SPA**, and **Herit Staff SPA** app registrations in the Entra External ID tenant (idempotent — safe to re-run).
2. Generate a client secret for the API registration and print it to the console.
3. Register each supplied `--portal-redirect-uri` / `--staff-redirect-uri` value under the **matching SPA's** own **SPA** platform (idempotent — unions with existing URIs; the two apps no longer share redirect URIs).
4. Register Google as a social identity provider via the Microsoft Graph API.
5. Print all Key Vault values (see Step 3), including each SPA's client id.

> **Note:** If Google identity provider configuration fails with a 404 or unsupported operation error, configure it manually via the Azure Portal: **Entra External ID → External Identities → All identity providers → Add → Google**.

> **Redirect URIs:** Each SPA has its own registration, so the portal URL is registered only on the Portal SPA and the staff URL only on the Staff SPA. Their hostnames are only known after `azd provision` provisions the App Services — read them from `azd env get-values` (`SERVICE_WEB_URI` / `SERVICE_STAFF_URI`) or the Azure Portal, then re-run the script with the `--portal-redirect-uri` / `--staff-redirect-uri` flags above. Patching an app registration requires `Application.ReadWrite.All`, so a tenant admin must run this step.

---

## Step 2 — Create the user flows (manual)

Creating user flows via the Microsoft Graph API is not yet fully supported for Entra External ID. This step must be performed in the Azure Portal.

The two audiences use **separate user flows** so their identity providers differ: the portal signs in with Google, and staff sign in with an email + password local account.

**Navigation path (repeat for each flow):**

1. Open the [Azure Portal](https://portal.azure.com) and switch to the Entra External ID tenant directory.
2. Search for and open **Microsoft Entra External ID**.
3. In the left menu, select **User flows**.
4. Click **New user flow**.

**Portal flow:**

| Field | Value |
|---|---|
| Flow type | **Sign up and sign in** |
| Name | `PortalSignUpSignIn` |
| Identity providers | Enable **Google** |
| User attributes | Collect: **Display Name**; Return: **Display Name**, **User's Object ID** |

**Staff flow:**

| Field | Value |
|---|---|
| Flow type | **Sign up and sign in** |
| Name | `StaffSignIn` |
| Identity providers | Enable **Email signup** (email + password local accounts) |
| User attributes | Collect: **Display Name**; Return: **Display Name**, **User's Object ID** |

Click **Create** for each.

**Associate each flow with its app:** open the flow → **Applications** → **Add application**, then add **Herit Portal SPA** to the portal flow and **Herit Staff SPA** to the staff flow.

> **Authority URL note:** Unlike Azure AD B2C, the user flow name is **not** included in the Entra External ID authority URL. The authority is simply `https://<tenant>.ciamlogin.com/<tenant>.onmicrosoft.com/` regardless of which user flow is invoked; the flow is selected by which app registration the request is made against.

---

## Step 3 — Populate Key Vault

Use the values printed by the script to set the following secrets in the Azure Key Vault provisioned by Bicep:

| Secret name | Value |
|---|---|
| `entra-tenant-id` | The Entra tenant ID (GUID) |
| `entra-client-id` | The **API** app registration client ID |
| `entra-client-secret` | The generated client secret (API registration) |
| `entra-authority` | `https://<tenant>.ciamlogin.com` |
| `entra-tenant` | `<tenant>.onmicrosoft.com` |
| `entra-portal-spa-client-id` | The **Portal SPA** app registration client ID |
| `entra-staff-spa-client-id` | The **Staff SPA** app registration client ID |

Using the `az` CLI:

```bash
KV_NAME=<your-key-vault-name>

az keyvault secret set --vault-name "$KV_NAME" --name entra-tenant-id            --value "<value>"
az keyvault secret set --vault-name "$KV_NAME" --name entra-client-id            --value "<value>"
az keyvault secret set --vault-name "$KV_NAME" --name entra-client-secret        --value "<value>"
az keyvault secret set --vault-name "$KV_NAME" --name entra-authority            --value "<value>"
az keyvault secret set --vault-name "$KV_NAME" --name entra-tenant               --value "<value>"
az keyvault secret set --vault-name "$KV_NAME" --name entra-portal-spa-client-id --value "<value>"
az keyvault secret set --vault-name "$KV_NAME" --name entra-staff-spa-client-id  --value "<value>"
```

After secrets are set, restart the API App Service so it picks up the new Key Vault references:

```bash
az webapp restart --name <api-app-service-name> --resource-group <resource-group>
```

---

## Verification

### App registrations

In the Azure Portal → **Microsoft Entra External ID** → **App registrations**, confirm **Herit API**, **Herit Portal SPA**, and **Herit Staff SPA** are each listed with a non-empty Application (client) ID, and that the portal/staff URLs appear as SPA redirect URIs on their respective SPA registrations only.

### Identity provider

In **Microsoft Entra External ID** → **External Identities** → **All identity providers**, confirm **Google** appears in the list.

### User flows

In **Microsoft Entra External ID** → **User flows**, confirm both the **portal** (Google) and **staff** (email + password) flows are listed and that each is associated with its app under the flow's **Applications** blade.

### API authentication

Send an authenticated request to the API using a token issued by the Entra External ID tenant:

```bash
curl -H "Authorization: Bearer <token>" https://<api-hostname>/health
```

A `200 OK` response confirms the Entra External ID JWT middleware is correctly configured.

# Super Admin Bootstrap

One-time CLI command to seed the first super admin user into both Entra External ID and the database.

The seeder provisions the Entra account through the Microsoft Graph `/users` API: a local
account is created with a random password that is discarded immediately and
`ForceChangePasswordNextSignIn` set, so the account exists but no one knows its password.
The user sets their own credentials via **Forgot password?** (SSPR) on the sign-in page.
The app registration must hold the admin-consented `User.ReadWrite.All` application
permission, and `AzureAd:Domain` must be configured (the tenant domain, used as the local
sign-in identity issuer).

## Command

```bash
dotnet run --project src/Herit.API -- --seed-super-admin --email admin@example.com --display-name "Super Admin"
```

Both `--email` and `--display-name` are required.

## Expected Output

### Super admin created

```
info: Herit.Application.Seeding.SuperAdminSeeder[0]
      Super admin created: admin@example.com (ExternalId: <entra-object-id>).
```

Process exits with code `0`.

### Super admin already exists

```
info: Herit.Application.Seeding.SuperAdminSeeder[0]
      Super admin already exists. No action taken.
```

Process exits with code `0`. The command is idempotent — running it again is safe.

### Missing required arguments

```
Error: missing required argument(s): --email
Usage: dotnet run --project Herit.API -- --seed-super-admin --email <email> --display-name <name>
```

Process exits with code `1`.

## Verification

**Entra:** In the Entra admin center, navigate to the tenant → Users and confirm the account exists with the email provided.

**Database:** Run the following query against the application database:

```sql
SELECT Id, ExternalId, Email, FullName, Role
FROM Users
WHERE Role = 0; -- 0 = SuperAdmin
```

Confirm one row is returned with the expected email and a non-null `ExternalId` matching the Entra object ID.

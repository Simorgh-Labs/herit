# Super Admin Bootstrap

One-time CLI command to seed the first super admin user into both Entra External ID and the database.

The seeder provisions the Entra account through the Microsoft Graph `/invitations` API:
Entra emails an invitation with the sign-in link to the provided address, and the user
redeems it to set up their credentials. No temporary password is involved. The app
registration must hold the admin-consented `User.Invite.All` application permission, and
`AzureAd:InviteRedirectUrl` must be configured (the staff app URL; wired automatically in
Azure via Bicep, set to `http://localhost:5174` in `appsettings.Development.json`).

## Command

```bash
dotnet run --project src/Herit.API -- --seed-super-admin --email admin@example.com --display-name "Super Admin"
```

Both `--email` and `--display-name` are required.

## Expected Output

### Super admin created

```
info: Herit.Application.Seeding.SuperAdminSeeder[0]
      Super admin created: admin@example.com (ExternalId: <entra-object-id>). An invitation email with the sign-in link has been sent.
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

**Email:** The invited address receives an Entra invitation email; redeeming it lands the
user on the staff app URL configured as `AzureAd:InviteRedirectUrl`.

**Entra:** In the Entra admin center, navigate to the tenant → Users and confirm the account exists with the email provided.

**Database:** Run the following query against the application database:

```sql
SELECT Id, ExternalId, Email, FullName, Role
FROM Users
WHERE Role = 0; -- 0 = SuperAdmin
```

Confirm one row is returned with the expected email and a non-null `ExternalId` matching the B2C object ID.

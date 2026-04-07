# Super Admin Bootstrap

One-time CLI command to seed the first super admin user into both Azure AD B2C and the database.

## Command

```bash
dotnet run --project src/Herit.API -- --seed-super-admin --email admin@example.com --display-name "Super Admin"
```

Both `--email` and `--display-name` are required.

## Expected Output

### Super admin created

```
info: Herit.Application.Seeding.SuperAdminSeeder[0]
      Super admin created: admin@example.com (ExternalId: <b2c-object-id>)
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

**B2C:** In the Azure portal, navigate to the B2C tenant → Users and confirm the account exists with the email provided.

**Database:** Run the following query against the application database:

```sql
SELECT Id, ExternalId, Email, FullName, Role
FROM Users
WHERE Role = 0; -- 0 = SuperAdmin
```

Confirm one row is returned with the expected email and a non-null `ExternalId` matching the B2C object ID.

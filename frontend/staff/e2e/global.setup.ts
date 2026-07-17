import { execFileSync } from 'node:child_process';
import { test as setup } from '@playwright/test';
import { API_PROJECT, REPO_ROOT, SUPER_ADMIN_EMAIL, SUPER_ADMIN_NAME } from './support/config';
import { Api } from './support/api';
import { externalIdFor, mintToken } from './support/tokens';
import { writeRunState, writeStorageState, type TestIdentity } from './support/run-state';

/**
 * Builds the known-good baseline every spec depends on, going through the same
 * paths production uses (CLI seeder + public API — never direct DB writes):
 *
 *  1. Super admin via the existing CLI seeder (`--seed-super-admin`). Only this
 *     actor can bootstrap the organisation hierarchy. Idempotent across runs.
 *  2. Organisation hierarchy (root ministry + child agency) as the super admin.
 *  3. An org admin and a plain staff user (Graph replaced by the local fake), so
 *     the admin-only surfaces and the role gate both have real identities.
 *  4. Expat users (owner + contributor), registered through the same JIT path
 *     the portal uses (GET /Users/me) and terms-accepted via the API, so they
 *     can drive the portal in the cross-app scenarios. A further identity is
 *     minted but deliberately NOT provisioned — it exercises the 404 access gate.
 *
 * Storage states are origin-scoped (staff vs portal): the same identity can be
 * signed into either app because both read the shared localStorage token
 * contract. All run-scoped records carry the runId in their titles so runs
 * never depend on (or collide with) data left behind by earlier local runs.
 */
setup('seed the E2E baseline', async () => {
  setup.setTimeout(180_000);

  execFileSync('dotnet', [
    'run', '--no-launch-profile', '--project', API_PROJECT, '--',
    '--seed-super-admin', '--email', SUPER_ADMIN_EMAIL, '--display-name', SUPER_ADMIN_NAME,
  ], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: { ...process.env, ASPNETCORE_ENVIRONMENT: 'E2E' },
  });

  const runId = Date.now().toString(36);

  const identityFor = async (slug: string, name: string): Promise<TestIdentity> => {
    const email = `${slug}-${runId}@e2e.herit.local`;
    return { email, name, externalId: externalIdFor(email), token: await mintToken(email, name) };
  };

  const superAdmin: TestIdentity = {
    email: SUPER_ADMIN_EMAIL,
    name: SUPER_ADMIN_NAME,
    externalId: externalIdFor(SUPER_ADMIN_EMAIL),
    token: await mintToken(SUPER_ADMIN_EMAIL, SUPER_ADMIN_NAME),
  };
  const orgAdmin = await identityFor('org-admin', 'E2E Org Admin');
  const staff = await identityFor('staff', 'E2E Staff Member');
  const expat = await identityFor('expat', 'Expat Owner');
  const expatB = await identityFor('expat-b', 'Expat Contributor');
  const expatC = await identityFor('expat-c', 'Expat Applicant');
  const unprovisioned = await identityFor('unprovisioned', 'Unprovisioned Visitor');

  const admin = await Api.forToken(superAdmin.token);

  const rootOrgName = `Ministry of Health (E2E ${runId})`;
  const rootOrgId = await admin.createOrganisation(rootOrgName);
  const childOrgName = `Digital Health Agency (E2E ${runId})`;
  const childOrgId = await admin.createOrganisation(childOrgName, rootOrgId);

  const orgAdminUserId = await admin.createOrganisationAdmin(orgAdmin.email, orgAdmin.name, rootOrgId);
  const staffUserId = await admin.createStaffUser(staff.email, staff.name, rootOrgId);

  // JIT-register the expats, then accept terms so the portal's ProtectedRoute
  // lets them in for the cross-app steps.
  for (const identity of [expat, expatB, expatC]) {
    const api = await Api.forToken(identity.token);
    await api.getMe();
    await api.acceptTerms({ email: identity.email, nationality: 'Australia', location: 'Sydney', expertiseTags: 'Health IT' });
    await api.dispose();
  }

  // Staff-app identities.
  writeStorageState('staff-orgadmin', 'staff', orgAdmin);
  writeStorageState('staff-staff', 'staff', staff);
  writeStorageState('staff-staff-pending', 'staff', staff, { pending: true });
  writeStorageState('staff-expat', 'staff', expat);
  writeStorageState('staff-unprovisioned', 'staff', unprovisioned);
  // Portal identities (for cross-app assertions).
  writeStorageState('portal-expat', 'portal', expat);
  writeStorageState('portal-expatB', 'portal', expatB);

  writeRunState({
    runId,
    rootOrgId,
    rootOrgName,
    childOrgId,
    childOrgName,
    orgAdminUserId,
    staffUserId,
    identities: { superAdmin, orgAdmin, staff, expat, expatB, expatC, unprovisioned },
  });

  await admin.dispose();
});

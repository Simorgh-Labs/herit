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
 *  3. A staff user + a Published RFP, so unauthenticated RFP browsing has data.
 *  4. Expat users A (owner) and B (contributor), registered through the same
 *     JIT path the SPA uses (GET /Users/me) and terms-accepted via the API.
 *     User A1 is minted but deliberately NOT registered — scenario 1 walks it
 *     through the first-time JIT registration UI.
 *
 * All run-scoped records carry the runId in their titles so runs never depend
 * on (or collide with) data left behind by earlier local runs.
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
  const staff = await identityFor('staff', 'E2E Staff Member');
  const userA = await identityFor('user-a', 'Expat User A');
  const userB = await identityFor('user-b', 'Expat User B');
  const userA1 = await identityFor('user-a1', 'Expat User A1');

  const admin = await Api.forToken(superAdmin.token);

  const rootOrgName = `Ministry of Health (E2E ${runId})`;
  const rootOrgId = await admin.createOrganisation(rootOrgName);
  const childOrgName = `Digital Health Agency (E2E ${runId})`;
  const childOrgId = await admin.createOrganisation(childOrgName, rootOrgId);

  const staffUserId = await admin.createStaffUser(staff.email, staff.name, rootOrgId);
  const staffApi = await Api.forToken(staff.token);
  const rfpTitle = `National Health Data Platform (E2E ${runId})`;
  const rfpId = await staffApi.createRfp({
    title: rfpTitle,
    shortDescription: 'Modernise the national health data exchange.',
    organisationId: rootOrgId,
    longDescription: 'The ministry seeks proposals to build an interoperable national health data platform.',
    tags: 'Health, Data, Interoperability',
  });
  await staffApi.updateRfpStatus(rfpId, 'Approved');
  await staffApi.updateRfpStatus(rfpId, 'Published');

  // JIT-register A and B, then accept terms so ProtectedRoute lets them in.
  for (const identity of [userA, userB]) {
    const api = await Api.forToken(identity.token);
    await api.getMe();
    await api.acceptTerms({ email: identity.email, nationality: 'Australia', location: 'Sydney', expertiseTags: 'Health IT' });
    await api.dispose();
  }

  writeStorageState('userA', userA);
  writeStorageState('userB', userB);
  writeStorageState('userA1-pending', userA1, { pending: true });

  writeRunState({
    runId,
    rootOrgId,
    rootOrgName,
    childOrgId,
    childOrgName,
    rfpId,
    rfpTitle,
    staffUserId,
    identities: { superAdmin, staff, userA, userB, userA1 },
  });

  await admin.dispose();
  await staffApi.dispose();
});

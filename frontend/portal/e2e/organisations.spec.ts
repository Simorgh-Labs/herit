import { expect, test } from '@playwright/test';
import { Api } from './support/api';
import { readRunState, type RunState } from './support/run-state';

/**
 * Backend hardening (issue #284): deleting an organisation with attached
 * records must surface a 409 Conflict rather than an unhandled DB error.
 */

let state: RunState;
let admin: Api;

test.beforeAll(async () => {
  state = readRunState();
  admin = await Api.forToken(state.identities.superAdmin.token);
});

test.afterAll(async () => {
  await admin.dispose();
});

test('deleting an organisation with attached records returns 409, empty organisation deletes cleanly', async ({}, testInfo) => {
  const scope = `${state.runId}-w${testInfo.workerIndex}`;
  const orgId = await admin.createOrganisation(`Org delete conflict fixture (E2E ${scope})`);

  const staffUserId = await admin.createStaffUser(
    `org-delete-conflict-${scope}@e2e.herit.local`,
    'Org Delete Conflict Fixture Staff',
    orgId,
  );

  const conflictResponse = await admin.raw('DELETE', `/Organisations/${orgId}`);
  expect(conflictResponse.status()).toBe(409);

  await admin.deleteStaffUser(staffUserId);

  const emptyResponse = await admin.raw('DELETE', `/Organisations/${orgId}`);
  expect(emptyResponse.status()).toBe(204);
});

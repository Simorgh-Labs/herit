import { test as teardown } from '@playwright/test';
import { Api } from './support/api';
import { readRunState } from './support/run-state';

/**
 * Best-effort cleanup through the public API. Some records intentionally have
 * no delete path (CFEOIs, withdrawn proposals, expat users), so anything that
 * refuses deletion is left behind — every record carries the runId in its
 * title, so later runs neither depend on nor collide with leftovers. CI
 * databases are ephemeral; local databases can be reset by recreating the
 * HeritE2E database (see docs/frontend/staff/e2e-testing.md).
 */
teardown('clean up run-scoped data', async () => {
  const state = readRunState();
  const attempt = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
    } catch {
      console.log(`[e2e teardown] left behind: ${label}`);
    }
  };

  // Withdraw the expats' remaining EOIs and delete their still-deletable proposals.
  for (const key of ['expat', 'expatB'] as const) {
    const api = await Api.forToken(state.identities[key].token);
    await attempt(`${key} EOIs`, async () => {
      for (const eoi of await api.listMyEois()) await attempt(`EOI ${eoi.id}`, () => api.withdrawEoi(eoi.id));
    });
    await attempt(`${key} proposals`, async () => {
      const me = await api.getMe();
      const mine = (await api.listProposals()).filter((p) => p.authorId === me.id);
      for (const proposal of mine) await attempt(`proposal "${proposal.title}"`, () => api.deleteProposal(proposal.id));
    });
    await api.dispose();
  }

  const admin = await Api.forToken(state.identities.superAdmin.token);
  // Remove any run-scoped RFPs still present.
  await attempt('run RFPs', async () => {
    for (const rfp of await admin.listRfps()) {
      if (rfp.title.includes(`E2E ${state.runId}`)) await attempt(`RFP "${rfp.title}"`, () => admin.deleteRfp(rfp.id));
    }
  });
  await attempt('staff user', () => admin.deleteStaffUser(state.staffUserId));
  await attempt('org admin user', () => admin.deleteOrganisationAdmin(state.orgAdminUserId));
  await attempt(`organisation "${state.childOrgName}"`, () => admin.deleteOrganisation(state.childOrgId));
  await attempt(`organisation "${state.rootOrgName}"`, () => admin.deleteOrganisation(state.rootOrgId));
  await admin.dispose();
});

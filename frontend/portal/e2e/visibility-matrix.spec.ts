import { expect, test, type Page } from '@playwright/test';
import { Api, type CfeoiDto, type ProposalDto } from './support/api';
import { openSession } from './support/session';
import { readRunState, type RunState } from './support/run-state';

/**
 * Scenario 2 — the server-side visibility rules hardened in #267, asserted on
 * both the UI and the API responses (the point is that filtering happens
 * server-side, not in the client).
 *
 * Fixtures (created via the API as user A): one proposal per visibility level,
 * each in Resourcing with one Open CFEOI, so the CFEOI directory can be checked
 * against the parent proposal's visibility.
 */

let state: RunState;
let apiA: Api;
let apiB: Api;
let anon: Api;

const titles = { Public: '', Shared: '', Private: '' };
const cfeoiTitles = { Public: '', Shared: '', Private: '' };
let publicCfeoiId = '';

let scope = '';

test.beforeAll(async ({}, testInfo) => {
  state = readRunState();
  // Worker-scoped suffix: if Playwright restarts the worker after a failure,
  // beforeAll runs again — fresh titles keep re-seeded fixtures unambiguous.
  scope = `${state.runId}-w${testInfo.workerIndex}`;
  apiA = await Api.forToken(state.identities.userA.token);
  apiB = await Api.forToken(state.identities.userB.token);
  anon = await Api.anonymous();

  for (const visibility of ['Public', 'Shared', 'Private'] as const) {
    titles[visibility] = `VM ${visibility} proposal (E2E ${scope})`;
    cfeoiTitles[visibility] = `VM ${visibility} role (E2E ${scope})`;
    const proposalId = await apiA.createProposal({
      title: titles[visibility],
      shortDescription: `Visibility-matrix fixture (${visibility}).`,
      longDescription: 'Fixture proposal for the visibility matrix.',
      organisationId: state.childOrgId,
    });
    await apiA.setProposalVisibility(proposalId, visibility);
    await apiA.setProposalStatus(proposalId, 'Resourcing');
    const cfeoiId = await apiA.publishCfeoi({
      title: cfeoiTitles[visibility],
      description: `Fixture CFEOI under the ${visibility} proposal.`,
      resourceType: 'Human',
      proposalId,
    });
    if (visibility === 'Public') publicCfeoiId = cfeoiId;
  }
});

test.afterAll(async () => {
  await Promise.all([apiA.dispose(), apiB.dispose(), anon.dispose()]);
});

const proposalTitles = (proposals: ProposalDto[]) => proposals.map((p) => p.title);
const cfeoiNames = (cfeois: CfeoiDto[]) => cfeois.map((c) => c.title);

async function searchProposals(page: Page, query: string) {
  await page.goto('/proposals');
  await page.getByPlaceholder('Search proposals by title or description...').fill(query);
}

async function searchCfeois(page: Page, query: string) {
  await page.goto('/cfeois');
  await page.getByPlaceholder('Search by title or tags…').fill(query);
}

test('anonymous callers receive only Public proposals (API + UI)', async ({ browser }) => {
  const returned = proposalTitles(await anon.listProposals());
  expect(returned).toContain(titles.Public);
  expect(returned).not.toContain(titles.Shared);
  expect(returned).not.toContain(titles.Private);

  const { context, page } = await openSession(browser);
  await searchProposals(page, `VM`);
  await expect(page.getByRole('heading', { name: titles.Public })).toBeVisible();
  await expect(page.getByRole('heading', { name: titles.Shared })).toBeHidden();
  await expect(page.getByRole('heading', { name: titles.Private })).toBeHidden();
  await context.close();
});

test('authenticated non-owner receives Public + Shared, never Private (API + UI)', async ({ browser }) => {
  const returned = proposalTitles(await apiB.listProposals());
  expect(returned).toContain(titles.Public);
  expect(returned).toContain(titles.Shared);
  expect(returned).not.toContain(titles.Private);

  const { context, page } = await openSession(browser, 'userB');
  await searchProposals(page, `VM`);
  await expect(page.getByRole('heading', { name: titles.Public })).toBeVisible();
  await expect(page.getByRole('heading', { name: titles.Shared })).toBeVisible();
  await expect(page.getByRole('heading', { name: titles.Private })).toBeHidden();
  await context.close();
});

test('the owner sees all three visibility levels (API + UI)', async ({ browser }) => {
  const returned = proposalTitles(await apiA.listProposals());
  expect(returned).toEqual(expect.arrayContaining([titles.Public, titles.Shared, titles.Private]));

  const { context, page } = await openSession(browser, 'userA');
  await searchProposals(page, `VM`);
  await expect(page.getByRole('heading', { name: titles.Public })).toBeVisible();
  await expect(page.getByRole('heading', { name: titles.Shared })).toBeVisible();
  await expect(page.getByRole('heading', { name: titles.Private })).toBeVisible();
  await context.close();
});

test('the CFEOI directory follows the parent proposal visibility', async ({ browser }) => {
  const anonReturned = cfeoiNames(await anon.listCfeois({ status: 'Open' }));
  expect(anonReturned).toContain(cfeoiTitles.Public);
  expect(anonReturned).not.toContain(cfeoiTitles.Shared);
  expect(anonReturned).not.toContain(cfeoiTitles.Private);

  const bReturned = cfeoiNames(await apiB.listCfeois({ status: 'Open' }));
  expect(bReturned).toContain(cfeoiTitles.Public);
  expect(bReturned).toContain(cfeoiTitles.Shared);
  expect(bReturned).not.toContain(cfeoiTitles.Private);

  const aReturned = cfeoiNames(await apiA.listCfeois({ status: 'Open' }));
  expect(aReturned).toEqual(expect.arrayContaining([cfeoiTitles.Public, cfeoiTitles.Shared, cfeoiTitles.Private]));

  const anonSession = await openSession(browser);
  await searchCfeois(anonSession.page, 'VM');
  await expect(anonSession.page.getByRole('heading', { name: cfeoiTitles.Public })).toBeVisible();
  await expect(anonSession.page.getByRole('heading', { name: cfeoiTitles.Shared })).toBeHidden();
  await expect(anonSession.page.getByRole('heading', { name: cfeoiTitles.Private })).toBeHidden();
  await anonSession.context.close();

  const bSession = await openSession(browser, 'userB');
  await searchCfeois(bSession.page, 'VM');
  await expect(bSession.page.getByRole('heading', { name: cfeoiTitles.Public })).toBeVisible();
  await expect(bSession.page.getByRole('heading', { name: cfeoiTitles.Shared })).toBeVisible();
  await expect(bSession.page.getByRole('heading', { name: cfeoiTitles.Private })).toBeHidden();
  await bSession.context.close();
});

test('a Private proposal detail is not rendered for anonymous visitors', async ({ browser }) => {
  const privateProposal = (await apiA.listProposals()).find((p) => p.title === titles.Private)!;
  const { context, page } = await openSession(browser);
  await page.goto(`/proposals/${privateProposal.id}`);
  await expect(page.getByText('This proposal is not publicly available.')).toBeVisible();
  await context.close();
});

test("a Private EOI stays out of the owner's inbox until it is Shared", async ({ browser }) => {
  const message = `VM inbox-privacy EOI (E2E ${state.runId})`;
  const eoiId = await apiB.submitEoi(publicCfeoiId, message);

  // While Private: not in the owner's inbox — UI and API.
  const a = await openSession(browser, 'userA');
  await a.page.goto(`/cfeois/${publicCfeoiId}/eois`);
  await expect(a.page.getByText('No expressions of interest have been shared for this CFEOI yet.')).toBeVisible();
  const whilePrivate = await apiA.listEoisByCfeoi(publicCfeoiId);
  expect(whilePrivate.map((e) => e.id)).not.toContain(eoiId);

  // After B flips it to Shared: visible to the owner — API and UI.
  await apiB.setEoiVisibility(eoiId, 'Shared');
  const whileShared = await apiA.listEoisByCfeoi(publicCfeoiId);
  expect(whileShared.map((e) => e.id)).toContain(eoiId);

  await a.page.reload();
  await expect(a.page.getByText(message)).toBeVisible();
  await a.context.close();

  await apiB.withdrawEoi(eoiId);
});

import { expect, test, type Page } from '@playwright/test';
import { Api } from './support/api';
import { openSession } from './support/session';
import { readRunState, type RunState } from './support/run-state';

/**
 * Scenario 6 — administration surfaces (org admin only): organisation-tree CRUD
 * including the bootstrap empty state and the 409 refusal on deleting a
 * non-empty organisation, plus user management with the client-side delete
 * guards and their server backstops (self-delete 403, last-org-admin 409).
 */

let state: RunState;

test.beforeAll(() => {
  state = readRunState();
});

const dialog = (page: Page) => page.getByRole('dialog');
/** An organisation-tree row: rows carry `border-b`, the table container does not. */
const orgRow = (page: Page, name: string) => page.locator('div.border-b').filter({ hasText: name });
/** A users-table row: header and data rows are `div.grid`; filter by a unique cell. */
const userRow = (page: Page, cell: string) => page.locator('div.grid').filter({ hasText: cell });

test('the organisation tree shows the bootstrap empty state when there are none', async ({ browser }) => {
  const s = await openSession(browser, 'staff', 'staff-orgadmin');
  // Stub the list endpoint so the page renders its zero-organisations bootstrap
  // without disturbing the shared, seeded hierarchy.
  await s.page.route('**/api/v1/Organisations', async (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
    return route.fallback();
  });
  await s.page.goto(s.url('/organisations'));
  await expect(s.page.getByRole('heading', { name: 'No organisations yet' })).toBeVisible();
  await expect(s.page.getByRole('button', { name: 'Create root organisation' })).toBeVisible();
  await s.context.close();
});

test('org admin can create, rename, and delete a sub-organisation, and is refused deleting a non-empty one', async ({ browser }) => {
  test.setTimeout(120_000);

  const subName = `Analytics Unit (E2E ${state.runId})`;
  const renamedName = `Analytics & Insights Unit (E2E ${state.runId})`;

  const s = await openSession(browser, 'staff', 'staff-orgadmin');
  await s.page.goto(s.url('/organisations'));
  await expect(orgRow(s.page, state.rootOrgName)).toBeVisible();

  await test.step('create a sub-organisation', async () => {
    // Each tree row also exposes an icon-only "Create sub-organisation" button;
    // the page-level action is the first in DOM order.
    await s.page.getByRole('button', { name: 'Create sub-organisation' }).first().click();
    const createModal = dialog(s.page);
    await createModal.getByPlaceholder('Organisation name').fill(subName);
    await createModal.getByRole('button', { name: 'Create' }).click();
    await expect(dialog(s.page)).toBeHidden();
    await expect(orgRow(s.page, subName)).toBeVisible();
  });

  await test.step('rename the sub-organisation', async () => {
    await orgRow(s.page, subName).getByRole('button', { name: 'Rename' }).click();
    const renameModal = dialog(s.page);
    await renameModal.getByPlaceholder('Organisation name').fill(renamedName);
    await renameModal.getByRole('button', { name: 'Save' }).click();
    await expect(dialog(s.page)).toBeHidden();
    await expect(orgRow(s.page, renamedName)).toBeVisible();
  });

  await test.step('delete the (empty) sub-organisation', async () => {
    await orgRow(s.page, renamedName).getByRole('button', { name: 'Delete' }).click();
    const deleteModal = dialog(s.page);
    await expect(deleteModal.getByRole('button', { name: 'Delete organisation' })).toBeDisabled();
    await deleteModal.getByRole('checkbox').check();
    await deleteModal.getByRole('button', { name: 'Delete organisation' }).click();
    await expect(dialog(s.page)).toBeHidden();
    await expect(orgRow(s.page, renamedName)).toHaveCount(0);
  });

  await test.step('deleting the non-empty root is refused with the server message', async () => {
    await orgRow(s.page, state.rootOrgName).getByRole('button', { name: 'Delete' }).click();
    const deleteModal = dialog(s.page);
    await deleteModal.getByRole('checkbox').check();
    await deleteModal.getByRole('button', { name: 'Delete organisation' }).click();
    // The 409 swaps in the conflict dialog carrying the API's message.
    await expect(s.page.getByRole('heading', { name: `Couldn't delete ${state.rootOrgName}` })).toBeVisible();
    await expect(s.page.getByText(/cannot be deleted/)).toBeVisible();
    await dialog(s.page).getByRole('button', { name: 'Close' }).click();
  });

  await s.context.close();
});

test('org admin manages staff users, and delete guards hold on client and server', async ({ browser }) => {
  test.setTimeout(120_000);

  const newEmail = `provisioned-staff-${state.runId}@e2e.herit.local`;
  const newName = 'Provisioned Staff Member';
  const editedName = 'Provisioned Staff Lead';

  const s = await openSession(browser, 'staff', 'staff-orgadmin');
  await s.page.goto(s.url('/users'));
  await expect(s.page.getByRole('heading', { name: 'Users', level: 1 })).toBeVisible();

  await test.step('create a staff user', async () => {
    await s.page.getByRole('button', { name: 'Create staff' }).click();
    const createModal = dialog(s.page);
    await createModal.getByPlaceholder('Work email').fill(newEmail);
    await createModal.getByPlaceholder('Full name').fill(newName);
    await createModal.getByRole('combobox').selectOption({ label: state.rootOrgName });
    await createModal.getByRole('button', { name: 'Create staff user' }).click();
    await expect(dialog(s.page)).toBeHidden();
    await expect(userRow(s.page, newEmail)).toBeVisible();
  });

  await test.step('edit the staff user', async () => {
    await userRow(s.page, newEmail).getByRole('button', { name: 'Edit' }).click();
    const editModal = dialog(s.page);
    await editModal.getByPlaceholder('Full name').fill(editedName);
    await editModal.getByRole('button', { name: 'Save changes' }).click();
    await expect(dialog(s.page)).toBeHidden();
    await expect(userRow(s.page, editedName)).toBeVisible();
  });

  await test.step('the org admin cannot delete their own account (client guard hides the action)', async () => {
    const ownRow = userRow(s.page, state.identities.orgAdmin.email);
    await expect(ownRow.getByText('(you)')).toBeVisible();
    await expect(ownRow.getByRole('button', { name: 'Delete' })).toHaveCount(0);
  });

  await test.step('delete the staff user', async () => {
    await userRow(s.page, editedName).getByRole('button', { name: 'Delete' }).click();
    const deleteModal = dialog(s.page);
    await expect(deleteModal.getByRole('button', { name: 'Delete user' })).toBeDisabled();
    await deleteModal.getByRole('checkbox').check();
    await deleteModal.getByRole('button', { name: 'Delete user' }).click();
    await expect(dialog(s.page)).toBeHidden();
    await expect(userRow(s.page, newEmail)).toHaveCount(0);
  });

  await test.step('server backstops: self-delete is 403 and last-org-admin delete is 409', async () => {
    // Self-delete is refused first, regardless of how many admins exist.
    const orgAdminApi = await Api.forToken(state.identities.orgAdmin.token);
    const selfDelete = await orgAdminApi.raw('DELETE', `/Users/organisation-admins/${state.orgAdminUserId}`);
    expect(selfDelete.status()).toBe(403);
    await orgAdminApi.dispose();

    // Make the seeded org admin the last one (a dirty local DB can carry org
    // admins left behind by earlier runs), so the last-admin backstop is
    // deterministic; a super admin deleting it is then refused with 409.
    const adminApi = await Api.forToken(state.identities.superAdmin.token);
    const others = (await adminApi.listUsers()).filter(
      (u) => u.role === 'OrganisationAdmin' && u.id !== state.orgAdminUserId,
    );
    for (const other of others) await adminApi.deleteOrganisationAdmin(other.id);
    const lastAdminDelete = await adminApi.raw('DELETE', `/Users/organisation-admins/${state.orgAdminUserId}`);
    expect(lastAdminDelete.status()).toBe(409);
    await adminApi.dispose();
  });

  await s.context.close();
});

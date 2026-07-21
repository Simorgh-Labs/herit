import { expect, test } from '@playwright/test';
import { openSession } from './support/session';
import { readRunState, type RunState } from './support/run-state';

/**
 * Scenario 1 — auth & role gate (ADR-015): the staff app is for provisioned
 * Staff/Admin identities only. A plain staff user reaches the dashboard but
 * never the admin surfaces; an expat and an unprovisioned identity are both
 * turned away at the access gate.
 */

let state: RunState;

test.beforeAll(() => {
  state = readRunState();
});

test('a provisioned staff member signs in and reaches the dashboard', async ({ browser }) => {
  // The identity is staged (pendingAuth), so the sign-in button drives the
  // fake Entra redirect round-trip itself.
  const s = await openSession(browser, 'staff', 'staff-staff-pending');
  await s.page.goto(s.url('/sign-in'));
  await expect(s.page.getByRole('heading', { name: 'Sign in to Herit Staff' })).toBeVisible();
  await s.page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await s.page.goto(s.url('/'));
  await expect(s.page.getByRole('heading', { name: `Welcome back, ${state.identities.staff.name}` })).toBeVisible();
  await expect(s.page.getByRole('navigation').getByRole('link', { name: 'Dashboard' })).toBeVisible();
  await s.context.close();
});

test('admin-only nav is hidden from a plain staff member, and admin pages are blocked', async ({ browser }) => {
  const s = await openSession(browser, 'staff', 'staff-staff');
  await s.page.goto(s.url('/'));
  const nav = s.page.getByRole('navigation');
  await expect(nav.getByRole('link', { name: 'RFPs' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Proposals' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Organisations' })).toHaveCount(0);
  await expect(nav.getByRole('link', { name: 'Users' })).toHaveCount(0);

  // Direct navigation to admin routes is refused at the page level (no data leaks).
  await s.page.goto(s.url('/organisations'));
  await expect(s.page.getByText("You don't have access to organisation management.")).toBeVisible();
  await s.page.goto(s.url('/users'));
  await expect(s.page.getByText("You don't have access to user management.")).toBeVisible();
  await s.context.close();
});

test('an org admin sees the admin-only nav items', async ({ browser }) => {
  const s = await openSession(browser, 'staff', 'staff-orgadmin');
  await s.page.goto(s.url('/'));
  const nav = s.page.getByRole('navigation');
  await expect(nav.getByRole('link', { name: 'Organisations' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Users' })).toBeVisible();
  await s.context.close();
});

test('an expat identity is turned away at the access gate', async ({ browser }) => {
  const s = await openSession(browser, 'staff', 'staff-expat');
  await s.page.goto(s.url('/'));
  await s.page.waitForURL('**/access-denied');
  await expect(s.page.getByRole('heading', { name: 'This application is for Herit staff' })).toBeVisible();
  await s.context.close();
});

test('an unprovisioned identity is turned away at the access gate', async ({ browser }) => {
  const s = await openSession(browser, 'staff', 'staff-unprovisioned');
  await s.page.goto(s.url('/'));
  await s.page.waitForURL('**/access-denied');
  await expect(s.page.getByRole('heading', { name: 'This application is for Herit staff' })).toBeVisible();
  await s.context.close();
});

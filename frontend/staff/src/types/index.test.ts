import { isStaffRole } from './index';

describe('isStaffRole', () => {
  it.each(['Staff', 'OrganisationAdmin', 'SuperAdmin'] as const)('treats %s as a staff role', (role) => {
    expect(isStaffRole(role)).toBe(true);
  });

  it('does not treat Expat as a staff role', () => {
    expect(isStaffRole('Expat')).toBe(false);
  });
});

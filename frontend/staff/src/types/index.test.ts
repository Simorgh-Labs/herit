import { isAdminRole, isStaffRole, roleLabel } from './index';

describe('isStaffRole', () => {
  it.each(['Staff', 'OrganisationAdmin', 'SuperAdmin'] as const)('treats %s as a staff role', (role) => {
    expect(isStaffRole(role)).toBe(true);
  });

  it('does not treat Expat as a staff role', () => {
    expect(isStaffRole('Expat')).toBe(false);
  });
});

describe('isAdminRole', () => {
  it.each(['OrganisationAdmin', 'SuperAdmin'] as const)('treats %s as an admin role', (role) => {
    expect(isAdminRole(role)).toBe(true);
  });

  it.each(['Staff', 'Expat'] as const)('does not treat %s as an admin role', (role) => {
    expect(isAdminRole(role)).toBe(false);
  });
});

describe('roleLabel', () => {
  it('renders a human-readable label for each role', () => {
    expect(roleLabel('Staff')).toBe('Staff');
    expect(roleLabel('OrganisationAdmin')).toBe('Organisation Admin');
    expect(roleLabel('SuperAdmin')).toBe('Super Admin');
  });
});

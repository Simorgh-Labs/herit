import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders proposal status with correct label', () => {
    render(<StatusBadge type="proposal" status="UnderReview" />);
    expect(screen.getByText('Under Review')).toBeInTheDocument();
  });

  it('renders cfeoi Open status', () => {
    render(<StatusBadge type="cfeoi" status="Open" />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders eoi Pending status', () => {
    render(<StatusBadge type="eoi" status="Pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('applies correct styles for Approved proposal', () => {
    const { container } = render(<StatusBadge type="proposal" status="Approved" />);
    expect(container.firstChild).toHaveClass('bg-green-100');
  });

  it('applies correct styles for Withdrawn proposal', () => {
    const { container } = render(<StatusBadge type="proposal" status="Withdrawn" />);
    expect(container.firstChild).toHaveClass('bg-red-100');
  });
});

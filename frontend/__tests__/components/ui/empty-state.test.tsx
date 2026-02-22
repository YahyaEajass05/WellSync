import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '@/components/ui/empty-state';
import { Brain } from 'lucide-react';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState icon={Brain} title="No data" description="Nothing here" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
  it('renders description', () => {
    render(<EmptyState icon={Brain} title="No data" description="Nothing here yet" />);
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });
  it('renders action button when action provided', () => {
    const onClick = jest.fn();
    render(<EmptyState icon={Brain} title="No data" description="Desc" action={{ label: 'Add Item', onClick }} />);
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });
  it('calls action onClick when button is clicked', () => {
    const onClick = jest.fn();
    render(<EmptyState icon={Brain} title="No data" description="Desc" action={{ label: 'Add', onClick }} />);
    fireEvent.click(screen.getByText('Add'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it('does not render button when no action', () => {
    render(<EmptyState icon={Brain} title="No data" description="Desc" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState } from '@/components/ui/error-state';

describe('ErrorState', () => {
  it('renders default title', () => {
    render(<ErrorState />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
  it('renders custom title', () => {
    render(<ErrorState title="Custom Error" />);
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });
  it('renders default message', () => {
    render(<ErrorState />);
    expect(screen.getByText(/An error occurred/)).toBeInTheDocument();
  });
  it('renders custom message', () => {
    render(<ErrorState message="Custom error message" />);
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });
  it('renders retry button when onRetry provided', () => {
    render(<ErrorState onRetry={jest.fn()} />);
    expect(screen.getByText(/Try Again/)).toBeInTheDocument();
  });
  it('calls onRetry when Try Again clicked', () => {
    const onRetry = jest.fn();
    render(<ErrorState onRetry={onRetry} />);
    fireEvent.click(screen.getByText(/Try Again/));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
  it('does not render retry button when showRetry is false', () => {
    render(<ErrorState onRetry={jest.fn()} showRetry={false} />);
    expect(screen.queryByText(/Try Again/)).toBeNull();
  });
});

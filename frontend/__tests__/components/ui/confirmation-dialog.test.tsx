import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  title: 'Confirm Action',
  description: 'Are you sure you want to proceed?',
};

describe('ConfirmationDialog', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders when isOpen is true', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
  });
  it('does not render when isOpen is false', () => {
    render(<ConfirmationDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Confirm Action')).toBeNull();
  });
  it('renders description', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });
  it('calls onClose when Cancel is clicked', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
  it('calls onConfirm when Confirm is clicked', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Confirm'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });
  it('renders custom confirmText', () => {
    render(<ConfirmationDialog {...defaultProps} confirmText="Delete" />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
  it('renders custom cancelText', () => {
    render(<ConfirmationDialog {...defaultProps} cancelText="Go Back" />);
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });
  it('shows Processing... when isLoading is true', () => {
    render(<ConfirmationDialog {...defaultProps} isLoading={true} />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
  it('disables buttons when isLoading is true', () => {
    render(<ConfirmationDialog {...defaultProps} isLoading={true} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).toBeDisabled());
  });
});

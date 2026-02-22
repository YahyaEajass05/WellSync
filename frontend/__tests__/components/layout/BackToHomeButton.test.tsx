import React from 'react';
import { render, screen } from '@testing-library/react';
import { BackToHomeButton } from '@/components/layout/BackToHomeButton';

jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }));

describe('BackToHomeButton', () => {
  it('renders without crashing', () => {
    const { container } = render(<BackToHomeButton />);
    expect(container.firstChild).toBeInTheDocument();
  });
  it('renders with variant with-back', () => {
    render(<BackToHomeButton variant="with-back" />);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });
  it('links to home page /', () => {
    render(<BackToHomeButton variant="with-back" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/');
  });
});

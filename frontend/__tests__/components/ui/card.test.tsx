import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

describe('Card components', () => {
  it('renders Card with children', () => {
    render(<Card><p>Card content</p></Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('Card applies default classes', () => {
    const { container } = render(<Card>Test</Card>);
    expect(container.firstChild).toHaveClass('rounded-lg', 'border', 'shadow-sm');
  });

  it('Card applies additional className', () => {
    const { container } = render(<Card className="my-class">Test</Card>);
    expect(container.firstChild).toHaveClass('my-class');
  });

  it('CardHeader renders children', () => {
    render(<Card><CardHeader><span>Header</span></CardHeader></Card>);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('CardTitle renders as h3', () => {
    render(<Card><CardHeader><CardTitle>My Title</CardTitle></CardHeader></Card>);
    expect(screen.getByRole('heading', { name: 'My Title' })).toBeInTheDocument();
  });

  it('CardDescription renders correctly', () => {
    render(<Card><CardHeader><CardDescription>Desc text</CardDescription></CardHeader></Card>);
    expect(screen.getByText('Desc text')).toBeInTheDocument();
  });

  it('CardContent renders children', () => {
    render(<Card><CardContent><p>Content here</p></CardContent></Card>);
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });

  it('CardFooter renders children', () => {
    render(<Card><CardFooter><span>Footer</span></CardFooter></Card>);
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('renders full card composition', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});

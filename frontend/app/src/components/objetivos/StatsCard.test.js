// frontend/app/src/components/objetivos/StatsCard.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import StatsCard from './StatsCard';

describe('StatsCard component', () => {
  test('renders title and value', () => {
    render(<StatsCard title="Total Goals" value={42} />);
    expect(screen.getByText('Total Goals')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  test('handles numeric formatting with decimalPlacesToShow', () => {
    render(<StatsCard title="Progress" value={75.456} decimalPlacesToShow={1} />);
    expect(screen.getByText('75.5')).toBeInTheDocument();
  });

  test('formats with zero decimal places', () => {
    render(<StatsCard title="Count" value={99.9} decimalPlacesToShow={0} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('shows empty state when no data (no title or value)', () => {
    const { container } = render(<StatsCard />);
    // Should render without crashing and show no title
    expect(container.querySelector('h3')).toBeNull();
  });

  test('shows valueDescription when provided', () => {
    render(<StatsCard title="Rate" value={88} valueDescription="% completion" />);
    expect(screen.getByText('% completion')).toBeInTheDocument();
  });

  test('renders link when linkTo is provided', () => {
    render(<StatsCard title="View" value={5} linkTo="/details" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/details');
  });
});

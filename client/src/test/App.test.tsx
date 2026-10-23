import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('CampusConnect Frontend App', () => {
  it('Renders the landing page with brand title and hero headline', () => {
    render(<App />);
    expect(screen.getByText(/Your Campus. Your Community./i)).toBeInTheDocument();
    const slogans = screen.getAllByText(/One campus. One verified community./i);
    expect(slogans.length).toBeGreaterThan(0);
  });

  it('Renders call to action buttons to Join Your Campus and Sign In', () => {
    render(<App />);
    const joinButtons = screen.getAllByText(/Join Your Campus/i);
    expect(joinButtons.length).toBeGreaterThan(0);
    const signInLinks = screen.getAllByText(/Sign In/i);
    expect(signInLinks.length).toBeGreaterThan(0);
  });
});

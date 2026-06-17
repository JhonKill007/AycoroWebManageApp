import React from 'react';
import { render, screen } from '@testing-library/react';
import RouterManager from './components/routers/RouterManager';

test('renders learn react link', () => {
  render(<RouterManager />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

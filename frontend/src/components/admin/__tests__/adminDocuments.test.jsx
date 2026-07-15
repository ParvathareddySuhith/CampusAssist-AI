import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDocumentManagement from '../../../pages/admin/AdminDocumentManagement';

const wrapper = ({ children }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
);

describe('AdminDocumentManagement page scaffold', () => {
  it('renders the placeholder screen correctly', () => {
    render(<AdminDocumentManagement />, { wrapper });

    expect(screen.getByText('Document Management')).toBeDefined();
    expect(screen.getByText('Coming in Sprint 14 - Task 18B')).toBeDefined();
    expect(screen.getByText(/We are preparing this module/i)).toBeDefined();
  });
});

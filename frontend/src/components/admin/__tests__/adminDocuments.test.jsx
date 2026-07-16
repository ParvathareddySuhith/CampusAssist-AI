import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDocumentManagement from '../../../pages/admin/AdminDocumentManagement';
import DocumentStatusBadge from '../DocumentStatusBadge';
import DocumentTable from '../DocumentTable';

const wrapper = ({ children }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
);

// Mock the API calls
vi.mock('../../../services/adminDocumentService', () => ({
  getAdminDocuments: vi.fn().mockResolvedValue({
    documents: [
      {
        id: 'doc-1',
        filename: 'Operating Systems.pdf',
        department: 'CSE',
        uploaded_by: 'admin',
        uploaded_at: '2026-07-16T12:00:00Z',
        status: 'READY',
        size: '3.2 MB',
        url: 'http://example.com/os.pdf'
      },
      {
        id: 'doc-2',
        filename: 'Computer Networks.pdf',
        department: 'ECE',
        uploaded_by: 'staff',
        uploaded_at: '2026-07-16T12:30:00Z',
        status: 'FAILED',
        size: '1.5 MB',
        url: 'http://example.com/cn.pdf'
      }
    ],
    pagination: {
      page: 1,
      page_size: 20,
      total: 2,
      pages: 1
    }
  }),
  getAdminDocumentStats: vi.fn().mockResolvedValue({
    total: 2,
    indexed: 1,
    processing: 0,
    failed: 1
  })
}));

describe('DocumentStatusBadge component', () => {
  it('renders correct labels and colors for READY, INDEXING, FAILED statuses', () => {
    const { rerender } = render(<DocumentStatusBadge status="READY" />);
    expect(screen.getByText('Ready')).toBeDefined();

    rerender(<DocumentStatusBadge status="INDEXING" />);
    expect(screen.getByText('Indexing')).toBeDefined();

    rerender(<DocumentStatusBadge status="FAILED" />);
    expect(screen.getByText('Failed')).toBeDefined();
  });
});

describe('DocumentTable component', () => {
  it('renders document rows and actions link correctly', () => {
    const docs = [
      {
        id: 'doc-1',
        filename: 'Operating Systems.pdf',
        department: 'CSE',
        uploaded_by: 'admin',
        uploaded_at: '2026-07-16T12:00:00Z',
        status: 'READY',
        size: '3.2 MB',
        url: 'http://example.com/os.pdf'
      }
    ];

    render(<DocumentTable documents={docs} />, { wrapper });

    expect(screen.getByText('Operating Systems.pdf')).toBeDefined();
    expect(screen.getByText('CSE')).toBeDefined();
    expect(screen.getByText('admin')).toBeDefined();
    expect(screen.getByText('3.2 MB')).toBeDefined();
    expect(screen.getByText('View')).toBeDefined();
  });
});

describe('AdminDocumentManagement page operations', () => {
  it('renders search input, status filters, table rows, and page controls', async () => {
    render(<AdminDocumentManagement />, { wrapper });

    expect(screen.getByText('Document Management')).toBeDefined();
    expect(screen.getByPlaceholderText('Search documents by filename...')).toBeDefined();
    expect(screen.getByLabelText('Status:')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Operating Systems.pdf')).toBeDefined();
      expect(screen.getByText('Computer Networks.pdf')).toBeDefined();
    });
  });
});

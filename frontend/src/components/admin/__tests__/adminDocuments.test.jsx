import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDocumentManagement from '../../../pages/admin/AdminDocumentManagement';
import DocumentStatusBadge from '../DocumentStatusBadge';
import DocumentTable from '../DocumentTable';
import DocumentDetailsDrawer from '../DocumentDetailsDrawer';
import DeleteDocumentDialog from '../DeleteDocumentDialog';

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
  }),
  getAdminDocument: vi.fn().mockResolvedValue({
    id: 'doc-1',
    filename: 'Operating Systems.pdf',
    department: 'CSE',
    uploaded_by: 'admin',
    uploaded_at: '2026-07-16T12:00:00Z',
    status: 'READY',
    size: '3.2 MB',
    public_id: 'doc-1',
    chunks: 143,
    embedding_model: 'sentence-transformers/all-MiniLM-L6-v2',
    last_indexed_at: '2026-07-16T12:05:00Z'
  }),
  deleteAdminDocument: vi.fn().mockResolvedValue({
    success: true
  }),
  retryAdminDocumentIndex: vi.fn().mockResolvedValue({
    success: true,
    status: 'INDEXING'
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

    const onDetailsMock = vi.fn();
    render(<DocumentTable documents={docs} onDetailsClick={onDetailsMock} />, { wrapper });

    expect(screen.getByText('Operating Systems.pdf')).toBeDefined();
    expect(screen.getByText('CSE')).toBeDefined();
    expect(screen.getByText('admin')).toBeDefined();
    expect(screen.getByText('3.2 MB')).toBeDefined();
    
    const detailsBtn = screen.getByText('Details');
    expect(detailsBtn).toBeDefined();
    fireEvent.click(detailsBtn);
    expect(onDetailsMock).toHaveBeenCalledWith(docs[0]);
  });
});

describe('DocumentDetailsDrawer component', () => {
  it('renders detailed drawer parameters and fires actions', async () => {
    const onDeleteMock = vi.fn();
    const onRetryMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <DocumentDetailsDrawer 
        isOpen={true} 
        docId="doc-1" 
        onClose={onCloseMock} 
        onDeleteClick={onDeleteMock} 
        onRetrySuccess={onRetryMock} 
      />, 
      { wrapper }
    );

    // Verify detail labels render
    await waitFor(() => {
      expect(screen.getByText('Document Details')).toBeDefined();
      expect(screen.getByText('Operating Systems.pdf')).toBeDefined();
      expect(screen.getByText('doc-1')).toBeDefined();
      expect(screen.getByText('143')).toBeDefined();
      expect(screen.getByText('sentence-transformers/all-MiniLM-L6-v2')).toBeDefined();
    });

    // Fire Retry Index
    const retryBtn = screen.getByText('Retry Index');
    fireEvent.click(retryBtn);
    await waitFor(() => {
      expect(screen.getByText('Indexing restarted.')).toBeDefined();
    });

    // Fire Delete Document
    const deleteBtn = screen.getByText('Delete Document');
    fireEvent.click(deleteBtn);
    expect(onDeleteMock).toHaveBeenCalled();
  });
});

describe('DeleteDocumentDialog component', () => {
  it('renders modal details and confirms action', () => {
    const onConfirmMock = vi.fn();
    const onCancelMock = vi.fn();

    render(
      <DeleteDocumentDialog 
        isOpen={true} 
        documentName="OS.pdf" 
        onConfirm={onConfirmMock} 
        onCancel={onCancelMock} 
      />
    );

    expect(screen.getByText('Delete document?')).toBeDefined();
    expect(screen.getByText('• PDF')).toBeDefined();
    expect(screen.getByText('• Vector embeddings')).toBeDefined();
    expect(screen.getByText('• Metadata')).toBeDefined();

    const deleteBtn = screen.getAllByRole('button').find(b => b.textContent === 'Delete');
    fireEvent.click(deleteBtn);
    expect(onConfirmMock).toHaveBeenCalled();
  });
});

describe('AdminDocumentManagement page operations', () => {
  it('renders search input, status filters, stats, table rows, and page controls', async () => {
    render(<AdminDocumentManagement />, { wrapper });

    expect(screen.getByText('Document Management')).toBeDefined();
    expect(screen.getByPlaceholderText('Search documents by filename...')).toBeDefined();
    expect(screen.getByText('Total Documents')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Operating Systems.pdf')).toBeDefined();
      expect(screen.getByText('Computer Networks.pdf')).toBeDefined();
    });
  });
});

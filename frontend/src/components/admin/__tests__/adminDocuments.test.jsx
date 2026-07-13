import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as docService from '../../../services/adminDocumentService';
import AdminDocumentManagement from '../../../pages/admin/AdminDocumentManagement';

// Mock localStorage globally for testing environment safety
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock the admin document service
vi.mock('../../../services/adminDocumentService', () => ({
  getDocuments: vi.fn(),
  uploadDocument: vi.fn(),
  deleteDocument: vi.fn(),
  rebuildKnowledgeBase: vi.fn()
}));

const wrapper = ({ children }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
);

describe('AdminDocumentManagement page and operations', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders loading skeleton then loads and renders documents list', async () => {
    docService.getDocuments.mockResolvedValueOnce({
      pdfs: [
        {
          public_id: 'pdf-1',
          filename: 'Computer Networks.pdf',
          department: 'CSE',
          subject: 'Networks',
          semester: 5,
          created_at: '2026-07-13T00:00:00Z',
          size: 1024 * 1024,
          status: 'READY'
        }
      ]
    });

    render(<AdminDocumentManagement />, { wrapper });

    // Renders header titles
    expect(screen.getByText('Document Management')).toBeDefined();
    
    // Resolves and displays documents
    await waitFor(() => {
      expect(screen.getByText('Computer Networks.pdf')).toBeDefined();
    });

    expect(screen.getByText('CSE')).toBeDefined();
    expect(screen.getByText('Networks')).toBeDefined();
    expect(screen.getAllByText('Semester 5').length).toBeGreaterThan(0);
  });

  it('handles optimistic deletion and rolls back on API failure', async () => {
    // Mock successful fetch
    docService.getDocuments.mockResolvedValueOnce({
      pdfs: [
        {
          public_id: 'pdf-delete',
          filename: 'DeleteMe.pdf',
          department: 'ECE',
          subject: 'Signals',
          semester: 3,
          created_at: '2026-07-13T00:00:00Z',
          size: 2048,
          status: 'READY'
        }
      ]
    });

    // Mock delete API failure
    docService.deleteDocument.mockRejectedValueOnce(new Error('Network error'));
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AdminDocumentManagement />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('DeleteMe.pdf')).toBeDefined();
    });

    // Click delete action
    const deleteBtn = screen.getByTitle('Delete Document');
    fireEvent.click(deleteBtn);

    // Modal pops up
    expect(screen.getByText('Delete Document')).toBeDefined();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeDefined();

    // Confirm deletion
    const confirmBtn = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmBtn);

    // Optimistically removed
    await waitFor(() => {
      expect(screen.queryByText('DeleteMe.pdf')).toBeNull();
    });

    // API error triggers rollback
    await waitFor(() => {
      expect(screen.getByText('DeleteMe.pdf')).toBeDefined();
    });

    expect(alertMock).toHaveBeenCalled();
    alertMock.mockRestore();
  });

  it('renders empty placeholder state when no documents exist', async () => {
    docService.getDocuments.mockResolvedValueOnce({ pdfs: [] });

    render(<AdminDocumentManagement />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('No documents uploaded yet.')).toBeDefined();
    });
  });

  it('renders error panel with retry action if API fails', async () => {
    docService.getDocuments.mockRejectedValueOnce(new Error('API failure'));

    render(<AdminDocumentManagement />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Unable to fetch documents from database.')).toBeDefined();
    });

    const retryBtn = screen.getByRole('button', { name: 'Retry Fetching' });
    expect(retryBtn).toBeDefined();

    // Click retry
    docService.getDocuments.mockResolvedValueOnce({ pdfs: [] });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('No documents uploaded yet.')).toBeDefined();
    });
  });
});

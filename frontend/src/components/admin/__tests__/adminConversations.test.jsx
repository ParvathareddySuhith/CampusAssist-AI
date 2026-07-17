import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminConversationExplorer from '../../../pages/admin/AdminConversationExplorer';
import ConversationTable from '../ConversationTable';
import ConversationDrawer from '../ConversationDrawer';

const wrapper = ({ children }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
);

// Mock api service
vi.mock('../../../services/adminConversationService', () => ({
  getAdminConversations: vi.fn().mockResolvedValue({
    conversations: [
      {
        id: 'user-1',
        user: 'Alice Smith',
        email: 'alice@gmail.com',
        department: 'Computer Science and Engineering',
        started: '2026-07-17T10:00:00Z',
        messages: 10
      },
      {
        id: 'user-2',
        user: 'Bob Jones',
        email: 'bob@gmail.com',
        department: 'Information Technology',
        started: '2026-07-17T11:00:00Z',
        messages: 4
      }
    ],
    pagination: {
      page: 1,
      page_size: 20,
      total: 2,
      pages: 1
    }
  }),
  getAdminConversation: vi.fn().mockResolvedValue({
    id: 'user-1',
    user: 'Alice Smith',
    department: 'Computer Science and Engineering',
    created_at: '2026-07-17T10:00:00Z',
    messages: [
      {
        role: 'user',
        content: 'Hi',
        timestamp: '2026-07-17T10:00:00Z'
      },
      {
        role: 'assistant',
        content: 'Hello, how can I help you?',
        timestamp: '2026-07-17T10:00:05Z'
      }
    ]
  })
}));

describe('ConversationTable component', () => {
  it('renders correct rows and invokes Details callback', () => {
    const list = [
      {
        id: 'user-1',
        user: 'Alice Smith',
        email: 'alice@gmail.com',
        department: 'Computer Science and Engineering',
        started: '2026-07-17T10:00:00Z',
        messages: 10
      }
    ];
    const detailsMock = vi.fn();
    render(<ConversationTable conversations={list} onDetailsClick={detailsMock} />, { wrapper });

    expect(screen.getByText('Alice Smith')).toBeDefined();
    expect(screen.getByText('alice@gmail.com')).toBeDefined();
    expect(screen.getByText('Computer Science and Engineering')).toBeDefined();
    expect(screen.getByText('10')).toBeDefined();

    const detailsBtn = screen.getByText('Details');
    fireEvent.click(detailsBtn);
    expect(detailsMock).toHaveBeenCalledWith(list[0]);
  });
});

describe('ConversationDrawer component', () => {
  it('loads and renders student dialog messages', async () => {
    const closeMock = vi.fn();
    render(<ConversationDrawer isOpen={true} conversationId="user-1" onClose={closeMock} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Conversation Log')).toBeDefined();
      expect(screen.getByText('Alice Smith')).toBeDefined();
      expect(screen.getByText('Hi')).toBeDefined();
      expect(screen.getByText('Hello, how can I help you?')).toBeDefined();
    });
  });
});

describe('AdminConversationExplorer page', () => {
  it('renders filter controls and tables list', async () => {
    render(<AdminConversationExplorer />, { wrapper });

    expect(screen.getByText('Conversation Explorer')).toBeDefined();
    expect(screen.getByPlaceholderText('Search by user or question content...')).toBeDefined();
    expect(screen.getByLabelText('Department:')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeDefined();
      expect(screen.getByText('Bob Jones')).toBeDefined();
    });
  });
});

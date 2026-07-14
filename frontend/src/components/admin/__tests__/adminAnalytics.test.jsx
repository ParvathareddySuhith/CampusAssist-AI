import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminAnalyticsPage from '../../../pages/admin/AdminAnalyticsPage';
import * as service from '../../../services/adminAnalyticsService';

// Mock the API service
vi.mock('../../../services/adminAnalyticsService', () => ({
  getDashboard: vi.fn(),
  getDepartments: vi.fn(),
  getQuestionStats: vi.fn(),
  getDocumentStats: vi.fn(),
  getNotificationStats: vi.fn(),
  getRecentActivity: vi.fn()
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = { adminToken: 'mock-admin-token' };
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

const wrapper = ({ children }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
);

describe('AdminAnalyticsPage Dashboard View', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default dashboard payload
    service.getDashboard.mockResolvedValue({
      generated_at: "2026-07-14T13:15:22.000Z",
      summary: {
        students: 245,
        documents: 182,
        questions: 14523,
        notifications: 517
      },
      departments: [
        { department: "CSE", count: 128 },
        { department: "ECE", count: 64 }
      ],
      questions_distribution: {
        ACADEMIC: 7200,
        PLACEMENT: 4800,
        GENERAL: 2523
      },
      documents: {
        total: 182,
        indexed: 178,
        processing: 3,
        failed: 1
      },
      notifications: {
        broadcasts: 42,
        individual: 475,
        read_rate: 78.5
      },
      recent_activity: [
        {
          type: "USER_REGISTERED",
          description: "Student registered: johndoe",
          timestamp: "2026-07-14T13:10:00.000Z"
        },
        {
          type: "PDF_UPLOADED",
          description: "PDF Uploaded: operating_systems.pdf",
          timestamp: "2026-07-14T12:45:00.000Z"
        }
      ],
      errors: {}
    });
  });

  it('renders all sections and statistics correctly from the snapshot', async () => {
    await act(async () => {
      render(<AdminAnalyticsPage />, { wrapper });
    });

    // Verify main page elements
    expect(screen.getByText('Analytics Overview')).toBeDefined();
    
    // Verify Summary Cards
    expect(screen.getByText('Total Students')).toBeDefined();
    expect(screen.getAllByText('245')[0]).toBeDefined();
    expect(screen.getByText('Total Course PDFs')).toBeDefined();
    expect(screen.getAllByText('182')[0]).toBeDefined();
    expect(screen.getByText('Questions Answered')).toBeDefined();
    expect(screen.getAllByText('14,523')[0]).toBeDefined();
    
    // Verify Department Bar Chart
    expect(screen.getByText('CSE')).toBeDefined();
    expect(screen.getByText('ECE')).toBeDefined();
    expect(screen.getByText('128')).toBeDefined();
    expect(screen.getByText('64')).toBeDefined();

    // Verify SVG accessibility features
    const deptSection = screen.getByRole('region', { name: /department enrollment distribution/i });
    expect(deptSection).toBeDefined();

    // Verify Donut Chart values
    expect(screen.getByText('ACADEMIC')).toBeDefined();
    expect(screen.getByText('PLACEMENT')).toBeDefined();
    expect(screen.getByText('GENERAL')).toBeDefined();

    // Verify Document Statistics
    expect(screen.getByText('Indexed (Ready)')).toBeDefined();
    expect(screen.getByText('178')).toBeDefined();
    expect(screen.getByText('Failed (Errors)')).toBeDefined();

    // Verify Notification Read Rate
    expect(screen.getByText('Student Read Rate')).toBeDefined();
    expect(screen.getByText('78.5%')).toBeDefined();

    // Verify Recent Activities Timeline
    expect(screen.getByText('Student registered: johndoe')).toBeDefined();
    expect(screen.getByText('PDF Uploaded: operating_systems.pdf')).toBeDefined();
  });

  it('triggers a forced refresh when the sync button is clicked', async () => {
    await act(async () => {
      render(<AdminAnalyticsPage />, { wrapper });
    });

    const syncButton = screen.getByRole('button', { name: /reload dashboard/i });
    expect(syncButton).toBeDefined();

    await act(async () => {
      fireEvent.click(syncButton);
    });

    // Verify getDashboard was called with refresh=true
    expect(service.getDashboard).toHaveBeenLastCalledWith(true);
  });

  it('renders resilient partial error warnings if some metrics fail', async () => {
    service.getDashboard.mockResolvedValueOnce({
      generated_at: "2026-07-14T13:15:22.000Z",
      summary: { students: 10, documents: 0, questions: 0, notifications: 0 },
      departments: [],
      questions_distribution: {},
      documents: null,
      notifications: null,
      recent_activity: [],
      errors: {
        documents: {
          message: "Unable to load document statistics.",
          code: "DOCUMENT_STATS_UNAVAILABLE"
        }
      }
    });

    await act(async () => {
      render(<AdminAnalyticsPage />, { wrapper });
    });

    expect(screen.getByText('Partial Metrics Offline')).toBeDefined();
    expect(screen.getByText('Unable to load document statistics.')).toBeDefined();
  });

  it('renders a full retry connection state on endpoint throw', async () => {
    service.getDashboard.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      render(<AdminAnalyticsPage />, { wrapper });
    });

    expect(screen.getByText('Failed to load analytics')).toBeDefined();
    
    const retryButton = screen.getByRole('button', { name: /retry connection/i });
    expect(retryButton).toBeDefined();
  });
});

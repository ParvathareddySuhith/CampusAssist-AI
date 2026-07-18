import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminSystemHealth from '../../../pages/admin/AdminSystemHealth';
import HealthStatusCard from '../HealthStatusCard';
import ServiceHealthGrid from '../ServiceHealthGrid';
import SystemMetricsPanel from '../SystemMetricsPanel';
import * as systemService from '../../../services/adminSystemService';

const wrapper = ({ children }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
);

// Mock the API calls
vi.mock('../../../services/adminSystemService', () => ({
  getSystemHealth: vi.fn(),
  getSystemMetrics: vi.fn()
}));

describe('HealthStatusCard component', () => {
  it('renders healthy status with latency correctly', () => {
    render(<HealthStatusCard name="MongoDB" status="healthy" latencyMs={15} />);
    expect(screen.getByText('MongoDB')).toBeDefined();
    expect(screen.getByText('Healthy')).toBeDefined();
    expect(screen.getByText('Latency:')).toBeDefined();
    expect(screen.getByText('15ms')).toBeDefined();
  });

  it('renders degraded status without latency correctly', () => {
    render(<HealthStatusCard name="Pinecone" status="degraded" />);
    expect(screen.getByText('Pinecone')).toBeDefined();
    expect(screen.getByText('Degraded')).toBeDefined();
  });
});

describe('SystemMetricsPanel component', () => {
  it('renders metric cards with correct labels and values', () => {
    const metrics = {
      documents: 142,
      users: 286,
      conversations: 5241,
      notifications: 37,
      storage_mb: 381,
      uptime: '2d 14h'
    };

    render(<SystemMetricsPanel metrics={metrics} />);
    expect(screen.getByText('Documents')).toBeDefined();
    expect(screen.getByText('142')).toBeDefined();
    
    expect(screen.getByText('Users')).toBeDefined();
    expect(screen.getByText('286')).toBeDefined();

    expect(screen.getByText('Storage')).toBeDefined();
    expect(screen.getByText('381 MB')).toBeDefined();

    expect(screen.getByText('Uptime')).toBeDefined();
    expect(screen.getByText('2d 14h')).toBeDefined();
  });
});

describe('AdminSystemHealth page operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders system statuses, metrics, and triggers manual refresh', async () => {
    vi.mocked(systemService.getSystemHealth).mockResolvedValue({
      services: [
        { name: 'MongoDB', status: 'healthy', latency_ms: 8 },
        { name: 'Pinecone', status: 'healthy' },
        { name: 'Cloudinary', status: 'healthy' },
        { name: 'Backend API', status: 'healthy' }
      ],
      generated_at: '2026-07-18T12:00:00Z'
    });

    vi.mocked(systemService.getSystemMetrics).mockResolvedValue({
      documents: 5,
      users: 12,
      conversations: 8,
      notifications: 2,
      storage_mb: 1.2,
      uptime: '1h 15m',
      last_updated: '2026-07-18T12:00:00Z'
    });

    render(<AdminSystemHealth />, { wrapper });

    expect(screen.getByText('System Health')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('MongoDB')).toBeDefined();
      expect(screen.getByText('8ms')).toBeDefined();
      expect(screen.getByText('1h 15m')).toBeDefined();
    });

    // Fire manual refresh
    const refreshBtn = screen.getByText('Refresh');
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(systemService.getSystemHealth).toHaveBeenCalledTimes(2);
      expect(systemService.getSystemMetrics).toHaveBeenCalledTimes(2);
    });
  });

  it('shows degraded warnings if a service is degraded', async () => {
    vi.mocked(systemService.getSystemHealth).mockResolvedValue({
      services: [
        { name: 'MongoDB', status: 'healthy', latency_ms: 12 },
        { name: 'Pinecone', status: 'degraded' }
      ]
    });
    vi.mocked(systemService.getSystemMetrics).mockResolvedValue({});

    render(<AdminSystemHealth />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Operational warning: The following services report degraded status: Pinecone/)).toBeDefined();
    });
  });

  it('triggers auto-refresh on a 60-second timer interval', async () => {
    vi.useFakeTimers();
    
    vi.mocked(systemService.getSystemHealth).mockResolvedValue({ services: [] });
    vi.mocked(systemService.getSystemMetrics).mockResolvedValue({});

    render(<AdminSystemHealth />, { wrapper });

    // Flush mount promises without firing interval
    await vi.advanceTimersByTimeAsync(0);
    expect(systemService.getSystemHealth).toHaveBeenCalledTimes(1);

    // Fast-forward 60 seconds
    await vi.advanceTimersByTimeAsync(60000);

    expect(systemService.getSystemHealth).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});

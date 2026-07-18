import React from 'react';
import HealthStatusCard from './HealthStatusCard';

function ServiceHealthGrid({ services }) {
  if (!services || services.length === 0) {
    return (
      <div className="text-center text-sm text-neutral-500 py-6 font-semibold select-none">
        No service metrics available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      {services.map((service, index) => (
        <HealthStatusCard
          key={service.name || index}
          name={service.name}
          status={service.status}
          latencyMs={service.latency_ms}
        />
      ))}
    </div>
  );
}

export default ServiceHealthGrid;

'use client';

import React from 'react';

interface DSStatsProps {
  label: string;
  value: string | number;
  progress?: number; // 0-100
  maxValue?: string | number;
  className?: string;
}

const DSStats: React.FC<DSStatsProps> = ({
  label,
  value,
  progress,
  maxValue,
  className = '',
}) => {
  return (
    <div className={`ds-stats-panel ${className}`}>
      <div className="flex items-baseline justify-between mb-2">
        <span className="ds-credits-value">{value}</span>
        {maxValue && (
          <span className="text-sm font-dmMono text-dsMuted">/ {maxValue}</span>
        )}
      </div>

      <span className="ds-credits-label">{label}</span>

      {typeof progress === 'number' && (
        <div className="ds-progress-bar mt-3">
          <div
            className="ds-progress-bar-fill"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default DSStats;

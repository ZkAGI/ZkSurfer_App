import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

export interface GaugeProps {
  /** current value */
  value: number;
  /** gauge minimum */
  min?: number;
  /** gauge maximum */
  max?: number;
  /** overall diameter in px */
  size?: number;
  /** override color (optional) */
  color?: string;
  /** hide center labels for compact use */
  compact?: boolean;
}

const Gauge: React.FC<GaugeProps> = ({
  value,
  min = 0,
  max = 5,
  size = 200,
  color,
  compact = false,
}) => {
  console.log('Raw value received:', value, typeof value);
  // Define segments with their ranges and colors
  const segments = [
    { name: 'EXTREME\nFEAR', min: 0, max: 0.5, color: '#dc2626', value: 0.5 },
    { name: 'FEAR', min: 0.5, max: 1.6, color: '#ea580c', value: 1.1 },
    { name: 'NEUTRAL', min: 1.6, max: 3.2, color: '#eab308', value: 1.6 },
    { name: 'GREED', min: 3.2, max: 4.5, color: '#16a34a', value: 1.3 },
    { name: 'EXTREME\nGREED', min: 4.5, max: 5, color: '#15803d', value: 0.5 },
  ];

  // Clamp value
  const v = Math.max(min, Math.min(max, value));

  // Find current segment
  const currentSegment = segments.find(seg => v >= seg.min && v <= seg.max);

  // Get label based on value
  const getLabel = (val: number): string => {
    if (val < 0.5) return 'EXTREME FEAR';
    if (val < 1.6) return 'FEAR';
    if (val < 3.2) return 'NEUTRAL';
    if (val < 4.5) return 'GREED';
    return 'EXTREME GREED';
  };

  // Calculate needle angle (0 to 180 degrees)
  const ratio = (v - min) / (max - min);
  const needleAngle = 180 - (ratio * 180); // Start from left (180°) to right (0°)

  const centerX = size / 2;
  const centerY = size / 2;
  const needleLength = size * 0.38;

  // Calculate needle position
  const needleX = centerX + needleLength * Math.cos((needleAngle * Math.PI) / 180);
  const needleY = centerY - needleLength * Math.sin((needleAngle * Math.PI) / 180);

  if (compact) {
    return (
      <div className="flex flex-col items-center" style={{ width: size, height: size / 2 + 4 }}>
        <div className="relative overflow-hidden" style={{ width: size, height: size / 2 }}>
          <PieChart
            width={size}
            height={size}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <Pie
              data={segments}
              cx={size / 2}
              cy={size / 2}
              startAngle={180}
              endAngle={0}
              innerRadius={size * 0.25}
              outerRadius={size * 0.45}
              dataKey="value"
              stroke="none"
            >
              {segments.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={currentSegment?.name === entry.name ? 1 : 0.6}
                />
              ))}
            </Pie>
          </PieChart>

          {/* Needle */}
          <svg
            className="absolute top-0 left-0 pointer-events-none"
            width={size}
            height={size / 2}
            style={{ overflow: 'visible' }}
          >
            <line
              x1={centerX}
              y1={centerY}
              x2={needleX}
              y2={needleY}
              stroke="#374151"
              strokeWidth={2}
            />
            <circle cx={centerX} cy={centerY} r={4} fill="#374151" />
            <circle cx={centerX} cy={centerY} r={2} fill="#ffffff" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center" style={{ width: size, height: size * 0.75 }}>
      <div className="relative overflow-hidden" style={{ width: size, height: size / 2 }}>
        <PieChart
          width={size}
          height={size}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <Pie
            data={segments}
            cx={size / 2}
            cy={size / 2}
            startAngle={180}
            endAngle={0}
            innerRadius={size * 0.2}
            outerRadius={size * 0.4}
            dataKey="value"
            stroke="none"
          >
            {segments.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                opacity={currentSegment?.name === entry.name ? 1 : 0.7}
              />
            ))}
          </Pie>
        </PieChart>

        {/* Needle */}
        <svg
          className="absolute top-0 left-0 pointer-events-none"
          width={size}
          height={size / 2}
          style={{ overflow: 'visible' }}
        >
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke="#374151"
            strokeWidth={3}
          />
          <circle cx={centerX} cy={centerY} r={6} fill="#374151" />
          <circle cx={centerX} cy={centerY} r={3} fill="#ffffff" />
        </svg>
      </div>

      {/* Center value and labels */}
      <div className="text-center -mt-4">
        <div className="text-xl font-bold text-white mb-1">
          {v.toFixed(2)}
        </div>
        <div
          className="text-base font-bold mb-1"
          style={{ color: currentSegment?.color || '#ffffff' }}
        >
          {getLabel(v)}
        </div>
        <div className="text-xs text-gray-400">
          FEAR & GREED INDEX
        </div>
      </div>
    </div>
  );
};

export default Gauge;
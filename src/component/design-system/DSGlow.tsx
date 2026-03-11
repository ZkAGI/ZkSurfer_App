'use client';

import React from 'react';

type GlowPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

interface DSGlowProps {
  position?: GlowPosition;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const positionClasses: Record<GlowPosition, string> = {
  'top-left': '-top-32 -left-32',
  'top-right': '-top-32 -right-32',
  'bottom-left': '-bottom-32 -left-32',
  'bottom-right': '-bottom-32 -right-32',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

const sizeClasses: Record<string, string> = {
  sm: 'w-64 h-64',
  md: 'w-96 h-96',
  lg: 'w-[600px] h-[600px]',
};

const DSGlow: React.FC<DSGlowProps> = ({
  position = 'center',
  color = 'rgba(124, 106, 247, 0.15)',
  size = 'md',
  className = '',
}) => {
  return (
    <div
      className={`absolute pointer-events-none ${positionClasses[position]} ${sizeClasses[size]} ${className}`}
      style={{
        background: `radial-gradient(ellipse at center, ${color}, transparent 70%)`,
        filter: 'blur(80px)',
      }}
    />
  );
};

export default DSGlow;

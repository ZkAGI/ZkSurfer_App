'use client';

import React, { ReactNode } from 'react';

type BadgeVariant = 'new' | 'popular' | 'zkagi' | 'number' | 'default';

interface DSBadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  new: 'ds-badge-new',
  popular: 'ds-badge-popular',
  zkagi: 'ds-badge-zkagi',
  number: 'ds-badge-number',
  default: 'ds-badge bg-dsBorder text-white',
};

const DSBadge: React.FC<DSBadgeProps> = ({
  variant = 'default',
  children,
  className = '',
}) => {
  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default DSBadge;

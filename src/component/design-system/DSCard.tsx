'use client';

import React, { useRef, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface DSCardProps {
  number?: string;
  icon?: LucideIcon;
  iconColor?: string;
  title: string;
  description?: string;
  tag?: 'new' | 'popular' | 'zkagi' | null;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
}

const DSCard: React.FC<DSCardProps> = ({
  number,
  icon: Icon,
  iconColor = '#a78bfa',
  title,
  description,
  tag,
  onClick,
  children,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty('--mouse-x', `${x}%`);
    cardRef.current.style.setProperty('--mouse-y', `${y}%`);
  };

  const tagClasses = {
    new: 'ds-badge-new',
    popular: 'ds-badge-popular',
    zkagi: 'ds-badge-zkagi',
  };

  const tagLabels = {
    new: 'New',
    popular: 'Popular',
    zkagi: 'ZkAGI',
  };

  return (
    <div
      ref={cardRef}
      className={`ds-feature-card ${className}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
    >
      {/* Header row: number + tag */}
      <div className="flex items-center justify-between mb-4">
        {number && <span className="ds-badge-number">{number}</span>}
        {tag && <span className={tagClasses[tag]}>{tagLabels[tag]}</span>}
      </div>

      {/* Icon */}
      {Icon && (
        <div
          className="ds-icon-box mb-4"
          style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}

      {/* Title */}
      <h3 className="ds-heading-sm mb-2">{title}</h3>

      {/* Description */}
      {description && <p className="ds-body text-sm">{description}</p>}

      {/* Custom children */}
      {children}
    </div>
  );
};

export default DSCard;

'use client';

import React from 'react';
import { LuInbox, LuFileText, LuImage, LuUsers, LuSearch, LuShieldOff, LuWallet } from 'react-icons/lu';

type EmptyStateVariant = 'default' | 'agents' | 'files' | 'images' | 'search' | 'error' | 'wallet';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantConfig: Record<EmptyStateVariant, {
  icon: React.ReactNode;
  defaultTitle: string;
  defaultDescription: string;
}> = {
  default: {
    icon: <LuInbox className="w-full h-full" />,
    defaultTitle: 'No data yet',
    defaultDescription: 'Get started by creating your first item',
  },
  agents: {
    icon: <LuUsers className="w-full h-full" />,
    defaultTitle: 'No agents found',
    defaultDescription: 'Create your first AI agent to get started',
  },
  files: {
    icon: <LuFileText className="w-full h-full" />,
    defaultTitle: 'No files uploaded',
    defaultDescription: 'Upload your documents to begin',
  },
  images: {
    icon: <LuImage className="w-full h-full" />,
    defaultTitle: 'No images generated',
    defaultDescription: 'Generate your first AI image',
  },
  search: {
    icon: <LuSearch className="w-full h-full" />,
    defaultTitle: 'No results found',
    defaultDescription: 'Try adjusting your search terms',
  },
  error: {
    icon: <LuShieldOff className="w-full h-full" />,
    defaultTitle: 'Something went wrong',
    defaultDescription: 'Please try again later',
  },
  wallet: {
    icon: <LuWallet className="w-full h-full" />,
    defaultTitle: 'Connect your wallet',
    defaultDescription: 'Please connect your wallet to continue',
  },
};

const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'default',
  title,
  description,
  action,
  className = '',
}) => {
  const config = variantConfig[variant];

  return (
    <div className={`empty-state ${className}`}>
      {/* Icon */}
      <div className="empty-state-icon">
        {config.icon}
      </div>

      {/* Title */}
      <h3 className="empty-state-title">
        {title || config.defaultTitle}
      </h3>

      {/* Description */}
      <p className="empty-state-description">
        {description || config.defaultDescription}
      </p>

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="ds-btn-primary mt-6"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-dsPurple/30 border-t-dsPurple rounded-full animate-spin ${className}`}
    />
  );
};

interface LoadingDotsProps {
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ className = '' }) => {
  return (
    <span className={`inline-flex gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-dsPurple rounded-full animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
};

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
    />
  );
};

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
};

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
  return (
    <div className={`ds-card space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
};

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...'
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000]/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-white text-sm font-medium animate-pulse">{message}</p>
      </div>
    </div>
  );
};

interface PageLoadingProps {
  message?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading...'
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-dsPurple/20 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-dsPurple rounded-full animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-white font-medium mb-1">{message}</p>
        <p className="text-dsMuted text-sm">Please wait</p>
      </div>
    </div>
  );
};

interface InlineLoadingProps {
  text?: string;
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  text = 'Loading',
  className = ''
}) => {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LoadingSpinner size="sm" />
      <span className="text-dsMuted text-sm">{text}</span>
    </span>
  );
};

export default {
  LoadingSpinner,
  LoadingDots,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  LoadingOverlay,
  PageLoading,
  InlineLoading,
};

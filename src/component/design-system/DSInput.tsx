'use client';

import React, { InputHTMLAttributes, ReactNode } from 'react';

interface DSInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  commandTag?: string;
  error?: string;
  label?: string;
}

const DSInput: React.FC<DSInputProps> = ({
  leftIcon,
  commandTag,
  error,
  label,
  className = '',
  ...props
}) => {
  const inputId = props.id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-dmSans text-dsMuted mb-2">
          {label}
        </label>
      )}

      <div className={`relative ${leftIcon || commandTag ? 'ds-input-with-icon' : ''}`}>
        {leftIcon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dsMuted">
            {leftIcon}
          </span>
        )}

        {commandTag && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <span className="ds-command-tag">{commandTag}</span>
          </span>
        )}

        <input
          id={inputId}
          className={`
            ds-input
            ${leftIcon ? 'pl-11' : ''}
            ${commandTag ? 'pl-24' : ''}
            ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-400 font-dmSans">{error}</p>
      )}
    </div>
  );
};

export default DSInput;

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  hideText?: boolean;
}

export const CampusConnectLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  hideText = false,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-tr from-brand-900 via-brand-700 to-tealAccent-500 flex items-center justify-center text-white shadow-md shadow-brand-900/20 flex-shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4/5 h-4/5"
        >
          {/* Graduation Cap */}
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
          {/* Connected Network Nodes */}
          <circle cx="12" cy="18" r="1.5" fill="currentColor" />
          <circle cx="8" cy="19.5" r="1" fill="currentColor" />
          <circle cx="16" cy="19.5" r="1" fill="currentColor" />
        </svg>
      </div>

      {!hideText && (
        <span className={`${textSizes[size]} text-slate-900 tracking-tight font-extrabold`}>
          Campus<span className="text-brand-600">Connect</span>
        </span>
      )}
    </div>
  );
};

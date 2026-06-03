import React from 'react';

interface LoaderProps {
  variant?: 'spinner' | 'skeleton' | 'dots';
  className?: string;
  count?: number;
}

export const Loader: React.FC<LoaderProps> = ({
  variant = 'spinner',
  className = '',
  count = 3,
}) => {
  if (variant === 'skeleton') {
    return (
      <div className={`space-y-4 animate-pulse w-full ${className}`}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="h-20 bg-muted rounded-xl border border-border/40 w-full" />
        ))}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center space-x-2 ${className}`}>
        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  );
};

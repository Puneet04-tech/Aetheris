import React from 'react';
import { cn } from '../utils';

interface StatusRibbonProps {
  label: string;
  type?: 'ceo' | 'expert' | 'verified' | 'top-contributor' | 'founder';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusRibbon({
  label,
  type = 'verified',
  size = 'md',
  className,
}: StatusRibbonProps) {
  return (
    <div
      className={cn(
        'status-ribbon inline-flex items-center gap-2 font-semibold',
        {
          'px-2 py-1 text-xs': size === 'sm',
          'px-3 py-1.5 text-sm': size === 'md',
          'px-4 py-2 text-base': size === 'lg',
          'ceo': type === 'ceo',
          'expert': type === 'expert',
          'verified': type === 'verified',
        },
        className
      )}
    >
      {type === 'ceo' && '👑'}
      {type === 'expert' && '⭐'}
      {type === 'verified' && '✓'}
      {type === 'top-contributor' && '🔥'}
      {type === 'founder' && '🚀'}
      <span>{label}</span>
    </div>
  );
}

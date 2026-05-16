import React from 'react';
import { cn } from '../utils';

interface ProfessionalRibbonProps {
  type: 'ceo' | 'expert' | 'verified' | 'top-contributor';
  className?: string;
}

export function ProfessionalRibbon({ type, className }: ProfessionalRibbonProps) {
  const labels = {
    ceo: 'CEO',
    expert: 'Verified Expert',
    verified: 'Verified Professional',
    'top-contributor': 'Top Contributor',
  };

  const colors = {
    ceo: 'from-amber-400 to-yellow-600',
    expert: 'from-purple-500 to-indigo-700',
    verified: 'from-emerald-400 to-teal-600',
    'top-contributor': 'from-blue-400 to-cyan-600',
  };

  return (
    <div className={cn(
      "absolute -top-1 -right-1 z-10",
      className
    )}>
      <div className={cn(
        "status-ribbon px-4 py-1 text-[10px] uppercase font-black text-white shadow-lg transform rotate-3",
        type === 'ceo' ? 'ceo' : type === 'expert' ? 'expert' : 'verified'
      )}>
        {labels[type]}
      </div>
    </div>
  );
}

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200',
  {
    variants: {
      variant: {
        emerald: 'badge-emerald',
        amethyst: 'badge-amethyst',
        golden: 'badge-golden',
        default: 'border-transparent bg-gray-600 text-gray-200 hover:bg-gray-500',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-red-600 text-white hover:bg-red-700',
        outline: 'text-foreground border-white/20 hover:bg-white/5',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

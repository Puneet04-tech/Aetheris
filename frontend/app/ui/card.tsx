import * as React from 'react';
import { cn } from '../utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'emerald' | 'amethyst' | 'golden';
    glow?: boolean;
  }
>(({ className, variant = 'default', glow = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'glass-morphism rounded-xl p-6 transition-smooth',
      {
        'card-accent-emerald': variant === 'emerald',
        'card-accent-amethyst': variant === 'amethyst',
        'border-b-2 border-b-amber-400': variant === 'golden',
        'glow-emerald': glow && variant === 'emerald',
        'glow-amethyst': glow && variant === 'amethyst',
        'glow-golden': glow && variant === 'golden',
      },
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4 border-b border-white/10', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    variant?: 'default' | 'gradient';
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      'text-2xl font-bold leading-tight tracking-tight text-white',
      {
        'brand-gradient': variant === 'gradient',
      },
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-400', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-4', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4 border-t border-white/10', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

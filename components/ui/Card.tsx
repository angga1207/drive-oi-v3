import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn('px-6 py-5 border-b border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900 dark:text-gray-100', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: CardProps) {
  return (
    <p className={cn('mt-1 text-sm text-gray-500 dark:text-gray-400', className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }: CardProps) {
  return (
    <div className={cn('px-6 py-5', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: CardProps) {
  return (
    <div className={cn('px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-xl', className)}>
      {children}
    </div>
  );
}

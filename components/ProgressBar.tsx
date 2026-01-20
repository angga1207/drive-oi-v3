'use client';

interface ProgressBarProps {
  percentage: number;
  color: string;
}

export default function ProgressBar({ percentage, color }: ProgressBarProps) {
  return (
    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full bg-linear-to-r ${color} transition-all duration-500`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
}

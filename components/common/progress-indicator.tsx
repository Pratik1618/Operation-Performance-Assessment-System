interface ProgressIndicatorProps {
  percentage: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  displayValue?: string;
}

export function ProgressIndicator({
  percentage,
  label,
  size = 'md',
  variant = 'default',
  displayValue,
}: ProgressIndicatorProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const variantColors = {
    default: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  };

  const color = variantColors[variant];
  const radiusMap = {
    sm: 26,
    md: 36,
    lg: 48,
  };
  const strokeWidthMap = {
    sm: 6,
    md: 7,
    lg: 8,
  };
  const radius = radiusMap[size];
  const strokeWidth = strokeWidthMap[size];
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        <svg className="transform -rotate-90" width="100%" height="100%">
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`${displayValue && displayValue.length > 4 ? 'text-2xl' : textSizeClasses[size]} font-bold text-foreground`}>
            {displayValue ?? `${Math.round(percentage)}%`}
          </span>
        </div>
      </div>
      <p className={`${labelSizeClasses[size]} font-medium text-center text-foreground`}>
        {label}
      </p>
    </div>
  );
}

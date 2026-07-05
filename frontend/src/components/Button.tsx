import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 active:scale-98 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2';

  const variants = {
    primary:
      'bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm',
    secondary:
      'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700',
    danger:
      'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 shadow-sm',
    ghost:
      'hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
    outline:
      'border border-zinc-200 bg-transparent hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
  };

  // Dynamic override filtering to prevent Tailwind specificity clashes
  let variantStyles = variants[variant] || '';
  if (className.includes('bg-')) {
    variantStyles = variantStyles
      .split(' ')
      .filter((c) => !c.startsWith('bg-') && !c.startsWith('dark:bg-') && !c.startsWith('hover:bg-') && !c.startsWith('dark:hover:bg-'))
      .join(' ');
  }
  if (className.includes('text-')) {
    variantStyles = variantStyles
      .split(' ')
      .filter((c) => !c.startsWith('text-') && !c.startsWith('dark:text-') && !c.startsWith('hover:text-') && !c.startsWith('dark:hover:text-'))
      .join(' ');
  }

  return (
    <button
      className={`${baseStyle} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

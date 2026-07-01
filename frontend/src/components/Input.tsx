import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  className = '',
  label,
  error,
  id,
  type = 'text',
  ...props
}) => {
  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        className={`flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/45 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? 'border-red-500 focus-visible:ring-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
};

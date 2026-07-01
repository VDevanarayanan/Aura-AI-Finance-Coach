import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> & {
  Header: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Title: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
  Description: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
  Content: React.FC<React.HTMLAttributes<HTMLDivElement>>;
} = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`rounded-2xl border border-zinc-850 bg-zinc-900/45 shadow-md backdrop-blur-md transition-all duration-300 hover:border-zinc-800 hover:shadow-lg text-zinc-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h3
      className={`font-semibold tracking-tight text-zinc-50 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p
      className={`text-sm text-zinc-400 dark:text-zinc-400 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;

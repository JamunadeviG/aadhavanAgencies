import React from 'react';

/**
 * Standardized Layout Components
 * These provide consistent structure across all pages
 */

export const PageWrapper = ({ children, className = '', variant = 'default' }) => {
  if (variant === 'premium') {
    return (
      <div className={`premium-bg-wrapper ${className}`}>
        <div className="premium-bg-canvas"></div>
        <div className="premium-bg-content">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`page-wrapper ${className}`}>
      {children}
    </div>
  );
};

export const PageHeader = ({ children, className = '' }) => {
  return (
    <header className={`page-header ${className}`}>
      <div className="container">
        {children}
      </div>
    </header>
  );
};

export const PageContent = ({ children, className = '', fullWidth = false, containerSize = 'normal' }) => {
  const containerClass = fullWidth
    ? ''
    : containerSize === 'xl'
      ? 'container-xl'
      : 'container';

  return (
    <main className={`page-content ${className}`}>
      {fullWidth ? children : <div className={containerClass}>{children}</div>}
    </main>
  );
};

export const PageFooter = ({ children, className = '' }) => {
  return (
    <footer className={`page-footer ${className}`}>
      <div className="container">
        {children}
      </div>
    </footer>
  );
};

export const Section = ({ children, className = '', spacing = 'large' }) => {
  const spacingClass = spacing === 'small' ? 'py-8' : spacing === 'medium' ? 'py-12' : 'py-16';
  return (
    <section className={`${spacingClass} ${className}`}>
      {children}
    </section>
  );
};

export const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'normal'
}) => {
  const hoverClass = hover ? 'card-hover' : '';
  const paddingClass = padding === 'small' ? 'card-sm' : padding === 'large' ? 'card-lg' : '';

  return (
    <div className={`card ${hoverClass} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`card-header ${className}`}>
      {children}
    </div>
  );
};

export const CardBody = ({ children, className = '' }) => {
  return (
    <div className={`card-body ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`card-footer ${className}`}>
      {children}
    </div>
  );
};

export const Grid = ({
  children,
  cols = 1,
  gap = 4,
  className = '',
  responsive = true
}) => {
  const colsClass = responsive ? 'grid-responsive' : `grid-cols-${cols}`;
  const gapClass = `gap-${gap}`;

  return (
    <div className={`grid ${colsClass} ${gapClass} ${className}`}>
      {children}
    </div>
  );
};

export const Flex = ({
  children,
  direction = 'row',
  align = 'center',
  justify = 'start',
  className = ''
}) => {
  const directionClass = direction === 'col' ? 'flex-col' : '';
  const alignClass = `items-${align}`;
  const justifyClass = `justify-${justify}`;

  return (
    <div className={`flex ${directionClass} ${alignClass} ${justifyClass} ${className}`}>
      {children}
    </div>
  );
};

export const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeClass = size === 'small' ? 'w-6 h-6' : size === 'large' ? 'w-12 h-12' : 'w-8 h-8';

  return (
    <div className={`loading-spinner ${sizeClass} ${className}`}></div>
  );
};

export const LoadingState = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`loading text-center ${className}`}>
      <LoadingSpinner size="large" />
      <p className="text-muted mt-4">{message}</p>
    </div>
  );
};

import React from 'react';
import './button.styles.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        astral-button
        astral-button-${variant}
        astral-button-${size}
        ${fullWidth ? 'astral-button-full-width' : ''}
        ${loading ? 'astral-button-loading' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="astral-button-spinner" />}
      <span className="astral-button-content">{children}</span>
    </button>
  );
}

Button.displayName = 'Button'; 
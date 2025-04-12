import React from 'react';
import './button.styles.css';

export interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export function Button({ children, className = '' }: ButtonProps) {
  return (
    <div className={`astral-button ${className}`}>
      {children}
    </div>
  );
}

Button.displayName = 'Button';

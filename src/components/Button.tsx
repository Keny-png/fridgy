import React, { type ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    fullWidth?: boolean;
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    className = '',
    disabled,
    ...props
}) => {
    const classes = [
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth ? 'btn--full' : '',
        isLoading ? 'btn--loading' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button className={classes} disabled={disabled || isLoading} {...props}>
            {isLoading ? <span className="btn__spinner" /> : children}
        </button>
    );
};

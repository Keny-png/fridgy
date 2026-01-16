import { type InputHTMLAttributes, forwardRef } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    fullWidth = true,
    className = '',
    id,
    ...props
}, ref) => {
    // Generate ID if not provided but label exists (for accessibility)
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
        <div className={`input-wrapper ${fullWidth ? 'input-wrapper--full' : ''} ${className}`}>
            {label && <label htmlFor={inputId} className="input__label">{label}</label>}
            <input
                ref={ref}
                id={inputId}
                className={`input ${error ? 'input--error' : ''}`}
                {...props}
            />
            {error && <span className="input__error">{error}</span>}
        </div>
    );
});

Input.displayName = 'Input';

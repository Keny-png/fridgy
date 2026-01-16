import React, { type HTMLAttributes } from 'react';
import './Card.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hoverable = false,
    ...props
}) => {
    return (
        <div
            className={`card ${hoverable ? 'card--hoverable' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

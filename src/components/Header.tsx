import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from './Button';
import './Header.css';

interface HeaderProps {
    title: string;
    onSettingsClick?: () => void;
    userPhotoUrl?: string; // If user is logged in
}

export const Header: React.FC<HeaderProps> = ({ title, onSettingsClick, userPhotoUrl }) => {
    return (
        <header className="header">
            <h1 className="header__title">{title}</h1>
            <div className="header__actions">
                <Button variant="ghost" size="icon" onClick={onSettingsClick} aria-label="Settings">
                    {userPhotoUrl ? (
                        <img src={userPhotoUrl} alt="Profile" className="header__avatar" />
                    ) : (
                        <Settings size={24} />
                    )}
                </Button>
            </div>
        </header>
    );
};

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import './AppLayout.css';

import { useAuth } from '../contexts/AuthContext';
import { SettingsModal } from '../components/SettingsModal';

export const AppLayout: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

    const getHeaderTitle = () => {
        switch (location.pathname) {
            case '/': return 'マイキッチン';
            case '/add': return '食材追加';
            case '/stats': return '分析';
            default: return 'Fridgy';
        }
    };

    const handleLogout = () => {
        setIsSettingsOpen(false);
        logout();
    };

    return (
        <div className="app-layout">
            <Header
                title={getHeaderTitle()}
                onSettingsClick={() => setIsSettingsOpen(true)}
                userPhotoUrl={user?.photoUrl}
            />
            <main className="app-content">
                <Outlet />
            </main>
            <BottomNav />

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onLogout={handleLogout}
                userEmail={user?.email || ''}
            />
        </div>
    );
};

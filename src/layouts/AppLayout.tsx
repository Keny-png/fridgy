import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import './AppLayout.css';

export const AppLayout: React.FC = () => {
    const location = useLocation();

    const getHeaderTitle = () => {
        switch (location.pathname) {
            case '/': return 'マイキッチン';
            case '/add': return '食材追加';
            case '/stats': return '分析';
            default: return 'Fridgy';
        }
    };

    return (
        <div className="app-layout">
            <Header title={getHeaderTitle()} />
            <main className="app-content">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};

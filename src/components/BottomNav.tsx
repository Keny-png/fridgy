import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, PlusCircle, PieChart } from 'lucide-react';
import './BottomNav.css';

export const BottomNav: React.FC = () => {
    return (
        <nav className="bottom-nav">
            <NavLink
                to="/"
                className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
            >
                <LayoutGrid size={24} />
                <span className="nav-item__label">在庫</span>
            </NavLink>

            <NavLink
                to="/add"
                className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
            >
                <PlusCircle size={24} />
                <span className="nav-item__label">追加</span>
            </NavLink>

            <NavLink
                to="/stats"
                className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
            >
                <PieChart size={24} />
                <span className="nav-item__label">分析</span>
            </NavLink>
        </nav>
    );
};

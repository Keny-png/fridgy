import React, { useMemo } from 'react';
import { Card } from '../components/Card';
import { useStats } from '../hooks/useStats';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export const StatsPage: React.FC = () => {
    const { history, isLoading } = useStats();
    const { isAuthenticated } = useAuth();

    const stats = useMemo(() => {
        // Group by month
        const currentMonth = format(new Date(), 'yyyy-MM');

        const currentMonthData = history.filter(h => h.date.startsWith(currentMonth));
        const wasteCount = currentMonthData.filter(h => h.action === 'wasted').length;
        const consumedCount = currentMonthData.filter(h => h.action === 'consumed').length;

        // Top wasted items
        const wastedItems: Record<string, number> = {};
        history.filter(h => h.action === 'wasted').forEach(h => {
            wastedItems[h.itemName] = (wastedItems[h.itemName] || 0) + 1;
        });

        const topWasted = Object.entries(wastedItems)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

        return { currentMonth, wasteCount, consumedCount, topWasted };
    }, [history]);

    if (!isAuthenticated) return <div style={{ padding: '20px', textAlign: 'center' }}>ログインしてください</div>;
    if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Loader2 className="btn__spinner" /></div>;

    return (
        <div className="stats-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Card>
                <h2 style={{ marginBottom: '16px' }}>今月の実績</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: 'var(--color-primary-light)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                            {stats.consumedCount}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-primary-dark)' }}>使い切り</div>
                    </div>
                    <div style={{ background: '#FEE2E2', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-danger)' }}>
                            {stats.wasteCount}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-danger)' }}>廃棄</div>
                    </div>
                </div>
            </Card>

            <Card>
                <h2 style={{ marginBottom: '16px' }}>よく廃棄する食材</h2>
                {stats.topWasted.length === 0 ? (
                    <p style={{ color: 'var(--color-text-sub)' }}>廃棄データはありません。素晴らしい！</p>
                ) : (
                    <ul style={{ listStyle: 'none' }}>
                        {stats.topWasted.map(([name, count], index) => (
                            <li key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: index < 2 ? '1px solid var(--color-border)' : 'none' }}>
                                <span>{name}</span>
                                <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>{count} 回</span>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
};

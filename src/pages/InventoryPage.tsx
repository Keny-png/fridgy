import React, { useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Utensils, Trash2 } from 'lucide-react';

export const InventoryPage: React.FC = () => {
    const { items, isLoading, error, refresh, updateStatus } = useInventory();
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Refresh on mount if authenticated
    useEffect(() => {
        if (isAuthenticated) refresh();
    }, [isAuthenticated, refresh]);

    if (!isAuthenticated) {
        return (
            <div className="inventory-page">
                <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <h2 style={{ marginBottom: '16px' }}>Fridgyへようこそ</h2>
                    <p style={{ marginBottom: '24px', color: 'var(--color-text-sub)' }}>
                        Googleアカウントでログインして、家族の食材管理を始めましょう。
                    </p>
                    <Button onClick={login} fullWidth>
                        Googleでログイン
                    </Button>
                </Card>
            </div>
        );
    }

    if (isLoading && items.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <Loader2 className="btn__spinner" style={{ width: 40, height: 40, color: 'var(--color-primary)' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-danger)' }}>
                {error}
                <Button onClick={refresh} variant="ghost" style={{ marginTop: '10px' }}>再試行</Button>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="inventory-page">
                <Card>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <h2>食材がありません</h2>
                        <p style={{ color: 'var(--color-text-sub)', margin: '10px 0' }}>
                            冷蔵庫は空っぽです。食材を追加しましょう！
                        </p>
                        <Button onClick={() => navigate('/add')}>食材を追加</Button>
                    </div>
                </Card>
            </div>
        );
    }

    const handleConsume = async (id: string, name: string) => {
        if (!window.confirm(`${name} を「使い切り」にしますか？`)) return;
        await updateStatus(id, 'consumed');
    };

    const handleWaste = async (id: string, name: string) => {
        const reason = window.prompt(`${name} を「廃棄」しますか？理由を入力してください（例: 期限切れ、傷み）:`, '期限切れ');
        if (reason === null) return;
        await updateStatus(id, 'wasted', reason);
    };

    // Calculate sorted items
    const sortedItems = [...items].sort((a, b) => {
        const dateA = new Date(a.expiryDate).getTime();
        const dateB = new Date(b.expiryDate).getTime();
        return dateA - dateB;
    });

    return (
        <div className="inventory-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sortedItems.map(item => {
                // Calculate days remaining
                const now = new Date();
                const expiry = new Date(item.expiryDate);
                const diffTime = expiry.getTime() - now.getTime();
                const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let statusColor = 'var(--color-primary)';
                let statusText = `残り ${daysDiff} 日`;

                if (daysDiff < 0) {
                    statusColor = 'var(--color-danger)';
                    statusText = '期限切れ';
                } else if (daysDiff === 0) {
                    statusColor = 'var(--color-warning)';
                    statusText = '今日まで';
                } else if (daysDiff <= 3) {
                    statusColor = 'var(--color-warning)';
                }

                return (
                    <Card key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{item.name}</h3>
                                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-sub)' }}>
                                    {item.quantity} {item.unit} • {item.location}
                                </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: statusColor,
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                }}>
                                    {statusText}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-sub)' }}>
                                期限: {expiry.toLocaleDateString()}
                            </span>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    style={{ color: 'var(--color-text-sub)' }}
                                    onClick={() => handleWaste(item.id, item.name)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleConsume(item.id, item.name)}
                                >
                                    <Utensils size={16} style={{ marginRight: '4px' }} /> 使い切り
                                </Button>
                            </div>
                        </div>
                    </Card>
                );
            })}

            {/* Floating Action Button for Add */}
            <div style={{ position: 'fixed', bottom: '100px', right: '20px', zIndex: 5 }}>
                <Button
                    variant="primary"
                    size="icon"
                    onClick={() => navigate('/add')}
                    style={{ width: '56px', height: '56px', borderRadius: '50%', boxShadow: 'var(--shadow-float)' }}
                >
                    <Plus size={24} />
                </Button>
            </div>
        </div>
    );
};

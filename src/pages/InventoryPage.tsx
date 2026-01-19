import React, { useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { QuantityModal } from '../components/QuantityModal';
import { Calendar, Clock, MapPin, Tag, Loader2, Plus, Utensils, Trash2, Pencil } from 'lucide-react';

import type { SortOption } from '../types';

export const InventoryPage: React.FC = () => {
    const { items, isLoading, error, refresh, updateStatus, consumeItem } = useInventory();
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Modal State
    const [selectedItem, setSelectedItem] = React.useState<{ id: string, name: string, quantity: number, unit: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // Sort State
    const [sortBy, setSortBy] = React.useState<SortOption>('expiry');

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

    const openConsumeModal = (item: { id: string, name: string, quantity: number, unit?: string }) => {
        if (item.quantity <= 1) {
            // Direct consume if 1
            if (window.confirm(`${item.name} を「使い切り」にしますか？`)) {
                consumeItem(item.id, item.name, 1, 1);
            }
        } else {
            setSelectedItem({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit || '個'
            });
            setIsModalOpen(true);
        }
    };

    const handleModalConfirm = async (amount: number) => {
        if (selectedItem) {
            setIsModalOpen(false); // Close first for better UX
            await consumeItem(selectedItem.id, selectedItem.name, selectedItem.quantity, amount);
            setSelectedItem(null);
        }
    };

    const handleWaste = async (id: string, name: string) => {
        const reason = window.prompt(`${name} を「廃棄」しますか？理由を入力してください（例: 期限切れ、傷み）:`, '期限切れ');
        if (reason === null) return;
        await updateStatus(id, 'wasted', reason);
    };

    // Calculate sorted items
    const sortedItems = [...items].sort((a, b) => {
        switch (sortBy) {
            case 'expiry':
                return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
            case 'added':
                // Newest first
                return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
            case 'name':
                return a.name.localeCompare(b.name, 'ja');
            case 'location':
                // Custom order: Fridge -> Freezer -> Pantry
                const order: Record<string, number> = { '冷蔵': 1, '冷凍': 2, '常温': 3 };
                return (order[a.location] || 99) - (order[b.location] || 99);
            default:
                return 0;
        }
    });

    const SortButton: React.FC<{ type: SortOption, label: string, icon: React.ReactNode }> = ({ type, label, icon }) => (
        <button
            onClick={() => setSortBy(type)}
            style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: sortBy === type ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                background: sortBy === type ? 'var(--color-primary-light)' : 'var(--color-bg)',
                color: sortBy === type ? 'var(--color-primary-dark)' : 'var(--color-text-sub)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
            }}
        >
            {icon} {label}
        </button>
    );

    return (
        <div className="inventory-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Modal */}
            {selectedItem && (
                <QuantityModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleModalConfirm}
                    itemName={selectedItem.name}
                    maxQuantity={selectedItem.quantity}
                    unit={selectedItem.unit}
                />
            )}

            {/* Sort Controls */}
            <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '4px',
                marginLeft: '-4px', // Visual alignment
                paddingLeft: '4px',
                width: '100%',
                scrollbarWidth: 'none' // Hide scrollbar
            }}>
                <SortButton type="expiry" label="期限順" icon={<Calendar size={14} />} />
                <SortButton type="added" label="追加日" icon={<Clock size={14} />} />
                <SortButton type="location" label="場所別" icon={<MapPin size={14} />} />
                <SortButton type="name" label="名前順" icon={<Tag size={14} />} />
            </div>

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
                                    onClick={() => navigate(`/edit/${item.id}`, { state: { item } })}
                                    style={{
                                        minWidth: 'auto',
                                        padding: '0 8px'
                                    }}
                                >
                                    <Pencil size={16} />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => openConsumeModal(item)}
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

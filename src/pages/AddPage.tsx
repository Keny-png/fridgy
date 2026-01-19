import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useInventory } from '../hooks/useInventory';
import { type StorageLocation, type InventoryItem } from '../types';
import { ArrowLeft } from 'lucide-react';
import { addDays, format } from 'date-fns';

const CATEGORIES = ['野菜', '果物', '肉類', '乳製品', '飲料', '穀物', 'お菓子', '調味料', 'その他'];
const LOCATIONS: StorageLocation[] = ['冷蔵', '冷凍', '常温'];

const EXPIRY_SUGGESTIONS: Record<string, number> = {
    '野菜': 7,
    '果物': 7,
    '肉類': 3,
    '乳製品': 14,
    '飲料': 30,
    '穀物': 180,
    'お菓子': 60,
    '調味料': 180,
    'その他': 14
};

export const AddPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { addItem, editItem, isLoading } = useInventory();

    const isEditing = Boolean(id);
    const initialItem = location.state?.item as InventoryItem | undefined;

    const [formData, setFormData] = useState({
        name: '',
        quantity: 1,
        unit: '個',
        category: 'その他',
        location: '冷蔵' as StorageLocation,
        expiryDate: format(addDays(new Date(), 7), 'yyyy-MM-dd')
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isEditing && initialItem) {
            setFormData({
                name: initialItem.name,
                quantity: initialItem.quantity,
                unit: initialItem.unit || '個',
                category: initialItem.category,
                location: initialItem.location,
                expiryDate: initialItem.expiryDate.split('T')[0] // Ensure YYYY-MM-DD
            });
        }
    }, [isEditing, initialItem]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const category = e.target.value;
        // Only auto-update expiry if NOT editing or if user explicitly changes category 
        // (Logic choice: maybe keep original date on edit unless user wants reset? 
        // For simplicity, let's update date if they change category, but keep if just loading form)

        // If Just loading, we dealt with it in useEffect.
        // Here is user interaction.
        const days = EXPIRY_SUGGESTIONS[category] || 7;
        setFormData(prev => ({
            ...prev,
            category,
            expiryDate: format(addDays(new Date(), days), 'yyyy-MM-dd')
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        setIsSubmitting(true);
        try {
            if (isEditing && initialItem) {
                await editItem({
                    ...initialItem, // Keep ID and addedDate
                    name: formData.name,
                    quantity: Number(formData.quantity),
                    unit: formData.unit,
                    category: formData.category,
                    location: formData.location,
                    expiryDate: formData.expiryDate,
                    // Note and ImageID preserved via spread if not in form
                });
            } else {
                await addItem({
                    name: formData.name,
                    quantity: Number(formData.quantity),
                    unit: formData.unit,
                    category: formData.category,
                    location: formData.location,
                    expiryDate: formData.expiryDate,
                    note: ''
                });
            }
            navigate('/');
        } catch (err) {
            alert(isEditing ? '更新に失敗しました' : '追加に失敗しました');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-page">
            <div style={{ marginBottom: '16px' }}>
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ paddingLeft: 0 }}>
                    <ArrowLeft size={16} style={{ marginRight: '4px' }} /> 戻る
                </Button>
            </div>

            <Card>
                <h2 style={{ marginBottom: '20px' }}>{isEditing ? '食材を編集' : '食材を追加'}</h2>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="品名"
                        placeholder="例: 牛乳"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                        autoFocus={!isEditing}
                    />

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Input
                            label="数量"
                            type="number"
                            min="0" // Allow 0? No, usually 1.
                            step="0.1" // Allow decimals
                            style={{ flex: 1 }}
                            value={formData.quantity}
                            onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                        />
                        <div className="input-wrapper" style={{ width: '100px' }}>
                            <label className="input__label">単位</label>
                            <select
                                className="input"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            >
                                <option value="個">個</option>
                                <option value="玉">玉</option>
                                <option value="本">本</option>
                                <option value="枚">枚</option>
                                <option value="パック">パック</option>
                                <option value="g">g</option>
                                <option value="kg">kg</option>
                                <option value="ml">ml</option>
                                <option value="L">L</option>
                            </select>
                        </div>
                    </div>

                    <div className="input-wrapper">
                        <label className="input__label">カテゴリ</label>
                        <select
                            className="input"
                            value={formData.category}
                            onChange={handleCategoryChange}
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="input-wrapper">
                        <label className="input__label">保存場所</label>
                        <select
                            className="input"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value as StorageLocation })}
                        >
                            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    <Input
                        label="期限"
                        type="date"
                        value={formData.expiryDate}
                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                        required
                    />

                    <div style={{ marginTop: '24px' }}>
                        <Button
                            fullWidth
                            size="lg"
                            type="submit"
                            isLoading={isSubmitting || isLoading}
                        >
                            {isEditing ? '更新する' : '保存する'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

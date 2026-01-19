import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Minus, Plus, X } from 'lucide-react';
import './QuantityModal.css';

interface QuantityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
    itemName: string;
    maxQuantity: number;
    unit?: string;
}

export const QuantityModal: React.FC<QuantityModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    maxQuantity,
    unit = ''
}) => {
    const [amount, setAmount] = useState(1);

    // Reset amount when modal opens
    useEffect(() => {
        if (isOpen) {
            setAmount(1); // Default to 1 or max? Usually 1 is better for consumption
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleIncrement = () => {
        if (amount < maxQuantity) setAmount(prev => prev + 1);
    };

    const handleDecrement = () => {
        if (amount > 1) setAmount(prev => prev - 1);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val)) {
            if (val > maxQuantity) setAmount(maxQuantity);
            else if (val < 1) setAmount(1);
            else setAmount(val);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(amount);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>消費数量を選択</h3>
                    <button onClick={onClose} className="btn-close">
                        <X size={20} />
                    </button>
                </div>

                <p className="item-name">{itemName}</p>
                <p className="available-text">在庫: {maxQuantity} {unit}</p>

                <form onSubmit={handleSubmit} className="quantity-form">
                    <div className="stepper-container">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleDecrement}
                            disabled={amount <= 1}
                        >
                            <Minus size={24} />
                        </Button>

                        <div className="input-container">
                            <input
                                type="number"
                                className="quantity-input"
                                value={amount}
                                onChange={handleChange}
                                min={1}
                                max={maxQuantity}
                            />
                            <span className="unit-label">{unit}</span>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleIncrement}
                            disabled={amount >= maxQuantity}
                        >
                            <Plus size={24} />
                        </Button>
                    </div>

                    <div className="slider-container">
                        <input
                            type="range"
                            min="1"
                            max={maxQuantity}
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="range-slider"
                        />
                    </div>

                    <div className="quick-actions">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setAmount(maxQuantity)}>
                            すべて ({maxQuantity})
                        </Button>
                    </div>

                    <Button type="submit" fullWidth size="lg">
                        消費する
                    </Button>
                </form>
            </div>
        </div>
    );
};

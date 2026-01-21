import React, { useState } from 'react';
import { Button } from './Button';
import { sheetsService } from '../lib/sheets';
import { LogOut, Database, Check, RefreshCw, X } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    userEmail?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onLogout, userEmail }) => {
    const [databases, setDatabases] = useState<Array<{ id: string, name: string, owner: string, isShared: boolean }>>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleScan = async () => {
        setIsScanning(true);
        setScanError(null);
        try {
            const dbs = await sheetsService.findAllDatabases();
            setDatabases(dbs);
            if (dbs.length === 0) {
                setScanError('データベースが見つかりませんでした。');
            }
        } catch (err) {
            console.error(err);
            setScanError('検索中にエラーが発生しました。');
        } finally {
            setIsScanning(false);
        }
    };

    const handleSelectDatabase = (id: string) => {
        if (window.confirm('このデータベースに接続しますか？アプリがリロードされます。')) {
            sheetsService.setSpreadsheetId(id);
            window.location.reload();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'var(--color-bg)',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '400px',
                maxHeight: '80vh',
                overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>設定</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X size={24} />
                    </Button>
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--color-text-sub)' }}>アカウント</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--color-secondary-bg)', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{userEmail}</span>
                    </div>
                    <Button
                        fullWidth
                        variant="secondary"
                        onClick={onLogout}
                        style={{ marginTop: '12px', color: 'var(--color-danger)', borderColor: 'transparant' }}
                    >
                        <LogOut size={16} style={{ marginRight: '8px' }} /> ログアウト
                    </Button>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>データベース接続設定</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)', marginBottom: '16px' }}>
                        家族と共有できない場合は、ここで「共有されたデータベース」を探して接続してください。
                    </p>

                    <Button
                        fullWidth
                        onClick={handleScan}
                        isLoading={isScanning}
                        variant="primary"
                        style={{ marginBottom: '16px' }}
                    >
                        <RefreshCw size={16} style={{ marginRight: '8px' }} /> 利用可能なデータベースを検索
                    </Button>

                    {scanError && (
                        <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{scanError}</p>
                    )}

                    {databases.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {databases.map(db => (
                                <div key={db.id} style={{
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600 }}>{db.name}</span>
                                        {db.isShared && <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>共有中</span>}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)' }}>
                                        所有者: {db.owner}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => handleSelectDatabase(db.id)}
                                        style={{ marginTop: '8px' }}
                                    >
                                        <Database size={14} style={{ marginRight: '6px' }} /> 接続する
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

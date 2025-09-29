import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { ShieldCheckIcon, BackspaceIcon } from '@heroicons/react/24/solid';

interface AdminPinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AdminPinModal: React.FC<AdminPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { settings } = useData();
    const ADMIN_PIN = settings.adminPin;

    const [pin, setPin] = useState('');
    const [isWrong, setIsWrong] = useState(false);

    useEffect(() => {
        if (isOpen) { setPin(''); setIsWrong(false); }
    }, [isOpen]);

    useEffect(() => {
        if (pin.length === ADMIN_PIN.length) {
            if (pin === ADMIN_PIN) {
                onSuccess();
            } else {
                setIsWrong(true);
                setTimeout(() => { setIsWrong(false); setPin(''); }, 500);
            }
        }
    }, [pin, onSuccess, ADMIN_PIN]);

    const handlePinClick = (num: string) => {
        if (pin.length < ADMIN_PIN.length) setPin(p => p + num);
    };
    const handleBackspace = () => setPin(p => p.slice(0, -1));
    
    if (!isOpen) return null;

    const pinDots = Array(ADMIN_PIN.length).fill(0).map((_, i) => (
        <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${i < pin.length ? 'bg-purple-400 border-purple-400' : 'border-slate-600'}`}></div>
    ));

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[99] animate-fade-in" onClick={onClose}>
            <div className={`glass-pane rounded-2xl p-8 w-full max-w-xs text-center animate-fade-in-up ${isWrong ? 'animate-shake' : ''}`} onClick={e => e.stopPropagation()}>
                <ShieldCheckIcon className="w-12 h-12 mx-auto text-purple-400 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Akses Admin</h2>
                <p className="text-slate-400 text-sm mb-6">Masukkan PIN untuk melanjutkan</p>
                <div className="flex justify-center items-center gap-3 mb-6">{pinDots}</div>
                <div className="grid grid-cols-3 gap-4">
                    {'123456789'.split('').map(num => (
                        <button key={num} onClick={() => handlePinClick(num)} className="aspect-square bg-slate-800/50 hover:bg-purple-500/20 rounded-full text-2xl font-semibold transition-colors focus:outline-none focus:ring-2 ring-purple-500">
                            {num}
                        </button>
                    ))}
                    <div />
                    <button onClick={() => handlePinClick('0')} className="aspect-square bg-slate-800/50 hover:bg-purple-500/20 rounded-full text-2xl font-semibold transition-colors focus:outline-none focus:ring-2 ring-purple-500">0</button>
                    <button onClick={handleBackspace} className="aspect-square flex justify-center items-center bg-slate-800/50 hover:bg-purple-500/20 rounded-full text-2xl font-semibold transition-colors focus:outline-none focus:ring-2 ring-purple-500"><BackspaceIcon className="w-7 h-7" /></button>
                </div>
            </div>
        </div>
    );
};

export default AdminPinModal;
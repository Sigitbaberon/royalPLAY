import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { XMarkIcon, UserCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface VipModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const VipModal: React.FC<VipModalProps> = ({ isOpen, onClose }) => {
    const { settings, getUserVipStatus } = useData();
    const [gameId, setGameId] = useState('');

    const vipStatus = useMemo(() => {
        if (!gameId || !settings.vipSystem.enabled) return null;
        return getUserVipStatus(gameId);
    }, [gameId, getUserVipStatus, settings.vipSystem.enabled]);
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[99] animate-fade-in p-4" onClick={onClose}>
            <div className="glass-pane rounded-2xl p-8 w-full max-w-2xl text-center animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-bold text-yellow-300 flex items-center gap-2"><SparklesIcon className="w-7 h-7"/> Program Loyalitas VIP</h2>
                     <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <p className="text-slate-400 text-sm mb-6">Masukkan ID Game Anda untuk melihat status VIP dan keuntungan eksklusif yang Anda dapatkan. Semakin tinggi level Anda, semakin besar bonusnya!</p>

                <div className="relative max-w-md mx-auto mb-8">
                    <UserCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input 
                        type="text" 
                        value={gameId} 
                        onChange={(e) => setGameId(e.target.value)} 
                        placeholder="Masukkan ID Game Anda di sini..."
                        className="input-field pl-12"
                    />
                </div>

                {vipStatus && (
                    <div className="text-left animate-fade-in space-y-6">
                        <div>
                            <p className="text-slate-400">Level Saat Ini:</p>
                            <div className="flex items-center gap-3">
                                <div dangerouslySetInnerHTML={{ __html: vipStatus.currentTier.icon }}/>
                                <h3 className="text-3xl font-bold text-white">{vipStatus.currentTier.name}</h3>
                            </div>
                            <p className="text-sm text-green-400">Total Volume Transaksi: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(vipStatus.totalVolume)}</p>
                        </div>
                        {vipStatus.nextTier && (
                             <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-400">Progres ke <span className="font-bold text-white">{vipStatus.nextTier.name}</span></span>
                                    <span className="text-yellow-400">{vipStatus.progress.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2.5">
                                    <div className="bg-gradient-to-r from-yellow-500 to-orange-400 h-2.5 rounded-full" style={{ width: `${vipStatus.progress}%` }}></div>
                                </div>
                                <p className="text-xs text-slate-500 text-right mt-1">Butuh {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(vipStatus.nextTier.threshold - vipStatus.totalVolume)} lagi</p>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="mt-8 pt-6 border-t border-purple-500/20">
                     <h4 className="text-lg font-semibold text-purple-300 mb-4">Daftar Level & Keuntungan VIP</h4>
                     <div className="space-y-3 text-left">
                        {settings.vipSystem.tiers.map(tier => (
                            <div key={tier.name} className={`p-4 rounded-lg flex items-center gap-4 border ${vipStatus?.currentTier.name === tier.name ? 'bg-purple-500/10 border-purple-500' : 'bg-black/20 border-transparent'}`}>
                                <div className="p-2 bg-slate-800/50 rounded-full" dangerouslySetInnerHTML={{ __html: tier.icon }} />
                                <div className="flex-1">
                                    <h5 className="font-bold text-white">{tier.name}</h5>
                                    <p className="text-xs text-slate-400">Threshold: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tier.threshold)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-green-400">Diskon Beli: {tier.buyRateBonus}%</p>
                                    <p className="text-sm font-semibold text-purple-400">Bonus Jual: {tier.sellRateBonus}%</p>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>

            </div>
        </div>
    );
};

export default VipModal;
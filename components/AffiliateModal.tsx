import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { XMarkIcon, UserCircleIcon, ShareIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/solid';

interface AffiliateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AffiliateModal: React.FC<AffiliateModalProps> = ({ isOpen, onClose }) => {
    const { settings, getAffiliateStats, showToast } = useData();
    const [gameId, setGameId] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const referralLink = useMemo(() => {
        if (!gameId) return '';
        // FIX: Construct a robust, public-facing URL from window.location.host
        // to avoid using blob: URLs that are invalid for external services.
        const baseUrl = `https://${window.location.host}/`;
        return `${baseUrl}?ref=${gameId}`;
    }, [gameId]);

    const affiliateStats = useMemo(() => {
        if (!gameId || !settings.affiliateSystem.enabled) return null;
        return getAffiliateStats(gameId);
    }, [gameId, getAffiliateStats, settings.affiliateSystem.enabled]);
    
    const handleCopy = useCallback(() => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink).then(() => {
            setIsCopied(true);
            showToast('Link referral berhasil disalin!', 'success');
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, [referralLink, showToast]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[99] animate-fade-in p-4" onClick={onClose}>
            <div className="glass-pane rounded-2xl p-8 w-full max-w-3xl text-center animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-bold text-green-300 flex items-center gap-2"><ShareIcon className="w-7 h-7"/> Program Afiliasi</h2>
                     <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <p className="text-slate-400 text-sm mb-6">Bagikan link referral unik Anda dan dapatkan komisi {settings.affiliateSystem.commissionRate}% dari setiap transaksi pertama pengguna baru yang Anda ajak!</p>

                <div className="relative max-w-md mx-auto mb-8">
                    <UserCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input 
                        type="text" 
                        value={gameId} 
                        onChange={(e) => setGameId(e.target.value)} 
                        placeholder="Masukkan ID Game Anda untuk membuat link..."
                        className="input-field pl-12"
                    />
                </div>

                {gameId && (
                    <div className="animate-fade-in space-y-8">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Link Referral Unik Anda</label>
                             <div className="flex items-center gap-2 p-3 bg-black/50 border border-slate-700 rounded-lg">
                                <span className="flex-grow text-sm font-mono text-yellow-400 tracking-tight overflow-x-auto whitespace-nowrap">{referralLink}</span>
                                <button type="button" onClick={handleCopy} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${isCopied ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                    {isCopied ? <><CheckIcon className="h-4 w-4" /> Disalin!</> : <><ClipboardDocumentIcon className="h-4 w-4" /> Salin</>}
                                </button>
                            </div>
                        </div>

                        {affiliateStats && (
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                                <div className="bg-black/20 p-4 rounded-lg">
                                    <p className="text-sm text-slate-400">Total Referral</p>
                                    <p className="text-2xl font-bold text-white">{affiliateStats.referrals.toLocaleString('id-ID')}</p>
                                </div>
                                <div className="bg-black/20 p-4 rounded-lg">
                                    <p className="text-sm text-slate-400">Komisi Didapat</p>
                                    <p className="text-2xl font-bold text-green-400">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(affiliateStats.commissionBalance)}</p>
                                </div>
                                <div className="bg-black/20 p-4 rounded-lg">
                                    <p className="text-sm text-slate-400">Total Dicairkan</p>
                                    <p className="text-2xl font-bold text-slate-300">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(affiliateStats.commissionPaid)}</p>
                                </div>
                             </div>
                        )}
                        
                         <div className="text-left">
                            <h4 className="font-semibold text-purple-300 mb-2">Riwayat Komisi</h4>
                            <div className="max-h-48 overflow-y-auto space-y-2 pr-2 bg-black/20 p-3 rounded-lg">
                                {affiliateStats && affiliateStats.history.length > 0 ? (
                                    affiliateStats.history.slice().reverse().map((item, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm p-2 bg-slate-800/50 rounded">
                                            <div>
                                                <p className="font-mono text-xs text-slate-400">Dari Transaksi: {item.transactionId}</p>
                                                <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString('id-ID')}</p>
                                            </div>
                                            <p className="font-semibold text-green-400">+{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.amount)}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-slate-500 py-4">Belum ada riwayat komisi.</p>
                                )}
                            </div>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AffiliateModal;
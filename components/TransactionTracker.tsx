import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { Transaction, TransactionStatus } from '../types';
import { CheckCircleIcon, ClockIcon, XCircleIcon, CubeTransparentIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { formatChipAmount } from '../constants';

interface TransactionTrackerProps {
    initialTransactionId?: string | null;
    onBackToForm: () => void;
}

const TimelineStep: React.FC<{ icon: React.ReactNode; title: string; active: boolean; done: boolean; isLast?: boolean; timestamp?: number }> = ({ icon, title, active, done, isLast = false, timestamp }) => {
    const ringColor = active ? 'ring-purple-500' : 'ring-slate-700';
    const iconColor = active || done ? 'text-purple-300' : 'text-slate-500';
    
    return (
        <div className="flex items-start">
            <div className="flex flex-col items-center mr-6">
                <div className={`w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center ring-2 transition-all relative ${ringColor}`}>
                    <div className={`transition-colors ${iconColor}`}>{icon}</div>
                    {active && <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping -z-10 opacity-50"></div>}
                </div>
                {!isLast && (
                    <div className="w-0.5 h-20 mt-2 bg-slate-700 relative overflow-hidden">
                         <div className={`absolute top-0 left-0 w-full h-full bg-purple-500 transition-transform duration-500 ease-out ${done ? 'translate-y-0' : '-translate-y-full'}`}></div>
                    </div>
                )}
            </div>
            <div>
                <h4 className={`text-lg font-bold transition-colors ${active || done ? 'text-white' : 'text-slate-400'}`}>{title}</h4>
                {done && timestamp && <p className="text-sm text-slate-500 mt-1">{new Date(timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</p>}
                {active && <p className="text-sm text-purple-400 animate-pulse mt-1">Sedang diproses...</p>}
            </div>
        </div>
    );
};

const TransactionDetails: React.FC<{tx: Transaction}> = ({ tx }) => {
    return (
        <div className="text-sm space-y-4">
            {tx.type === 'BUY' ? (
                <>
                    <div><p className="text-slate-400 text-xs uppercase tracking-wider">Paket Dibeli</p><p className="font-semibold text-lg text-white">{tx.chipPackage?.name} ({formatChipAmount(tx.chipAmount)})</p></div>
                    <div><p className="text-slate-400 text-xs uppercase tracking-wider">Total Pembayaran</p><p className="font-semibold text-lg text-green-300">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tx.moneyValue)}</p></div>
                    <div><p className="text-slate-400 text-xs uppercase tracking-wider">Dikirim Ke ID</p><p className="font-semibold text-white font-mono">{tx.destinationId}</p></div>
                </>
            ) : (
                <>
                    <div><p className="text-slate-400 text-xs uppercase tracking-wider">Jumlah Chip Dijual</p><p className="font-semibold text-lg text-white">{formatChipAmount(tx.chipAmount)}</p></div>
                    <div><p className="text-slate-400 text-xs uppercase tracking-wider">Jumlah Diterima</p><p className="font-semibold text-lg text-green-300">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tx.moneyValue)}</p></div>
                    <div><p className="text-slate-400 text-xs uppercase tracking-wider">Dibayarkan Ke</p><p className="font-semibold text-white">{tx.paymentDetails?.provider} ({tx.paymentDetails?.accountNumber})</p><p className="text-slate-300">a/n {tx.paymentDetails?.accountName}</p></div>
                </>
            )}
        </div>
    );
}

const TransactionTracker: React.FC<TransactionTrackerProps> = ({ initialTransactionId, onBackToForm }) => {
    const { transactions, showToast, settings } = useData();
    const [trackingCode, setTrackingCode] = useState(initialTransactionId || '');
    const [foundTransaction, setFoundTransaction] = useState<Transaction | null>(null);

    const handleTrack = useCallback(() => {
        setFoundTransaction(null);
        if (!trackingCode) { showToast('Masukkan kode transaksi.', 'error'); return; }
        const transaction = transactions.find(tx => tx.id.toLowerCase() === trackingCode.toLowerCase());
        if (transaction) {
            setTimeout(() => setFoundTransaction(transaction), 100); // Small delay for animation
        }
        else showToast('Kode transaksi tidak ditemukan.', 'error');
    }, [trackingCode, transactions, showToast]);
    
    useEffect(() => {
        if(initialTransactionId) {
            const transaction = transactions.find(tx => tx.id.toLowerCase() === initialTransactionId.toLowerCase());
            if(transaction) setFoundTransaction(transaction);
        }
    }, [initialTransactionId, transactions]);


    const statusIndex = foundTransaction ? [TransactionStatus.PENDING, TransactionStatus.VERIFYING, TransactionStatus.PAID].indexOf(foundTransaction.status) : -1;
    const isTelegramEnabled = settings.notifications.userBot.enabled && settings.notifications.userBot.botUsername;
    const telegramLink = foundTransaction && isTelegramEnabled
        ? `https://t.me/${settings.notifications.userBot.botUsername}?start=${foundTransaction.id}`
        : '#';

    return (
        <div className="glass-pane p-8 rounded-2xl max-w-2xl mx-auto animate-slide-in-up">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-purple-300">Lacak Transaksi</h2>
                    <p className="text-slate-400">Lihat progres transaksi Anda secara real-time.</p>
                </div>
                <button onClick={onBackToForm} className="flex items-center gap-2 text-sm text-purple-400 hover:text-white transition-colors">
                    <ArrowLeftIcon className="h-4 w-4" /> Kembali
                </button>
            </div>
            
            <div className="flex gap-2">
                <div className="relative flex-grow">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none"/>
                    <input
                        type="text"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                        placeholder="Contoh: RP-XXXXXX"
                        className="input-field pl-12 w-full"
                    />
                </div>
                <button onClick={handleTrack} className="btn-primary btn-shimmer">
                    Lacak
                </button>
            </div>
            
            {foundTransaction && (
                <div className="mt-8 p-6 bg-black/30 rounded-lg border border-purple-500/20 animate-slide-in-up">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-bold text-lg">Detail: <span className="font-mono text-yellow-300">{foundTransaction.id}</span> <span className={`ml-2 text-xs font-bold px-2 py-1 rounded-full ${foundTransaction.type === 'SELL' ? 'bg-purple-500/20 text-purple-300' : 'bg-green-500/20 text-green-300'}`}>{foundTransaction.type === 'SELL' ? 'JUAL' : 'BELI'}</span></h3>
                        {isTelegramEnabled && (
                            <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.999 1.993C6.486 1.994 2 6.48 2 11.994c0 5.513 4.486 9.999 10 10 5.514 0 10-4.486 10-10s-4.486-10-10.001-10.001zm4.495 7.426l-1.53 7.17c-.202.946-1.151 1.208-1.922.75l-2.43-1.789-1.17 1.125c-.129.13-.303.208-.483.208-.344 0-.624-.28-.624-.623v-2.487l4.312-3.87-5.323 3.32c-.44.275-.828.13-1.04-.403L5.59 11.23c-.27-.68.46-1.002 1.055-.783l8.47 3.253.38-1.792c.199-.947 1.168-1.2 1.93-.738z"/></svg>
                                Lacak via Telegram
                            </a>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-8">
                        <div className="sm:w-2/5">
                             <TimelineStep icon={<ClockIcon className="h-6 w-6"/>} title="Tertunda" active={statusIndex === 0} done={statusIndex >= 0} timestamp={foundTransaction.createdAt} />
                             <TimelineStep icon={<CubeTransparentIcon className="h-6 w-6"/>} title="Verifikasi" active={statusIndex === 1} done={statusIndex > 1} timestamp={foundTransaction.verifiedAt} />
                             <TimelineStep icon={<CheckCircleIcon className="h-6 w-6"/>} title={foundTransaction.type === 'SELL' ? 'Dibayar' : 'Dikirim'} active={statusIndex >= 2} done={statusIndex >= 2} isLast timestamp={foundTransaction.paidAt}/>
                        </div>
                        <div className="sm:w-3/5 sm:pl-8 sm:border-l border-slate-700">
                             <TransactionDetails tx={foundTransaction} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionTracker;

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
    const iconColor = active || done ? 'text-purple-400' : 'text-slate-500';
    const lineColor = done ? 'bg-purple-500' : 'bg-slate-700';

    return (
        <div className="flex items-start">
            <div className="flex flex-col items-center mr-4">
                <div className={`w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center ring-2 transition-all relative ${ringColor}`}>
                    <div className={`transition-colors ${iconColor}`}>{icon}</div>
                    {active && <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping -z-10 opacity-75"></div>}
                </div>
                {!isLast && <div className={`w-0.5 h-16 mt-2 transition-colors ${lineColor}`}></div>}
            </div>
            <div>
                <h4 className={`font-bold transition-colors ${active || done ? 'text-white' : 'text-slate-400'}`}>{title}</h4>
                {done && timestamp && <p className="text-xs text-slate-500 mt-1">{new Date(timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</p>}
                {active && <p className="text-xs text-purple-400 animate-pulse mt-1">Sedang diproses...</p>}
            </div>
        </div>
    );
};

const TransactionDetails: React.FC<{tx: Transaction}> = ({ tx }) => {
    if (tx.type === 'BUY') {
        return (
            <div className="text-sm space-y-3">
                <div><p className="text-slate-400 text-xs">Paket Dibeli</p><p className="font-semibold text-lg text-white">{tx.chipPackage?.name} ({formatChipAmount(tx.chipAmount)})</p></div>
                <div><p className="text-slate-400 text-xs">Total Pembayaran</p><p className="font-semibold text-lg text-green-400">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tx.moneyValue)}</p></div>
                <div><p className="text-slate-400 text-xs">Dikirim Ke ID</p><p className="font-semibold text-white font-mono">{tx.destinationId}</p></div>
            </div>
        );
    }
    // SELL transaction
    return (
        <div className="text-sm space-y-3">
            <div><p className="text-slate-400 text-xs">Jumlah Chip Dijual</p><p className="font-semibold text-lg text-white">{formatChipAmount(tx.chipAmount)}</p></div>
            <div><p className="text-slate-400 text-xs">Jumlah Diterima</p><p className="font-semibold text-lg text-green-400">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tx.moneyValue)}</p></div>
            <div><p className="text-slate-400 text-xs">Dibayarkan Ke</p><p className="font-semibold text-white">{tx.paymentDetails?.provider} ({tx.paymentDetails?.accountNumber})</p><p className="text-slate-300">a/n {tx.paymentDetails?.accountName}</p></div>
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
        if (transaction) setFoundTransaction(transaction);
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
        <div className="glass-pane p-8 rounded-2xl max-w-lg mx-auto animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-purple-300">Lacak Transaksi</h2>
                    <p className="text-slate-400 text-sm">Lihat progres transaksi Anda.</p>
                </div>
                <button onClick={onBackToForm} className="flex items-center gap-2 text-sm text-purple-400 hover:text-white transition-colors">
                    <ArrowLeftIcon className="h-4 w-4" /> Kembali ke Form
                </button>
            </div>
            
            <div className="flex gap-2">
                <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Contoh: RP-XXXXXX"
                    className="flex-grow bg-black/30 border border-purple-500/30 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-white"
                />
                <button onClick={handleTrack} className="btn-shimmer px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
            </div>
            
            {foundTransaction && (
                <div className="mt-8 p-6 bg-black/30 rounded-lg border border-purple-500/20 animate-fade-in-up">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-bold text-lg">Detail Transaksi: <span className="font-mono">{foundTransaction.id}</span> <span className={`ml-2 text-xs font-bold px-2 py-1 rounded-full ${foundTransaction.type === 'SELL' ? 'bg-purple-500/20 text-purple-300' : 'bg-green-500/20 text-green-300'}`}>{foundTransaction.type === 'SELL' ? 'JUAL' : 'BELI'}</span></h3>
                        {isTelegramEnabled && (
                            <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M9.315 7.584C8.448 7.923 7.5 8.583 7.5 9.75c0 1.167.948 1.827 1.815 2.166.425.162.833.376 1.185.648.352.271.5.621.5.986 0 .63-.728 1.125-1.685 1.125-.957 0-1.685-.495-1.685-1.125a.75.75 0 0 0-1.5 0c0 .995 1.023 2.625 3.185 2.625 2.162 0 3.185-1.63 3.185-2.625 0-1.167-.948-1.827-1.815-2.166-.425-.162-.833-.376-1.185-.648-.352-.272-.5-.622-.5-.986 0-.63.728-1.125 1.685-1.125.957 0 1.685.495 1.685 1.125a.75.75 0 1 0 1.5 0c0-.995-1.023-2.625-3.185-2.625C10.338 4.875 9.315 6.51 9.315 7.584ZM12 2.25A9.75 9.75 0 1 0 21.75 12 9.75 9.75 0 0 0 12 2.25Z" /></svg>
                                Lacak via Telegram
                            </a>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-2/5 mb-6 sm:mb-0">
                             <TimelineStep icon={<ClockIcon className="h-5 w-5"/>} title="Tertunda" active={statusIndex === 0} done={statusIndex >= 0} timestamp={foundTransaction.createdAt} />
                             <TimelineStep icon={<CubeTransparentIcon className="h-5 w-5"/>} title="Verifikasi" active={statusIndex === 1} done={statusIndex > 1} timestamp={foundTransaction.verifiedAt} />
                             <TimelineStep icon={<CheckCircleIcon className="h-5 w-5"/>} title={foundTransaction.type === 'SELL' ? 'Dibayar' : 'Dikirim'} active={statusIndex >= 2} done={statusIndex >= 2} isLast timestamp={foundTransaction.paidAt}/>
                        </div>
                        <div className="sm:w-3/5 sm:pl-4 sm:border-l border-slate-700">
                             <TransactionDetails tx={foundTransaction} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionTracker;
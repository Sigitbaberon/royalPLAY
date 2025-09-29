import React, { useEffect, useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Transaction, TransactionStatus } from '../types';
import { formatChipAmount } from '../constants';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

const timeAgo = (timestamp: number): string => {
    const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
    if (seconds < 5) return "baru saja";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " tahun lalu";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan lalu";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit lalu";
    return Math.floor(seconds) + " detik lalu";
};

const HistoryItem: React.FC<{ transaction: Transaction; isNew: boolean }> = ({ transaction, isNew }) => {
    const isSell = transaction.type === 'SELL';
    const iconBg = isSell ? 'bg-purple-500/10' : 'bg-green-500/10';
    const icon = isSell 
        ? <ArrowTrendingUpIcon className="w-6 h-6 text-purple-400" /> 
        : <ArrowTrendingDownIcon className="w-6 h-6 text-green-400" />;
    const actionText = isSell ? 'dijual' : 'dibeli';

    return (
        <div className={`p-3 bg-black/20 rounded-lg flex items-center gap-4 transition-all duration-500 ${isNew ? 'shadow-lg shadow-purple-500/20 scale-105' : 'scale-100'}`} style={{ animation: isNew ? 'slide-in-up-fade 0.5s' : 'none'}}>
            <div className={`p-3 rounded-full ${iconBg}`}>
                {icon}
            </div>
            <div className="flex-1 text-sm">
                <p className="font-semibold text-white">
                    <span className="text-yellow-400">{formatChipAmount(transaction.chipAmount)} Chip</span> {actionText}
                </p>
                <p className="text-xs text-slate-400">
                    ID: {transaction.anonymizedId} &bull; {timeAgo(transaction.createdAt)}
                </p>
            </div>
        </div>
    );
};

const GlobalHistoryFeed: React.FC = () => {
    const { transactions } = useData();
    const [visibleTransactions, setVisibleTransactions] = useState<Transaction[]>([]);
    const [latestId, setLatestId] = useState<string | null>(null);

    const paidTransactions = useMemo(() => 
        transactions
            .filter(tx => tx.status === TransactionStatus.PAID)
            .sort((a, b) => b.createdAt - a.createdAt),
    [transactions]);

    useEffect(() => {
        const initialTransactions = paidTransactions.slice(0, 10);
        setVisibleTransactions(initialTransactions);
        if (initialTransactions.length > 0) {
            setLatestId(initialTransactions[0].id);
        }

        const interval = setInterval(() => {
            const latestInMemory = paidTransactions[0];
            if (latestInMemory && latestInMemory.id !== latestId) {
                setVisibleTransactions(current => {
                    const newArray = [latestInMemory, ...current];
                    if (newArray.length > 20) newArray.pop();
                    return newArray;
                });
                setLatestId(latestInMemory.id);
            }
        }, Math.random() * 6000 + 3000); // 3-9 seconds

        return () => clearInterval(interval);
    }, [paidTransactions, latestId]);

    return (
        <div className="glass-pane p-6 rounded-2xl h-full sticky top-28">
            <h3 className="text-xl font-bold text-purple-300 mb-4">Riwayat Transaksi Global</h3>
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {visibleTransactions.length > 0 ? visibleTransactions.map((tx) => (
                    <HistoryItem key={`${tx.id}-${tx.createdAt}`} transaction={tx} isNew={tx.id === latestId} />
                )) : <p className="text-sm text-slate-500 text-center py-8">Belum ada transaksi.</p>}
            </div>
             <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[rgba(6,4,16,1)] to-transparent pointer-events-none"></div>
        </div>
    );
};

export default GlobalHistoryFeed;
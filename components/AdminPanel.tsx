import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { AdminSettings, Transaction, TransactionStatus, TransactionType } from '../types';
import { formatChipAmount } from '../constants';
import { Cog6ToothIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon, ClockIcon, BanknotesIcon, CubeTransparentIcon, ShoppingCartIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/solid';

const AdminPanel: React.FC = () => {
    const { transactions, settings, updateSettings, updateTransactionStatus, showToast } = useData();
    const [localSettings, setLocalSettings] = useState<AdminSettings>(settings);
    const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'ALL'>(TransactionStatus.PENDING);
    const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL');
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : parseFloat(value) || 0 }));
    };
    const handleSaveSettings = () => {
        updateSettings(localSettings);
        showToast('Pengaturan berhasil disimpan!', 'success');
    };
    const filteredTransactions = useMemo(() => {
        return [...transactions]
            .sort((a, b) => b.createdAt - a.createdAt)
            .filter(tx => statusFilter === 'ALL' || tx.status === statusFilter)
            .filter(tx => typeFilter === 'ALL' || tx.type === typeFilter);
    }, [transactions, statusFilter, typeFilter]);
    
    const summaryStats = useMemo(() => ({
        pendingSellCount: transactions.filter(t => t.status === TransactionStatus.PENDING && t.type === 'SELL').length,
        pendingBuyCount: transactions.filter(t => t.status === TransactionStatus.PENDING && t.type === 'BUY').length,
        totalPendingSellValue: transactions.filter(t => t.status === TransactionStatus.PENDING && t.type === 'SELL').reduce((sum, tx) => sum + tx.moneyValue, 0),
        totalPendingBuyValue: transactions.filter(t => t.status === TransactionStatus.PENDING && t.type === 'BUY').reduce((sum, tx) => sum + tx.moneyValue, 0),
    }), [transactions]);

    const getStatusPill = (status: TransactionStatus) => {
        const styles: {[key in TransactionStatus]: string} = {
            [TransactionStatus.PENDING]: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
            [TransactionStatus.VERIFYING]: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
            [TransactionStatus.PAID]: 'bg-green-500/10 text-green-300 border-green-500/20',
            [TransactionStatus.REJECTED]: 'bg-red-500/10 text-red-300 border-red-500/20',
        };
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>{status}</span>;
    };
    
    const SummaryCard: React.FC<{icon: React.ReactNode, title: string, value: string | number, color: string}> = ({icon, title, value, color}) => (
        <div className="glass-pane p-5 rounded-xl flex items-center gap-5 transition-all hover:border-purple-500/50 hover:shadow-purple-500/10">
            <div className={`p-3 rounded-full bg-slate-900/50 ${color}`}>{icon}</div>
            <div>
                <h3 className="text-sm font-medium text-slate-400">{title}</h3>
                <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-12 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard icon={<ArrowTrendingUpIcon className="w-7 h-7"/>} title="Order Jual Tertunda" value={summaryStats.pendingSellCount} color="text-yellow-400" />
                <SummaryCard icon={<ShoppingCartIcon className="w-7 h-7"/>} title="Order Beli Tertunda" value={summaryStats.pendingBuyCount} color="text-green-400" />
                <SummaryCard icon={<BanknotesIcon className="w-7 h-7"/>} title="Total Nilai Jual" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits:0 }).format(summaryStats.totalPendingSellValue)} color="text-amber-400" />
                <SummaryCard icon={<BanknotesIcon className="w-7 h-7"/>} title="Total Nilai Beli" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits:0 }).format(summaryStats.totalPendingBuyValue)} color="text-green-500" />
                
                <div className="glass-pane p-5 rounded-xl md:col-span-2 lg:col-span-4">
                    <h2 className="text-lg font-bold mb-4 text-purple-300 flex items-center gap-2"><Cog6ToothIcon className="w-5 h-5"/>Pengaturan Kurs & Lainnya</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div><label className="block text-xs font-medium text-slate-300 mb-1">Kurs Jual / 1B (User Jual ke Admin)</label><input type="number" name="exchangeRate" value={localSettings.exchangeRate} onChange={handleSettingsChange} className="w-full bg-black/30 border border-purple-500/30 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="block text-xs font-medium text-slate-300 mb-1">Kurs Beli / 1B (User Beli dari Admin)</label><input type="number" name="buyRate" value={localSettings.buyRate} onChange={handleSettingsChange} className="w-full bg-black/30 border border-purple-500/30 rounded-lg px-3 py-2 text-sm" /></div>
                        <div className="flex flex-col justify-end">
                            <div className="flex items-center gap-2 pt-2"><input type="checkbox" name="isDestinationIdRequired" checked={localSettings.isDestinationIdRequired} onChange={handleSettingsChange} className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500" /><label htmlFor="isDestinationIdRequired" className="text-sm text-slate-300">Wajibkan ID Pengirim</label></div>
                        </div>
                    </div>
                    <button onClick={handleSaveSettings} className="mt-6 w-full md:w-auto float-right py-2 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors">Simpan Pengaturan</button>
                </div>
            </div>

            <div className="glass-pane p-6 rounded-2xl">
                <h2 className="text-2xl font-bold mb-4 text-purple-300">Daftar Transaksi</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 border-b border-purple-500/10 pb-4">
                    <div className="flex gap-2 items-center"><span className="text-sm font-semibold text-slate-400">Status:</span>{Object.values(TransactionStatus).map(s => <button key={s} onClick={()=>setStatusFilter(s)} className={`px-3 py-1 text-xs rounded-full ${statusFilter === s ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}>{s}</button>)}<button onClick={()=>setStatusFilter('ALL')} className={`px-3 py-1 text-xs rounded-full ${statusFilter === 'ALL' ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}>Semua</button></div>
                    <div className="flex gap-2 items-center"><span className="text-sm font-semibold text-slate-400">Tipe:</span><button onClick={()=>setTypeFilter('SELL')} className={`px-3 py-1 text-xs rounded-full ${typeFilter === 'SELL' ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}>Jual</button><button onClick={()=>setTypeFilter('BUY')} className={`px-3 py-1 text-xs rounded-full ${typeFilter === 'BUY' ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}>Beli</button><button onClick={()=>setTypeFilter('ALL')} className={`px-3 py-1 text-xs rounded-full ${typeFilter === 'ALL' ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}>Semua</button></div>
                </div>
                <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-xs text-slate-400 uppercase bg-black/20"><tr><th className="px-6 py-3">ID Transaksi</th><th className="px-6 py-3">Tipe</th><th className="px-6 py-3">Tanggal</th><th className="px-6 py-3">Jumlah Chip</th><th className="px-6 py-3">Nilai (Rp)</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Aksi</th></tr></thead>
                    <tbody>{filteredTransactions.map(tx => (<tr key={tx.id} className="border-b border-slate-800 hover:bg-purple-500/5 transition-colors"><td className="px-6 py-4 font-mono text-purple-300">{tx.id}</td><td className="px-6 py-4"><span className={`font-bold ${tx.type === 'SELL' ? 'text-purple-400' : 'text-green-400'}`}>{tx.type}</span></td><td className="px-6 py-4">{new Date(tx.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</td><td className="px-6 py-4 font-semibold">{formatChipAmount(tx.chipAmount)}</td><td className="px-6 py-4 text-green-400 font-semibold">{new Intl.NumberFormat('id-ID').format(tx.moneyValue)}</td><td className="px-6 py-4">{getStatusPill(tx.status)}</td><td className="px-6 py-4 text-right"><button onClick={() => setSelectedTx(tx)} className="font-medium bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 px-3 py-1 rounded-md transition">Detail</button></td></tr>))}</tbody>
                </table>{filteredTransactions.length === 0 && <p className="text-center py-8 text-slate-500">Tidak ada transaksi yang cocok.</p>}</div>
            </div>

            {selectedTx && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setSelectedTx(null)}>
                    <div className="glass-pane rounded-2xl w-full max-w-2xl p-6 space-y-4 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start"><h3 className="text-xl font-bold text-purple-300">Detail Transaksi <span className="font-mono text-amber-400">{selectedTx.id}</span></h3><button onClick={() => setSelectedTx(null)} className="text-slate-500 hover:text-white transition-colors text-2xl">&times;</button></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><h4 className="font-semibold text-slate-300 border-b border-slate-700 pb-2 mb-4">Bukti Transfer</h4><a href={selectedTx.proofImage} target="_blank" rel="noopener noreferrer"><img src={selectedTx.proofImage} alt="Bukti" className="rounded-lg w-full border-2 border-slate-700 hover:border-purple-500 transition-colors" /></a></div>
                            <div><h4 className="font-semibold text-slate-300 border-b border-slate-700 pb-2 mb-4">Info Transaksi</h4><div className="text-sm space-y-2">
                                    {selectedTx.type === 'SELL' ? (
                                        [
                                            {label: "Metode Bayar", value: selectedTx.paymentDetails?.method},
                                            {label: "Provider", value: selectedTx.paymentDetails?.provider},
                                            {label: "No. Akun", value: selectedTx.paymentDetails?.accountNumber},
                                            {label: "Atas Nama", value: selectedTx.paymentDetails?.accountName},
                                            {label: "ID Pengirim", value: selectedTx.destinationId || '-'}
                                        ].map(item => <div key={item.label}><strong className="text-slate-400 w-28 inline-block">{item.label}</strong>: {item.value}</div>)
                                    ) : (
                                         [
                                            {label: "Paket Dibeli", value: selectedTx.chipPackage?.name},
                                            {label: "ID Tujuan", value: selectedTx.destinationId || '-'}
                                        ].map(item => <div key={item.label}><strong className="text-slate-400 w-28 inline-block">{item.label}</strong>: {item.value}</div>)
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end items-center flex-wrap gap-3 pt-4 border-t border-slate-700">
                            <div className="flex-grow">{getStatusPill(selectedTx.status)}</div>
                            {[TransactionStatus.PENDING, TransactionStatus.VERIFYING].includes(selectedTx.status) && <button onClick={() => { updateTransactionStatus(selectedTx.id, TransactionStatus.REJECTED); setSelectedTx(null); }} className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg font-semibold text-sm transition"><XCircleIcon className="w-4 h-4" /> Tolak</button>}
                            {selectedTx.status === TransactionStatus.PENDING && <button onClick={() => { updateTransactionStatus(selectedTx.id, TransactionStatus.VERIFYING); setSelectedTx(null); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-600 rounded-lg font-semibold text-sm transition"><ArrowPathIcon className="w-4 h-4" /> Verifikasi</button>}
                            {[TransactionStatus.PENDING, TransactionStatus.VERIFYING].includes(selectedTx.status) && <button onClick={() => { updateTransactionStatus(selectedTx.id, TransactionStatus.PAID); setSelectedTx(null); }} className="flex items-center gap-2 px-4 py-2 bg-green-600/80 hover:bg-green-600 rounded-lg font-semibold text-sm transition"><CheckCircleIcon className="w-4 h-4" /> Tandai Selesai</button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
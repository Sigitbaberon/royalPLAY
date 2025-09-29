import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { AdminSettings, Transaction, TransactionStatus, TransactionType, PromoCode, Partner, ChatMessage } from '../types';
import { formatChipAmount, DEFAULT_ADMIN_PIN } from '../constants';
import { Cog6ToothIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon, ClockIcon, BanknotesIcon, ShoppingCartIcon, WalletIcon, BuildingLibraryIcon, ChartBarIcon, PowerIcon, CurrencyDollarIcon, CalendarDaysIcon, ShieldCheckIcon, StarIcon, BellIcon, PaintBrushIcon, KeyIcon, ArrowDownOnSquareIcon, TrashIcon, TicketIcon, PencilIcon, UserGroupIcon, ChatBubbleLeftRightIcon, PaperClipIcon, ShareIcon, TrophyIcon, ClipboardDocumentCheckIcon, PaperAirplaneIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

type AdminTab = 'dashboard' | 'transactions' | 'chat' | 'settings';

const Accordion: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="glass-pane rounded-xl overflow-hidden border border-purple-500/20">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-5 text-left bg-black/20 hover:bg-black/40 transition-colors">
                <h3 className="text-lg font-bold text-purple-300 flex items-center gap-3">{icon}{title}</h3>
                <ChevronDownIcon className={`w-6 h-6 transform transition-transform text-purple-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-6 border-t border-[var(--border-color)] animate-fade-in">{children}</div>}
        </div>
    );
}

const SettingsPanel: React.FC<{
    localSettings: AdminSettings;
    onSettingsChange: React.Dispatch<React.SetStateAction<AdminSettings>>;
    onSave: () => void;
    onPinChange: (pin: string) => void;
    onPinReset: () => void;
    onAddPromoCode: (codeData: Omit<PromoCode, 'id' | 'currentUses' | 'createdAt' | 'isActive'>) => void;
    onUpdatePromoCode: (id: string, updates: Partial<PromoCode>) => void;
    onDeletePromoCode: (id: string) => void;
    onTestTelegram: (settings: AdminSettings['notifications']['adminBot']) => void;
}> = (props) => {
    const { localSettings, onSettingsChange, onSave, onPinChange, onPinReset, onAddPromoCode, onUpdatePromoCode, onDeletePromoCode, onTestTelegram } = props;
    const { showToast } = useData();
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [newPromo, setNewPromo] = useState({ code: "", discountPercent: 10, type: 'BOTH', maxUses: 100 });
    const [newPartner, setNewPartner] = useState({ name: "" });

    const handleGenericChange = (path: string, value: any) => {
        onSettingsChange(prev => {
            const setImmutable = (obj: any, keys: string[], val: any): any => {
                if (keys.length === 0) return val;
                const [key, ...restKeys] = keys;
                const newObj = Array.isArray(obj) ? [...obj] : { ...(obj || {}) };
                (newObj as any)[key] = setImmutable(obj ? (obj as any)[key] : undefined, restKeys, val);
                return newObj;
            };
            return setImmutable(prev, path.split('.'), value);
        });
    };
    
    const handleQrisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { showToast('Ukuran file QRIS maksimal 2MB.', 'error'); return; }
            const reader = new FileReader();
            reader.onloadend = () => { handleGenericChange('adminPaymentInfo.qrisImage', reader.result as string); showToast('Gambar QRIS berhasil diunggah.', 'info'); };
            reader.onerror = () => showToast('Gagal membaca file QRIS.', 'error');
            reader.readAsDataURL(file);
        }
    };
    
    const handlePinUpdate = () => {
        if(newPin !== confirmPin) { showToast("PIN tidak cocok!", "error"); return; }
        onPinChange(newPin);
        setNewPin("");
        setConfirmPin("");
    }
    
    const handleCreatePromo = () => {
        if (!newPromo.code || newPromo.discountPercent <= 0) {
            showToast("Kode dan persentase diskon harus diisi.", "error"); return;
        }
        onAddPromoCode(newPromo);
        setNewPromo({ code: "", discountPercent: 10, type: 'BOTH', maxUses: 100 });
    }

    const handlePartnerChange = (id: string, field: 'name' | 'logoUrl', value: string | null) => {
        const updatedPartners = localSettings.partners.map(p => p.id === id ? { ...p, [field]: value } : p);
        handleGenericChange('partners', updatedPartners);
    };

    const handlePartnerLogoUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1 * 1024 * 1024) { showToast('Ukuran file logo maksimal 1MB.', 'error'); return; }
            const reader = new FileReader();
            reader.onloadend = () => handlePartnerChange(id, 'logoUrl', reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAddPartner = () => {
        if (!newPartner.name.trim()) { showToast("Nama mitra harus diisi.", "error"); return; }
        const newPartnerObj: Partner = { id: `partner-${Date.now()}`, name: newPartner.name.trim(), logoUrl: null };
        handleGenericChange('partners', [...localSettings.partners, newPartnerObj]);
        setNewPartner({ name: "" });
    };

    const handleDeletePartner = (id: string) => {
        handleGenericChange('partners', localSettings.partners.filter(p => p.id !== id));
    };


    return (
         <div className="space-y-6">
            <Accordion title="Branding Aplikasi" icon={<PaintBrushIcon className="w-5 h-5"/>} >
                <div className="grid grid-cols-1 gap-6">
                    <div><label className="block text-sm font-medium text-slate-300 mb-2">Nama Aplikasi</label><input type="text" value={localSettings.branding.appName} onChange={e => handleGenericChange('branding.appName', e.target.value)} className="input-field" /></div>
                    <div><label className="block text-sm font-medium text-slate-300 mb-2">Kode Logo (SVG)</label><textarea value={localSettings.branding.appLogoSvg} onChange={e => handleGenericChange('branding.appLogoSvg', e.target.value)} rows={4} className="input-field font-mono text-xs" /></div>
                </div>
            </Accordion>
            
            <Accordion title="Marketing & Kode Promo" icon={<TicketIcon className="w-5 h-5"/>}>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold mb-2 text-white">Buat Kode Promo Baru</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-black/20 rounded-lg">
                            <input type="text" placeholder="Kode Promo" value={newPromo.code} onChange={e => setNewPromo(p => ({...p, code: e.target.value.toUpperCase()}))} className="input-field" />
                            <input type="number" placeholder="Diskon (%)" value={newPromo.discountPercent} onChange={e => setNewPromo(p => ({...p, discountPercent: parseFloat(e.target.value)}))} className="input-field" />
                            <select value={newPromo.type} onChange={e => setNewPromo(p => ({...p, type: e.target.value as any}))} className="input-field"><option value="BOTH">Beli & Jual</option><option value="BUY">Beli</option><option value="SELL">Jual</option></select>
                            <input type="number" placeholder="Max Pengguna" value={newPromo.maxUses} onChange={e => setNewPromo(p => ({...p, maxUses: parseInt(e.target.value)}))} className="input-field" />
                            <div className="col-span-full"><button onClick={handleCreatePromo} className="w-full btn-secondary">Buat Kode</button></div>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2 text-white">Manajemen Kode Promo</h4>
                        <div className="space-y-2">
                        {(localSettings.promoCodes || []).map(promo => (
                            <div key={promo.id} className="grid grid-cols-5 gap-4 items-center p-3 bg-black/20 rounded-lg text-sm">
                                <span className="font-mono font-bold text-yellow-300">{promo.code}</span>
                                <span>{promo.discountPercent}% ({promo.type})</span>
                                <span>{promo.currentUses} / {promo.maxUses === 0 ? '∞' : promo.maxUses}</span>
                                <button onClick={() => onUpdatePromoCode(promo.id, { isActive: !promo.isActive })} className={`px-2 py-1 rounded-full text-xs ${promo.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{promo.isActive ? 'Aktif' : 'Nonaktif'}</button>
                                <button onClick={() => onDeletePromoCode(promo.id)} className="text-red-400 hover:text-red-200 justify-self-end"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        ))}
                        {(localSettings.promoCodes || []).length === 0 && <p className="text-slate-500 text-center py-4">Belum ada kode promo.</p>}
                        </div>
                    </div>
                </div>
            </Accordion>
            
            <Accordion title="Pengaturan Umum & Kurs" icon={<Cog6ToothIcon className="w-5 h-5"/>}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-slate-300 mb-2">Kurs Jual / 1B (User Jual)</label><input type="number" value={localSettings.exchangeRate} onChange={e => handleGenericChange('exchangeRate', parseFloat(e.target.value))} className="input-field" /></div>
                    <div><label className="block text-sm font-medium text-slate-300 mb-2">Kurs Beli / 1B (User Beli)</label><input type="number" value={localSettings.buyRate} onChange={e => handleGenericChange('buyRate', parseFloat(e.target.value))} className="input-field" /></div>
                    <div><label className="block text-sm font-medium text-slate-300 mb-2">ID Game Admin (Tujuan Jual)</label><input type="text" value={localSettings.adminGameId} onChange={e => handleGenericChange('adminGameId', e.target.value)} className="input-field" /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-300 mb-2">Pengumuman Ticker</label><textarea value={localSettings.announcement} onChange={e => handleGenericChange('announcement', e.target.value)} rows={2} className="input-field" /></div>
                    <div className="flex items-center gap-3"><input id="maintenance" type="checkbox" checked={localSettings.maintenanceMode} onChange={e => handleGenericChange('maintenanceMode', e.target.checked)} className="h-5 w-5 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500" /><label htmlFor="maintenance" className="text-sm font-semibold text-yellow-300">Mode Maintenance</label></div>
                </div>
            </Accordion>
            
            <Accordion title="Info Pembayaran" icon={<WalletIcon className="w-5 h-5"/>}>
                 <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4"><input id="bank-tf" type="checkbox" checked={localSettings.adminPaymentInfo.paymentMethods.bankTransfer} onChange={e => handleGenericChange('adminPaymentInfo.paymentMethods.bankTransfer', e.target.checked)} className="h-5 w-5 rounded" /><label htmlFor="bank-tf" className="text-sm font-semibold text-slate-200">Aktifkan Pembayaran Bank Transfer</label></div>
                        {localSettings.adminPaymentInfo.paymentMethods.bankTransfer && <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-8 animate-fade-in"><input type="text" placeholder="Nama Bank" value={localSettings.adminPaymentInfo.bankName} onChange={e => handleGenericChange('adminPaymentInfo.bankName', e.target.value)} className="input-field" /><input type="text" placeholder="Nomor Rekening" value={localSettings.adminPaymentInfo.accountNumber} onChange={e => handleGenericChange('adminPaymentInfo.accountNumber', e.target.value)} className="input-field" /><input type="text" placeholder="Nama Pemilik" value={localSettings.adminPaymentInfo.accountName} onChange={e => handleGenericChange('adminPaymentInfo.accountName', e.target.value)} className="input-field" /></div>}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-4"><input id="qris-pm" type="checkbox" checked={localSettings.adminPaymentInfo.paymentMethods.qris} onChange={e => handleGenericChange('adminPaymentInfo.paymentMethods.qris', e.target.checked)} className="h-5 w-5 rounded" /><label htmlFor="qris-pm" className="text-sm font-semibold text-slate-200">Aktifkan Pembayaran QRIS</label></div>
                        {localSettings.adminPaymentInfo.paymentMethods.qris && <div className="pl-8 flex items-center gap-4 animate-fade-in"><input type="file" id="qris-upload" className="hidden" accept="image/*" onChange={handleQrisUpload}/><label htmlFor="qris-upload" className="btn-secondary">Unggah File QRIS</label> {localSettings.adminPaymentInfo.qrisImage && <div className="relative group"><img src={localSettings.adminPaymentInfo.qrisImage} alt="QRIS Preview" className="rounded-lg h-24 w-24 object-cover border border-slate-700"/><button onClick={() => handleGenericChange('adminPaymentInfo.qrisImage', null)} className="absolute -top-2 -right-2 btn-danger-sm"><XCircleIcon className="w-5 h-5"/></button></div>}</div>}
                    </div>
                 </div>
            </Accordion>
            
            <Accordion title="Notifikasi Admin (Telegram)" icon={<BellIcon className="w-5 h-5"/>}>
                <div className="space-y-4">
                    <p className="text-sm text-slate-400 -mt-2 mb-4">
                        Konfigurasi bot privat yang akan mengirim notifikasi interaktif untuk setiap transaksi baru ke chat Telegram Anda.
                    </p>
                    <div className="flex items-center gap-3"><input id="admin-notif" type="checkbox" checked={localSettings.notifications.adminBot.enabled} onChange={e => handleGenericChange('notifications.adminBot.enabled', e.target.checked)} className="h-5 w-5 rounded" /><label htmlFor="admin-notif" className="text-sm font-semibold text-slate-300">Aktifkan Notifikasi Transaksi ke Admin</label></div>
                    {localSettings.notifications.adminBot.enabled && (
                        <div className="space-y-4 animate-fade-in pl-8">
                            <div><label className="block text-sm text-slate-400 mb-1">Token Bot Admin</label><input type="password" value={localSettings.notifications.adminBot.botToken} onChange={e => handleGenericChange('notifications.adminBot.botToken', e.target.value)} className="input-field" placeholder="Token rahasia dari BotFather" /></div>
                            <div><label className="block text-sm text-slate-400 mb-1">Chat ID Admin</label><input type="text" value={localSettings.notifications.adminBot.chatId} onChange={e => handleGenericChange('notifications.adminBot.chatId', e.target.value)} className="input-field" placeholder="ID grup atau chat pribadi Anda" /></div>
                            <button onClick={() => onTestTelegram(localSettings.notifications.adminBot)} className="w-full btn-secondary mt-2">
                                Kirim Notifikasi Tes
                            </button>
                        </div>
                    )}
                </div>
            </Accordion>
            
            <Accordion title="Bot Layanan Pengguna (Telegram)" icon={<ChatBubbleLeftRightIcon className="w-5 h-5"/>}>
                <div className="space-y-4">
                    <p className="text-sm text-slate-400 -mt-2 mb-4">
                        Konfigurasi bot publik yang dapat digunakan oleh pengguna untuk fitur seperti 'Lacak via Telegram'. Anda hanya perlu mengisi username bot.
                    </p>
                    <div className="flex items-center gap-3"><input id="user-bot" type="checkbox" checked={localSettings.notifications.userBot.enabled} onChange={e => handleGenericChange('notifications.userBot.enabled', e.target.checked)} className="h-5 w-5 rounded" /><label htmlFor="user-bot" className="text-sm font-semibold text-slate-300">Aktifkan Bot Layanan Pengguna</label></div>
                    {localSettings.notifications.userBot.enabled && (
                        <div className="space-y-4 animate-fade-in pl-8">
                             <p className="text-xs text-slate-500">Pastikan bot Anda sudah diprogram untuk merespons perintah `/start` dengan parameter ID transaksi.</p>
                            <div><label className="block text-sm text-slate-400 mb-1">Username Bot Publik</label><input type="text" value={localSettings.notifications.userBot.botUsername} onChange={e => handleGenericChange('notifications.userBot.botUsername', e.target.value)} className="input-field" placeholder="Contoh: RaxnetStoreBot (tanpa @)" /></div>
                        </div>
                    )}
                </div>
            </Accordion>
            
            <Accordion title="Fitur Aplikasi" icon={<PowerIcon className="w-5 h-5"/>}>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex-item-center"><input id="feat-buy" type="checkbox" checked={localSettings.enabledFeatures.buyChip} onChange={e => handleGenericChange('enabledFeatures.buyChip', e.target.checked)} className="h-5 w-5 rounded" /><label htmlFor="feat-buy">Fitur Beli Chip</label></div>
                    <div className="flex-item-center"><input id="feat-sell" type="checkbox" checked={localSettings.enabledFeatures.sellChip} onChange={e => handleGenericChange('enabledFeatures.sellChip', e.target.checked)} className="h-5 w-5 rounded" /><label htmlFor="feat-sell">Fitur Jual Chip</label></div>
                    <div className="flex-item-center"><input id="feat-history" type="checkbox" checked={localSettings.enabledFeatures.globalHistory} onChange={e => handleGenericChange('enabledFeatures.globalHistory', e.target.checked)} className="h-5 w-5 rounded" /><label htmlFor="feat-history">Riwayat Global</label></div>
                    <div className="flex-item-center"><input id="feat-carousel" type="checkbox" checked={localSettings.enabledFeatures.providerCarousel} onChange={e => handleGenericChange('enabledFeatures.providerCarousel', e.target.checked)} className="h-5 w-5 rounded" /><label htmlFor="feat-carousel">Carousel Provider</label></div>
                </div>
            </Accordion>

            <Accordion title="Manajemen Mitra" icon={<UserGroupIcon className="w-5 h-5"/>}>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2 text-white">Tambah Mitra Baru</h4>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Nama Mitra" value={newPartner.name} onChange={e => setNewPartner({name: e.target.value})} className="input-field flex-grow" />
                            <button onClick={handleAddPartner} className="btn-secondary">Tambah</button>
                        </div>
                    </div>
                    <div>
                         <h4 className="font-semibold mb-2 text-white">Daftar Mitra</h4>
                         <div className="space-y-2">
                             {localSettings.partners.map(partner => (
                                 <div key={partner.id} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 items-center p-3 bg-black/20 rounded-lg text-sm">
                                     <input type="text" value={partner.name} onChange={e => handlePartnerChange(partner.id, 'name', e.target.value)} className="input-field-sm" />
                                     <div className="flex items-center gap-2">
                                        <input type="file" id={`logo-upload-${partner.id}`} onChange={(e) => handlePartnerLogoUpload(partner.id, e)} accept="image/*" className="hidden" />
                                        <label htmlFor={`logo-upload-${partner.id}`} className="btn-secondary text-xs whitespace-nowrap">Unggah Logo</label>
                                        {partner.logoUrl && <img src={partner.logoUrl} alt={partner.name} className="w-16 h-8 object-contain bg-white/10 rounded-md p-1" />}
                                     </div>
                                      <button onClick={() => handleDeletePartner(partner.id)} className="text-red-400 hover:text-red-200 justify-self-end"><TrashIcon className="w-5 h-5" /></button>
                                 </div>
                             ))}
                         </div>
                    </div>
                </div>
            </Accordion>

            <Accordion title="Pengaturan Live Chat" icon={<ChatBubbleLeftRightIcon className="w-5 h-5"/>}>
                <div className="flex items-center gap-3 mb-6"><input id="live-chat" type="checkbox" checked={localSettings.chatSettings.enabled} onChange={e => handleGenericChange('chatSettings.enabled', e.target.checked)} className="h-5 w-5 rounded" /><label htmlFor="live-chat" className="text-sm font-semibold text-slate-200">Aktifkan Live Chat</label></div>
                {localSettings.chatSettings.enabled && <div className="space-y-4 animate-fade-in pl-8"><div><label className="block text-sm text-slate-400 mb-1">Nama Agen</label><input type="text" value={localSettings.chatSettings.agentName} onChange={e => handleGenericChange('chatSettings.agentName', e.target.value)} className="input-field" /></div><div><label className="block text-sm text-slate-400 mb-1">Pesan Selamat Datang</label><textarea value={localSettings.chatSettings.welcomeMessage} onChange={e => handleGenericChange('chatSettings.welcomeMessage', e.target.value)} rows={3} className="input-field" /></div></div>}
            </Accordion>

            <Accordion title="Keamanan" icon={<ShieldCheckIcon className="w-5 h-5"/>}>
                <div className="grid md:grid-cols-2 gap-6 items-start">
                    <div><h4 className="font-semibold mb-2 text-white">Ubah PIN Admin</h4><div className="space-y-3"><input type="password" placeholder="PIN Baru" value={newPin} onChange={e => setNewPin(e.target.value)} className="input-field" /><input type="password" placeholder="Konfirmasi PIN Baru" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} className="input-field" /><button onClick={handlePinUpdate} className="btn-secondary w-full">Ubah PIN</button></div></div>
                    <div><h4 className="font-semibold mb-2 text-white">Reset PIN</h4><p className="text-sm text-slate-400 mb-3">Aksi ini akan mengembalikan PIN ke default ({DEFAULT_ADMIN_PIN}).</p><button onClick={onPinReset} className="btn-danger w-full">Reset PIN ke Default</button></div>
                </div>
            </Accordion>

             <div className="flex justify-end mt-8">
                <button onClick={onSave} className="btn-primary btn-shimmer w-full md:w-auto text-lg flex items-center justify-center gap-2">
                   <ArrowDownOnSquareIcon className="w-6 h-6"/> Simpan Semua Pengaturan
                </button>
             </div>
             <style>{`
                .input-field-sm { width: 100%; background-color: rgba(0,0,0,0.5); border: 1px solid rgba(147, 51, 234, 0.2); border-radius: 0.375rem; padding: 0.25rem 0.5rem; font-size: 0.875rem; }
                .btn-danger { padding: 0.5rem 1rem; background-color: rgba(220, 38, 38, 0.8); border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer; transition: background-color 0.2s; color: white; }
                .btn-danger:hover { background-color: rgba(220, 38, 38, 1); }
                .btn-danger-sm { background-color: rgba(220, 38, 38, 0.9); color: white; border-radius: 9999px; padding: 0.125rem; opacity: 0; transition: opacity 0.2s; }
                .group:hover .btn-danger-sm { opacity: 1; }
                .flex-item-center { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background-color: rgba(0,0,0,0.2); border-radius: 0.5rem; font-size: 0.875rem; color: #d1d5db; }
             `}</style>
        </div>
    )
}

const TransactionPanel: React.FC = () => {
    const { transactions, updateTransactionStatus } = useData();
    const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'ALL'>(TransactionStatus.PENDING);
    const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL');
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

    const filteredTransactions = useMemo(() => {
        return [...transactions]
            .sort((a, b) => b.createdAt - a.createdAt)
            .filter(tx => statusFilter === 'ALL' || tx.status === statusFilter)
            .filter(tx => typeFilter === 'ALL' || tx.type === typeFilter);
    }, [transactions, statusFilter, typeFilter]);
    
    const getStatusPill = (status: TransactionStatus) => {
        const styles: {[key in TransactionStatus]: string} = {
            [TransactionStatus.PENDING]: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
            [TransactionStatus.VERIFYING]: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
            [TransactionStatus.PAID]: 'bg-green-500/10 text-green-300 border-green-500/20',
            [TransactionStatus.REJECTED]: 'bg-red-500/10 text-red-300 border-red-500/20',
        };
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>{status}</span>;
    };
    
    return (
        <div className="glass-pane p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-purple-300">Daftar Transaksi</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 border-b border-[var(--border-color)] pb-4">
                <div className="flex gap-2 items-center"><span className="text-sm font-semibold text-slate-400">Status:</span>{Object.values(TransactionStatus).map(s => <button key={s} onClick={()=>setStatusFilter(s)} className={`px-3 py-1 text-xs rounded-full ${statusFilter === s ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}>{s}</button>)}<button onClick={()=>setStatusFilter('ALL')} className={`px-3 py-1 text-xs rounded-full ${statusFilter === 'ALL' ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}>Semua</button></div>
                <div className="flex gap-2 items-center"><span className="text-sm font-semibold text-slate-400">Tipe:</span><button onClick={()=>setTypeFilter('SELL')} className={`px-3 py-1 text-xs rounded-full ${typeFilter === 'SELL' ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}>Jual</button><button onClick={()=>setTypeFilter('BUY')} className={`px-3 py-1 text-xs rounded-full ${typeFilter === 'BUY' ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}>Beli</button><button onClick={()=>setTypeFilter('ALL')} className={`px-3 py-1 text-xs rounded-full ${typeFilter === 'ALL' ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}>Semua</button></div>
            </div>
            <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-xs text-slate-400 uppercase bg-black/20"><tr><th className="px-6 py-3">ID Transaksi</th><th className="px-6 py-3">Tipe</th><th className="px-6 py-3">Tanggal</th><th className="px-6 py-3">Jumlah Chip</th><th className="px-6 py-3">Nilai (Rp)</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Aksi</th></tr></thead>
                <tbody>{filteredTransactions.map(tx => (<tr key={tx.id} className="border-b border-slate-800 hover:bg-purple-500/5 transition-colors"><td className="px-6 py-4 font-mono text-purple-300">{tx.id}</td><td className="px-6 py-4"><span className={`font-bold ${tx.type === 'SELL' ? 'text-purple-400' : 'text-green-400'}`}>{tx.type}</span></td><td className="px-6 py-4">{new Date(tx.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</td><td className="px-6 py-4 font-semibold">{formatChipAmount(tx.chipAmount)}</td><td className="px-6 py-4 text-green-400 font-semibold">{new Intl.NumberFormat('id-ID').format(tx.moneyValue)}</td><td className="px-6 py-4">{getStatusPill(tx.status)}</td><td className="px-6 py-4 text-right"><button onClick={() => setSelectedTx(tx)} className="font-medium bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 px-3 py-1 rounded-md transition">Detail</button></td></tr>))}</tbody>
            </table>{filteredTransactions.length === 0 && <p className="text-center py-8 text-slate-500">Tidak ada transaksi yang cocok.</p>}</div>
            {selectedTx && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setSelectedTx(null)}>
                    <div className="glass-pane rounded-2xl w-full max-w-2xl p-6 space-y-4 animate-slide-in-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start"><h3 className="text-xl font-bold text-purple-300">Detail Transaksi <span className="font-mono text-yellow-400">{selectedTx.id}</span></h3><button onClick={() => setSelectedTx(null)} className="text-slate-500 hover:text-white transition-colors text-2xl">&times;</button></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><h4 className="font-semibold text-slate-300 border-b border-slate-700 pb-2 mb-4">Bukti Transfer</h4><a href={selectedTx.proofImage} target="_blank" rel="noopener noreferrer"><img src={selectedTx.proofImage} alt="Bukti" className="rounded-lg w-full border-2 border-slate-700 hover:border-purple-500 transition-colors" /></a></div>
                            <div><h4 className="font-semibold text-slate-300 border-b border-slate-700 pb-2 mb-4">Info Transaksi</h4><div className="text-sm space-y-2">
                                    {selectedTx.type === 'SELL' ? (
                                        [
                                            {label: "Metode Bayar", value: selectedTx.paymentDetails?.method},
                                            {label: "Provider", value: selectedTx.paymentDetails?.provider},
                                            {label: "No. Akun", value: selectedTx.paymentDetails?.accountNumber},
                                            {label: "Atas Nama", value: selectedTx.paymentDetails?.accountName},
                                            {label: "ID Pengirim", value: selectedTx.destinationId || '-'},
                                            {label: "Promo", value: selectedTx.promoCodeUsed || '-'}
                                        ].map(item => <div key={item.label}><strong className="text-slate-400 w-28 inline-block">{item.label}</strong>: {item.value}</div>)
                                    ) : (
                                        [
                                            {label: "Paket Dibeli", value: selectedTx.chipPackage?.name},
                                            {label: "ID Tujuan", value: selectedTx.destinationId || '-'},
                                            {label: "Promo", value: selectedTx.promoCodeUsed || '-'}
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
    )
}

const ChatPanel: React.FC = () => {
    const { chatLogs, sendAdminChatMessage } = useData();
    const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
    const [reply, setReply] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chatSessions = useMemo(() => {
        return Object.entries(chatLogs)
            .map(([gameId, messages]) => ({
                gameId,
                lastMessage: messages[messages.length - 1]
            }))
            .sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
    }, [chatLogs]);

    useEffect(() => {
        if (!selectedGameId && chatSessions.length > 0) {
            setSelectedGameId(chatSessions[0].gameId);
        }
    }, [chatSessions, selectedGameId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatLogs, selectedGameId]);

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (reply.trim() && selectedGameId) {
            sendAdminChatMessage(selectedGameId, reply.trim());
            setReply("");
        }
    };
    
    const MessageBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
        const isAgent = msg.sender === 'agent';
        return (
            <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-2.5 ${isAgent ? 'bg-purple-600 text-white rounded-br-lg' : 'bg-slate-700 text-slate-200 rounded-bl-lg'}`}>
                    <p className="text-sm">{msg.text}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="glass-pane rounded-2xl flex h-[75vh]">
            <div className="w-1/3 border-r border-[var(--border-color)] flex flex-col">
                <h2 className="text-xl font-bold p-4 border-b border-[var(--border-color)] text-purple-300">Sesi Chat</h2>
                <div className="flex-1 overflow-y-auto">
                    {chatSessions.map(({ gameId, lastMessage }) => (
                        <button 
                            key={gameId} 
                            onClick={() => setSelectedGameId(gameId)}
                            className={`w-full text-left p-4 border-b border-slate-800 transition-colors ${selectedGameId === gameId ? 'bg-purple-500/10' : 'hover:bg-purple-500/5'}`}
                        >
                            <p className="font-bold text-white truncate">{gameId}</p>
                            <p className="text-xs text-slate-400 truncate mt-1">{lastMessage.text}</p>
                        </button>
                    ))}
                    {chatSessions.length === 0 && <p className="text-center text-sm text-slate-500 p-4">Belum ada sesi chat.</p>}
                </div>
            </div>
            <div className="w-2/3 flex flex-col">
                {selectedGameId && chatLogs[selectedGameId] ? (
                    <>
                        <div className="p-4 border-b border-[var(--border-color)]">
                            <h3 className="font-bold text-lg text-white">Percakapan dengan: <span className="font-mono text-yellow-300">{selectedGameId}</span></h3>
                        </div>
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {chatLogs[selectedGameId].map(msg => <MessageBubble key={msg.id} msg={msg} />)}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleReply} className="p-3 bg-black/30 border-t border-[var(--border-color)]">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    placeholder="Ketik balasan..."
                                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                />
                                <button type="submit" className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:bg-slate-600" disabled={!reply.trim()}>
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
                        <ChatBubbleLeftRightIcon className="w-16 h-16 text-slate-700" />
                        <h3 className="mt-4 text-lg font-bold text-slate-400">Pilih Sesi Chat</h3>
                        <p className="text-sm text-slate-500">Pilih sebuah sesi dari daftar di sebelah kiri untuk melihat percakapan.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AnimatedNumber: React.FC<{ value: number; isCurrency?: boolean }> = ({ value, isCurrency = false }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    let start = 0;
                    const end = value;
                    if (end === 0) { setDisplayValue(0); return; }
                    const duration = 1500;
                    const increment = end / (duration / 15);
                    
                    const counter = setInterval(() => {
                        start += increment;
                        if (start >= end) {
                            start = end;
                            clearInterval(counter);
                        }
                        setDisplayValue(start);
                    }, 15);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if(ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [value]);
    
    const formattedValue = isCurrency 
        ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits:0 }).format(displayValue)
        : Math.round(displayValue).toLocaleString('id-ID');

    return <span ref={ref}>{formattedValue}</span>;
};

const TransactionChart: React.FC = () => {
    const { transactions } = useData();
    const data = useMemo(() => {
        const last7Days = Array(7).fill(0).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return {
                label: d.toLocaleDateString('id-ID', { weekday: 'short' }),
                buy: 0,
                sell: 0,
                date: d.setHours(0,0,0,0)
            };
        }).reverse();

        transactions.forEach(tx => {
            if (tx.status !== TransactionStatus.PAID) return;
            const txDate = new Date(tx.createdAt).setHours(0,0,0,0);
            const dayData = last7Days.find(d => d.date === txDate);
            if (dayData) {
                if (tx.type === 'BUY') dayData.buy += tx.moneyValue;
                else dayData.sell += tx.moneyValue;
            }
        });
        return last7Days;
    }, [transactions]);
    
    const maxVal = Math.max(...data.map(d => Math.max(d.buy, d.sell)), 1); // Avoid division by zero

    return (
        <div className="glass-pane p-6 rounded-2xl col-span-1 lg:col-span-2">
            <h3 className="text-lg font-bold text-purple-300 mb-4">Volume Transaksi (7 Hari Terakhir)</h3>
            <div className="flex justify-between items-end h-64 gap-2">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1 group">
                         <div className="relative w-full h-full flex items-end justify-center gap-1">
                            <div className="w-1/2 bg-green-500/20 rounded-t-md hover:bg-green-500/40 transition-colors" style={{ height: `${(d.buy / maxVal) * 100}%` }}/>
                            <div className="w-1/2 bg-purple-500/20 rounded-t-md hover:bg-purple-500/40 transition-colors" style={{ height: `${(d.sell / maxVal) * 100}%` }}/>
                             <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 p-2 rounded-lg text-xs w-max pointer-events-none shadow-lg z-10">
                                 <p className="text-green-400 font-bold">Beli: {new Intl.NumberFormat('id-ID').format(d.buy)}</p>
                                 <p className="text-purple-400 font-bold">Jual: {new Intl.NumberFormat('id-ID').format(d.sell)}</p>
                             </div>
                         </div>
                        <span className="text-xs text-slate-400">{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TransactionPieChart: React.FC = () => {
    const { transactions } = useData();
    const data = useMemo(() => {
        const buyCount = transactions.filter(t => t.type === 'BUY').length;
        const sellCount = transactions.filter(t => t.type === 'SELL').length;
        const total = buyCount + sellCount;
        return {
            buy: { count: buyCount, percent: total > 0 ? (buyCount / total) * 100 : 0 },
            sell: { count: sellCount, percent: total > 0 ? (sellCount / total) * 100 : 0 },
        };
    }, [transactions]);

    const buyAngle = data.buy.percent * 3.6;

    return (
        <div className="glass-pane p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-purple-300 mb-4">Rasio Tipe Transaksi</h3>
            <div className="flex justify-center items-center">
                 <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90">
                    <circle cx="50" cy="50" r="45" fill="transparent" strokeWidth="10" className="text-purple-500/30" stroke="currentColor"/>
                    <circle cx="50" cy="50" r="45" fill="transparent" strokeWidth="10" className="text-green-500/70" stroke="currentColor" strokeDasharray={`${buyAngle} 360`} />
                </svg>
            </div>
            <div className="mt-4 flex justify-center gap-6 text-sm">
                <div className="text-center"><p className="font-bold text-green-400">{data.buy.count} Beli</p><p className="text-xs text-slate-400">{data.buy.percent.toFixed(1)}%</p></div>
                <div className="text-center"><p className="font-bold text-purple-400">{data.sell.count} Jual</p><p className="text-xs text-slate-400">{data.sell.percent.toFixed(1)}%</p></div>
            </div>
        </div>
    );
};

const TopSpenders: React.FC = () => {
    const { transactions } = useData();
    const topSpenders = useMemo(() => {
        const spenders: { [key: string]: number } = {};
        transactions.filter(t => t.type === 'BUY' && t.status === TransactionStatus.PAID)
            .forEach(t => {
                spenders[t.destinationId] = (spenders[t.destinationId] || 0) + t.moneyValue;
            });
        return Object.entries(spenders).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [transactions]);

    return (
        <div className="glass-pane p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-purple-300 mb-4">Top Spenders</h3>
            <div className="space-y-3">
                {topSpenders.map(([id, amount], i) => (
                    <div key={id} className="flex justify-between items-center text-sm bg-black/20 p-2 rounded-md">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-500 w-6 text-center">{i+1}</span>
                            <span className="font-mono text-slate-300">{id}</span>
                        </div>
                        <span className="font-bold text-green-400">{new Intl.NumberFormat('id-ID').format(amount)}</span>
                    </div>
                ))}
                 {topSpenders.length === 0 && <p className="text-slate-500 text-center py-4">Belum ada data.</p>}
            </div>
        </div>
    );
}

const SummaryCard: React.FC<{icon: React.ReactNode, title: string, value: number, isCurrency?: boolean, suffix?: string, color: string}> = ({icon, title, value, isCurrency, suffix, color}) => (
    <div className="glass-pane p-5 rounded-xl flex items-center gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10">
        <div className={`p-3 rounded-full bg-slate-900/50 ${color}`}>{icon}</div>
        <div>
            <h3 className="text-sm font-medium text-slate-400">{title}</h3>
            <div className={`text-2xl font-bold ${color} mt-1`}>{suffix ? suffix : <AnimatedNumber value={value} isCurrency={isCurrency} />}</div>
        </div>
    </div>
);


const AdminPanel: React.FC = () => {
    const { transactions, settings, updateSettings, updatePin, showToast, addPromoCode, updatePromoCode, deletePromoCode, testTelegramNotification } = useData();
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [localSettings, setLocalSettings] = useState<AdminSettings>(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleSaveSettings = () => {
        updateSettings(localSettings);
        showToast('Pengaturan berhasil disimpan!', 'success');
    };
    
    const handlePinChange = (pin: string) => {
        if(updatePin(pin)) {
            setLocalSettings(prev => ({...prev, adminPin: pin}));
        }
    }
    
    const handlePinReset = () => {
        if (window.confirm(`Anda yakin ingin mereset PIN ke default (${DEFAULT_ADMIN_PIN})?`)) {
            updatePin(DEFAULT_ADMIN_PIN);
            setLocalSettings(prev => ({...prev, adminPin: DEFAULT_ADMIN_PIN}));
            showToast("PIN telah direset ke default.", "success");
        }
    }
    
     const handleAddPromoCode = (codeData: Omit<PromoCode, 'id' | 'currentUses' | 'createdAt' | 'isActive'>) => {
        addPromoCode(codeData); // The context now handles state updates
    };

    const handleUpdatePromoCode = (id: string, updates: Partial<PromoCode>) => {
        updatePromoCode(id, updates); // The context now handles state updates
    };
    
    const handleDeletePromoCode = (id: string) => {
        if(window.confirm("Yakin ingin menghapus kode promo ini?")) {
            deletePromoCode(id); // The context now handles state updates
        }
    };

    const summaryStats = useMemo(() => {
        const paidTransactions = transactions.filter(t => t.status === TransactionStatus.PAID);
        const completedWithTimes = paidTransactions.filter(t => t.createdAt && t.paidAt);

        const totalProcessingTime = completedWithTimes.reduce((sum, tx) => sum + (tx.paidAt! - tx.createdAt), 0);
        const avgProcessingTime = completedWithTimes.length > 0 ? totalProcessingTime / completedWithTimes.length : 0;
        
        const formatDuration = (ms: number) => {
            if (ms <= 0) return 'N/A';
            const seconds = Math.floor((ms / 1000) % 60);
            const minutes = Math.floor((ms / (1000 * 60)) % 60);
            const hours = Math.floor((ms / (1000 * 60 * 60)));
            if (hours > 0) return `${hours}j ${minutes}m`;
            if (minutes > 0) return `${minutes}m ${seconds}d`;
            return `${seconds}d`;
        };

        return {
            totalRevenue: paidTransactions.filter(t => t.type === 'BUY').reduce((sum, tx) => sum + tx.moneyValue, 0),
            totalPayout: paidTransactions.filter(t => t.type === 'SELL').reduce((sum, tx) => sum + tx.moneyValue, 0),
            completedToday: transactions.filter(t => t.paidAt && (Date.now() - t.paidAt < 24 * 60 * 60 * 1000)).length,
            avgProcessingTimeFormatted: formatDuration(avgProcessingTime),
        };
    }, [transactions]);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                     <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <SummaryCard icon={<CurrencyDollarIcon className="w-7 h-7"/>} title="Total Pendapatan (Beli)" value={summaryStats.totalRevenue} isCurrency color="text-green-400" />
                            <SummaryCard icon={<BanknotesIcon className="w-7 h-7"/>} title="Total Pembayaran (Jual)" value={summaryStats.totalPayout} isCurrency color="text-yellow-400" />
                            <SummaryCard icon={<CalendarDaysIcon className="w-7 h-7"/>} title="Transaksi Selesai Hari Ini" value={summaryStats.completedToday} color="text-blue-400" />
                            <SummaryCard icon={<ClockIcon className="w-7 h-7"/>} title="Waktu Proses Rata-Rata" value={0} suffix={summaryStats.avgProcessingTimeFormatted} color="text-purple-400" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <TransactionChart />
                            <TransactionPieChart />
                        </div>
                        <TopSpenders />
                    </div>
                );
            case 'transactions':
                return <TransactionPanel />;
            case 'chat':
                return <ChatPanel />;
            case 'settings':
                return <SettingsPanel 
                    localSettings={localSettings} 
                    onSettingsChange={setLocalSettings} 
                    onSave={handleSaveSettings} 
                    onPinChange={handlePinChange} 
                    onPinReset={handlePinReset}
                    onAddPromoCode={handleAddPromoCode}
                    onUpdatePromoCode={handleUpdatePromoCode}
                    onDeletePromoCode={handleDeletePromoCode}
                    onTestTelegram={testTelegramNotification}
                />;
            default:
                return null;
        }
    }

    const NavButton: React.FC<{tab: AdminTab; icon: React.ReactNode; label: string}> = ({tab, icon, label}) => (
        <button onClick={() => setActiveTab(tab)} className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === tab ? 'text-white' : 'text-slate-300 hover:bg-purple-500/10 hover:text-white'}`}>
            {activeTab === tab && <div className="absolute inset-0 bg-purple-600 rounded-lg shadow-[0_0_15px_var(--primary-glow)] -z-10 animate-fade-in" style={{animationDuration: '0.3s'}}></div>}
            {icon}
            {label}
        </button>
    );

    return (
        <div className="space-y-8 animate-slide-in-up">
            <div className="glass-pane p-2 rounded-xl flex flex-wrap gap-2">
                <NavButton tab="dashboard" icon={<ChartBarIcon className="w-5 h-5"/>} label="Dashboard" />
                <NavButton tab="transactions" icon={<BuildingLibraryIcon className="w-5 h-5"/>} label="Transaksi" />
                <NavButton tab="chat" icon={<ChatBubbleLeftRightIcon className="w-5 h-5"/>} label="Live Chat" />
                <NavButton tab="settings" icon={<Cog6ToothIcon className="w-5 h-5"/>} label="Super Settings" />
            </div>
            {renderContent()}
        </div>
    );
};

export default AdminPanel;
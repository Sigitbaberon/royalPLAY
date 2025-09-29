
import React, { useState, useCallback, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { CHIP_UNIT, INDONESIAN_BANKS, INDONESIAN_EWALLETS, parseChipInput, formatChipAmount } from '../constants';
import { PhotoIcon, BanknotesIcon, UserCircleIcon, PaperAirplaneIcon, ClipboardDocumentIcon, CheckIcon, CreditCardIcon, WalletIcon, ArrowLeftIcon, ArrowRightIcon, SparklesIcon, TicketIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { PaymentMethod, PaymentDetails, PromoCode } from '../types';

interface UserFormProps {
    onComplete: (transactionId: string) => void;
}

const UserForm: React.FC<UserFormProps> = ({ onComplete }) => {
    const { settings, addTransaction, showToast, validatePromoCode } = useData();
    const [step, setStep] = useState(1);
    
    const [chipInput, setChipInput] = useState<string>('');
    const [senderId, setSenderId] = useState<string>(''); // User's game ID
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank');
    const [paymentProvider, setPaymentProvider] = useState<string>(INDONESIAN_BANKS[0]);
    const [accountNumber, setAccountNumber] = useState<string>('');
    const [accountName, setAccountName] = useState<string>('');
    const [proofImage, setProofImage] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    
    const [promoCodeInput, setPromoCodeInput] = useState("");
    const [appliedPromo, setAppliedPromo] = useState<{ promo: PromoCode; message: string; } | null>(null);

    const parsedChipAmount = useMemo(() => parseChipInput(chipInput), [chipInput]);
    
    const moneyValue = useMemo(() => {
        if (!parsedChipAmount) return 0;
        const baseValue = (parsedChipAmount / CHIP_UNIT) * settings.exchangeRate;
        let finalValue = baseValue;

        // Apply Promo Bonus
        if (appliedPromo) {
             finalValue += baseValue * (appliedPromo.promo.discountPercent / 100);
        }
        
        return finalValue;
    }, [parsedChipAmount, settings.exchangeRate, appliedPromo]);
    
    const handleApplyPromo = () => {
        if (!promoCodeInput) { showToast("Masukkan kode promo.", "error"); return; }
        const result = validatePromoCode(promoCodeInput, 'SELL', senderId);
        if (result.isValid) {
            setAppliedPromo({ promo: result.promo!, message: result.message });
            showToast(result.message, "success");
        } else {
            setAppliedPromo(null);
            showToast(result.message, "error");
        }
    };
    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoCodeInput("");
        showToast("Kode promo dihapus.", "info");
    }

    const paymentProviders = useMemo(() => paymentMethod === 'Bank' ? INDONESIAN_BANKS : INDONESIAN_EWALLETS, [paymentMethod]);

    React.useEffect(() => { setPaymentProvider(paymentProviders[0]); }, [paymentMethod, paymentProviders]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { showToast('Ukuran file maksimal 5MB.', 'error'); return; }
            const reader = new FileReader();
            reader.onloadend = () => { setProofImage(reader.result as string); setFileName(file.name); };
            reader.onerror = () => showToast('Gagal membaca file.', 'error');
            reader.readAsDataURL(file);
        }
    }, [showToast]);
    
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(settings.adminGameId).then(() => {
            setIsCopied(true);
            showToast('ID Tujuan berhasil disalin!', 'success');
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, [settings.adminGameId, showToast]);

    const nextStep = () => {
        if (step === 1 && (parsedChipAmount <= 0 || !senderId)) {
            showToast('Lengkapi ID Pengirim dan jumlah chip.', 'error'); return;
        }
        if (step === 2 && (!accountNumber || !accountName)) {
            showToast('Lengkapi detail pembayaran Anda.', 'error'); return;
        }
        setStep(s => Math.min(s + 1, 4));
    };
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = useCallback(async () => {
        if (!proofImage) { showToast('Unggah bukti pengiriman chip.', 'error'); return; }
        const paymentDetails: PaymentDetails = { method: paymentMethod, provider: paymentProvider, accountNumber, accountName };
        setIsLoading(true);
        try {
            const transactionId = await addTransaction({ type: 'SELL', data: { chipAmount: parsedChipAmount, paymentDetails, destinationId: senderId, proofImage, moneyValue, promoCodeUsed: appliedPromo?.promo.code }});
            showToast('Transaksi penjualan berhasil dikirim!', 'success');
            onComplete(transactionId);
        } catch (e) {
            showToast('Gagal memproses transaksi.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [proofImage, paymentMethod, paymentProvider, accountNumber, accountName, addTransaction, onComplete, parsedChipAmount, senderId, showToast, moneyValue, appliedPromo]);

    const renderStepContent = () => {
        const commonInputClass = "w-full pl-10 pr-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-white placeholder:text-slate-500";
        switch(step) {
            case 1:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-semibold text-center text-purple-300">Langkah 1: Detail Penjualan</h3>
                        <div><label className="block text-sm font-medium text-slate-400 mb-2">ID Pengirim (Akun Anda)</label><div className="relative"><UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" /><input type="text" value={senderId} onChange={(e) => setSenderId(e.target.value)} placeholder="Masukkan ID Game Anda" className={commonInputClass} /></div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Jumlah Chip Dijual</label>
                            <div className="relative"><BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" /><input type="text" value={chipInput} onChange={(e) => setChipInput(e.target.value)} placeholder="Contoh: 1B atau 500M" className={commonInputClass} /></div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Kode Promo (Opsional)</label>
                            <div className="flex gap-2">
                                <div className="relative flex-grow"><TicketIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" /><input type="text" value={promoCodeInput} onChange={(e) => setPromoCodeInput(e.target.value)} placeholder="Masukkan kode" className={commonInputClass} disabled={!!appliedPromo} /></div>
                                {!appliedPromo ? ( <button onClick={handleApplyPromo} className="px-4 bg-amber-600/80 hover:bg-amber-600 rounded-lg font-semibold text-sm transition">Terapkan</button>)
                                : ( <button onClick={handleRemovePromo} className="p-2 bg-red-600/80 hover:bg-red-600 rounded-full font-semibold text-sm transition"><XCircleIcon className="w-6 h-6"/></button>)}
                            </div>
                            {appliedPromo && <p className="text-xs text-green-400 mt-2 font-semibold">Bonus +{appliedPromo.promo.discountPercent}% diterapkan!</p>}
                        </div>
                        <div className="bg-gradient-to-tr from-green-500/10 to-transparent p-4 rounded-lg text-center">
                            <p className="text-slate-400 text-sm">Estimasi Diterima:</p>
                            <p className="text-3xl font-bold text-green-400">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(moneyValue)}</p>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-semibold text-center text-purple-300">Langkah 2: Tujuan Pembayaran</h3>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-black/30 rounded-lg"><button type="button" onClick={() => setPaymentMethod('Bank')} className={`py-2 px-4 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-all ${paymentMethod === 'Bank' ? 'bg-purple-600 text-white shadow-[0_0_10px_theme(colors.purple.500)]' : 'hover:bg-purple-500/10'}`}> <CreditCardIcon className="h-4 w-4" /> Bank</button><button type="button" onClick={() => setPaymentMethod('E-Wallet')} className={`py-2 px-4 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-all ${paymentMethod === 'E-Wallet' ? 'bg-purple-600 text-white shadow-[0_0_10px_theme(colors.purple.500)]' : 'hover:bg-purple-500/10'}`}> <WalletIcon className="h-4 w-4" /> E-Wallet</button></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div><label className="block text-xs text-slate-400 mb-1">{paymentMethod === 'Bank' ? 'Pilih Bank' : 'Pilih E-Wallet'}</label><select value={paymentProvider} onChange={e => setPaymentProvider(e.target.value)} className={commonInputClass.replace('pl-10', 'pl-3')}><option disabled>Pilih</option>{paymentProviders.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                             <div><label className="block text-xs text-slate-400 mb-1">{paymentMethod === 'Bank' ? 'Nomor Rekening' : 'Nomor HP'}</label><input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder={paymentMethod === 'Bank' ? 'Cth: 1234567890' : 'Cth: 081234567890'} className={commonInputClass.replace('pl-10', 'pl-3')} /></div>
                             <div className="sm:col-span-2"><label className="block text-xs text-slate-400 mb-1">Nama Pemilik Akun</label><input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Sesuai buku tabungan" className={commonInputClass.replace('pl-10', 'pl-3')} /></div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-semibold text-center text-purple-300">Langkah 3: Unggah Bukti</h3>
                        <div className="p-4 bg-black/30 border border-purple-500/30 rounded-lg"><label className="block text-sm text-slate-300 mb-2">Kirim chip ke ID Tujuan berikut:</label><div className="flex items-center gap-2 p-3 bg-black/50 border border-slate-700 rounded-lg"><span className="flex-grow text-xl font-mono text-amber-400 tracking-widest">{settings.adminGameId}</span><button type="button" onClick={handleCopy} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${isCopied ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'}`}>{isCopied ? <><CheckIcon className="h-4 w-4" /> Disalin!</> : <><ClipboardDocumentIcon className="h-4 w-4" /> Salin</>}</button></div></div>
                        <div><label className="block text-sm text-slate-300 mb-2">Unggah Bukti Kirim (Screenshot)</label><label htmlFor="proof-upload" className="flex flex-col items-center justify-center w-full px-4 py-10 bg-black/30 border-2 border-dashed border-purple-500/30 rounded-lg cursor-pointer hover:bg-purple-500/10 hover:border-purple-500 transition-all"><PhotoIcon className="h-10 w-10 text-slate-600" /><p className="mt-2 text-sm text-slate-400">{fileName || 'Klik untuk memilih file'}</p><p className="text-xs text-slate-500">PNG, JPG (Max 5MB)</p></label><input id="proof-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} /></div>
                    </div>
                );
            case 4:
                return (
                    <div className="animate-fade-in"><h3 className="text-xl font-semibold text-center text-purple-300">Langkah 4: Konfirmasi</h3><div className="mt-6 p-4 space-y-3 bg-black/30 rounded-lg border border-purple-500/30 text-sm"><div className="flex justify-between"><span className="text-slate-400">Jumlah Chip Dijual:</span> <span className="font-bold text-white">{formatChipAmount(parsedChipAmount)}</span></div><div className="flex justify-between"><span className="text-slate-400">ID Pengirim:</span> <span className="font-mono text-white">{senderId || "-"}</span></div><div className="flex justify-between border-t border-slate-800 pt-3 mt-3"><span className="text-slate-400">Dibayarkan Ke:</span> <span className="font-bold text-white">{paymentProvider}</span></div><div className="flex justify-between"><span className="text-slate-400">No. Akun:</span> <span className="font-mono text-white">{accountNumber}</span></div><div className="flex justify-between"><span className="text-slate-400">Atas Nama:</span> <span className="font-bold text-white">{accountName}</span></div>{appliedPromo && <div className="flex justify-between"><span className="text-slate-400">Promo Digunakan:</span> <span className="font-bold text-green-400">{appliedPromo.promo.code} (+{appliedPromo.promo.discountPercent}%)</span></div>}<div className="flex justify-between text-lg border-t border-slate-800 pt-3 mt-3"><span className="text-green-400">Estimasi Diterima:</span> <span className="font-bold text-green-400">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(moneyValue)}</span></div></div><p className="text-xs text-center text-slate-500 mt-4">Pastikan semua data sudah benar. Transaksi tidak dapat dibatalkan.</p></div>
                );
            default: return null;
        }
    }

    return (
        <div className="glass-pane p-8 rounded-2xl max-w-lg mx-auto animate-fade-in-up">
            <div className="mb-6 flex items-center justify-between px-4">
                {[1, 2, 3, 4].map(num => (
                    <React.Fragment key={num}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 relative ${step >= num ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                            {num}
                            {step >= num && <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping -z-10 opacity-75"></div>}
                        </div>
                        {num < 4 && <div className={`flex-1 h-1 mx-2 transition-all duration-500 ${step > num ? 'bg-purple-500' : 'bg-slate-700'}`}></div>}
                    </React.Fragment>
                ))}
            </div>
            
            <div className="min-h-[420px]">{renderStepContent()}</div>

            <div className="mt-8 flex gap-4">
                {step > 1 && <button type="button" onClick={prevStep} className="w-1/3 flex justify-center items-center gap-2 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg shadow-lg transition-all"><ArrowLeftIcon className="h-5 w-5" /> Kembali</button>}
                {step < 4 ? <button type="button" onClick={nextStep} className="btn-shimmer flex-1 flex justify-center items-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105">Lanjut <ArrowRightIcon className="h-5 w-5" /></button>
                : <button onClick={handleSubmit} disabled={isLoading} className="btn-shimmer flex-1 flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg shadow-lg disabled:bg-slate-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 relative overflow-hidden group">
                    {isLoading ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>Mengirim...</>) 
                    : (<><PaperAirplaneIcon className="h-5 w-5" /> Kirim & Proses Transaksi</>)}
                     <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
                    </button>}
            </div>
        </div>
    );
};

export default UserForm;

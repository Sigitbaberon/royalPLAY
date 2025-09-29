import React, { useState, useCallback, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { CHIP_PACKAGES, formatChipAmount, CHIP_UNIT } from '../constants';
import { PhotoIcon, UserCircleIcon, PaperAirplaneIcon, ClipboardDocumentIcon, CheckIcon, ArrowLeftIcon, ArrowRightIcon, ShoppingCartIcon, SparklesIcon, ExclamationTriangleIcon, ArrowDownTrayIcon, XMarkIcon, TicketIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { ChipPackage, PromoCode } from '../types';

interface BuyChipViewProps {
    onComplete: (transactionId: string) => void;
    onBackToSelection?: () => void;
}

const StepIndicator: React.FC<{ step: number; labels: string[] }> = ({ step, labels }) => {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {labels.map((label, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = step > stepNumber;
                    const isCurrent = step === stepNumber;
                    return (
                        <li key={label} className={`relative ${index !== labels.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                            {isCompleted ? (
                                <>
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="h-0.5 w-full bg-green-500" />
                                    </div>
                                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                                        <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                                    </div>
                                </>
                            ) : isCurrent ? (
                                <>
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="h-0.5 w-full bg-slate-700" />
                                    </div>
                                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-green-500 bg-slate-800">
                                        <span className="h-2.5 w-2.5 rounded-full bg-green-500" aria-hidden="true" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="h-0.5 w-full bg-slate-700" />
                                    </div>
                                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-800" />
                                </>
                            )}
                             <span className={`absolute top-10 w-max -left-2 text-center text-xs mt-2 transition-colors ${isCurrent ? 'text-white font-semibold' : 'text-slate-400'}`}>{label}</span>
                        </li>
                    )
                })}
            </ol>
        </nav>
    );
};


const BuyChipView: React.FC<BuyChipViewProps> = ({ onComplete, onBackToSelection }) => {
    const { settings, addTransaction, showToast, validatePromoCode } = useData();
    const [step, setStep] = useState(1);
    
    const [selectedPackage, setSelectedPackage] = useState<ChipPackage | null>(null);
    const [destinationId, setDestinationId] = useState<string>('');
    const [proofImage, setProofImage] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [isQrisModalOpen, setQrisModalOpen] = useState(false);
    
    const [promoCodeInput, setPromoCodeInput] = useState("");
    const [appliedPromo, setAppliedPromo] = useState<{ promo: PromoCode; message: string; } | null>(null);
    
    const { bankName, accountNumber, accountName, qrisImage, paymentMethods } = settings.adminPaymentInfo;
    const adminPaymentText = `${bankName}: ${accountNumber} (a/n ${accountName})`;
    const noPaymentMethodAvailable = !paymentMethods.bankTransfer && !paymentMethods.qris;
    
    const getAdjustedPrice = useCallback((pkg: ChipPackage, promo: {promo: PromoCode} | null) => {
        const basePrice = (pkg.chipAmount / CHIP_UNIT) * settings.buyRate;
        let finalPrice = basePrice;
        
        // Apply Promo Discount
        if (promo) {
            finalPrice -= basePrice * (promo.promo.discountPercent / 100);
        }

        return finalPrice;
    }, [settings.buyRate]);

    const handleApplyPromo = () => {
        if (!promoCodeInput) { showToast("Masukkan kode promo.", "error"); return; }
        if (!destinationId) { showToast("Masukkan ID Game terlebih dahulu.", "error"); return; }
        const result = validatePromoCode(promoCodeInput, 'BUY', destinationId);
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
        navigator.clipboard.writeText(adminPaymentText).then(() => {
            setIsCopied(true);
            showToast('Info pembayaran berhasil disalin!', 'success');
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, [showToast, adminPaymentText]);

    const handleDownloadQris = useCallback(() => {
        if (!qrisImage) return;
        const link = document.createElement('a');
        link.href = qrisImage;
        link.download = `QRIS_${settings.branding.appName.replace(' ', '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Gambar QRIS berhasil diunduh.', 'success');
    }, [qrisImage, showToast, settings.branding.appName]);

    const nextStep = () => {
        if (step === 1 && (!selectedPackage || !destinationId)) {
            showToast('Pilih ID Game dan paket chip.', 'error'); return;
        }
         if (step === 2 && !proofImage) {
            showToast('Unggah bukti pembayaran Anda.', 'error'); return;
        }
        setStep(s => Math.min(s + 1, 3));
    };
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = useCallback(async () => {
        if (!proofImage || !selectedPackage || !destinationId) { showToast('Data tidak lengkap.', 'error'); return; }
        const finalPrice = getAdjustedPrice(selectedPackage, appliedPromo);
        setIsLoading(true);
        try {
            const transactionId = await addTransaction({ type: 'BUY', data: { chipAmount: selectedPackage.chipAmount, destinationId, proofImage, chipPackage: selectedPackage, moneyValue: finalPrice, promoCodeUsed: appliedPromo?.promo.code }});
            showToast('Transaksi pembelian berhasil dikirim!', 'success');
            onComplete(transactionId);
        } catch (e) {
            showToast('Gagal memproses transaksi.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [proofImage, selectedPackage, destinationId, addTransaction, onComplete, showToast, getAdjustedPrice, appliedPromo]);

    const renderStepContent = () => {
        const inputWrapperClass = "relative";
        const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none";
        const inputWithIconClass = "input-field pl-12";
        switch(step) {
            case 1:
                return (
                    <div className="animate-fade-in space-y-6">
                         <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">ID Game Tujuan (Akun Anda)</label>
                            <div className={inputWrapperClass}><UserCircleIcon className={iconClass} /><input type="text" value={destinationId} onChange={(e) => setDestinationId(e.target.value)} placeholder="Masukkan ID Game Anda" className={inputWithIconClass} /></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {CHIP_PACKAGES.map(pkg => {
                                const price = getAdjustedPrice(pkg, appliedPromo);
                                const basePrice = (pkg.chipAmount / CHIP_UNIT) * settings.buyRate;
                                const hasDiscount = price < basePrice;
                                return (
                                <button key={pkg.id} onClick={() => setSelectedPackage(pkg)} className={`relative p-4 rounded-lg text-center border-2 transition-all transform hover:scale-105 ${selectedPackage?.id === pkg.id ? 'border-green-400 bg-green-500/10 shadow-[0_0_15px_rgba(74,222,128,0.5)]' : 'border-slate-700 hover:border-slate-500 bg-black/20'}`}>
                                    {hasDiscount && <div className="absolute top-0 right-0 text-xs bg-red-600 text-white font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-md">DISKON</div>}
                                    <div dangerouslySetInnerHTML={{ __html: pkg.icon }} />
                                    <p className="font-bold text-lg text-white mt-2">{pkg.name}</p>
                                    <p className="text-sm text-yellow-400">{formatChipAmount(pkg.chipAmount)}</p>
                                    <p className="text-xs text-slate-400 mt-1">{hasDiscount && <span className="line-through mr-1">{new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR', minimumFractionDigits: 0}).format(basePrice)}</span>}{new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR', minimumFractionDigits: 0}).format(price)}</p>
                                </button>
                            )})}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Kode Promo (Opsional)</label>
                            <div className="flex gap-2">
                                <div className={`${inputWrapperClass} flex-grow`}><TicketIcon className={iconClass} /><input type="text" value={promoCodeInput} onChange={(e) => setPromoCodeInput(e.target.value)} placeholder="Masukkan kode" className={inputWithIconClass} disabled={!!appliedPromo} /></div>
                                {!appliedPromo ? ( <button onClick={handleApplyPromo} className="btn-secondary">Terapkan</button>)
                                : ( <button onClick={handleRemovePromo} className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg transition text-red-400"><XCircleIcon className="w-6 h-6"/></button>)}
                            </div>
                            {appliedPromo && <p className="text-sm text-green-400 mt-2 font-semibold flex items-center gap-1"><SparklesIcon className="w-4 h-4" /> Diskon {appliedPromo.promo.discountPercent}% diterapkan!</p>}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-fade-in">
                        { noPaymentMethodAvailable ? (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                                <ExclamationTriangleIcon className="w-10 h-10 mx-auto text-yellow-400" />
                                <h4 className="font-bold text-yellow-300 mt-2">Metode Pembayaran Tidak Tersedia</h4>
                                <p className="text-sm text-slate-400 mt-1">Saat ini tidak ada metode pembayaran yang aktif. Silakan hubungi admin untuk informasi lebih lanjut.</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-black/30 border border-green-500/30 rounded-lg">
                                <label className="block text-sm text-slate-300 mb-2">Lakukan pembayaran ke salah satu tujuan berikut:</label>
                                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                                    {paymentMethods.qris && qrisImage && (
                                        <button onClick={() => setQrisModalOpen(true)} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                                            <img src={qrisImage} alt="QRIS" className="w-32 h-32 rounded-lg border-2 border-slate-600"/>
                                            <span className="text-xs text-slate-400">Klik untuk memperbesar</span>
                                        </button>
                                    )}
                                    {paymentMethods.bankTransfer && (
                                        <div className="flex-grow w-full">
                                            <div className="flex items-center gap-2 p-3 bg-black/50 border border-slate-700 rounded-lg">
                                                <p className="flex-grow text-sm font-mono text-yellow-400 whitespace-pre-wrap">{adminPaymentText}</p>
                                                <button type="button" onClick={handleCopy} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${isCopied ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'}`}>{isCopied ? <><CheckIcon className="h-4 w-4" /> Disalin!</> : <><ClipboardDocumentIcon className="h-4 w-4" /> Salin</>}</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {!noPaymentMethodAvailable && <div><label className="block text-sm text-slate-300 mb-2">Unggah Bukti Pembayaran (Screenshot)</label><label htmlFor="proof-upload" className="flex flex-col items-center justify-center w-full px-4 py-10 bg-black/30 border-2 border-dashed border-green-500/30 rounded-lg cursor-pointer hover:bg-green-500/10 hover:border-green-500 transition-all"><PhotoIcon className="h-10 w-10 text-slate-600" /><p className="mt-2 text-sm text-slate-400">{fileName || 'Klik untuk memilih file'}</p><p className="text-xs text-slate-500">PNG, JPG (Max 5MB)</p></label><input id="proof-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} /></div>}
                    </div>
                );
            case 3:
                const finalPrice = selectedPackage ? getAdjustedPrice(selectedPackage, appliedPromo) : 0;
                return (
                    <div className="animate-fade-in space-y-6">
                        <h3 className="text-xl text-white font-bold text-center">Ringkasan Transaksi</h3>
                        <div className="p-6 space-y-4 bg-black/30 rounded-lg border border-green-500/30 text-base">
                            <div className="flex justify-between items-center"><span className="text-slate-400">Paket Chip:</span> <span className="font-bold text-white text-lg">{selectedPackage?.name}</span></div>
                            <div className="flex justify-between items-center"><span className="text-slate-400">Jumlah Chip:</span> <span className="font-bold text-white text-lg">{formatChipAmount(selectedPackage?.chipAmount || 0)}</span></div>
                            <hr className="border-slate-800 my-3"/>
                            <div className="flex justify-between items-center"><span className="text-slate-400">ID Tujuan:</span> <span className="font-mono text-white">{destinationId}</span></div>
                            {appliedPromo && <div className="flex justify-between items-center"><span className="text-slate-400 flex items-center gap-1"><SparklesIcon className="w-4 h-4 text-yellow-400"/>Promo:</span> <span className="font-bold text-green-400">{appliedPromo.promo.code} (-{appliedPromo.promo.discountPercent}%)</span></div>}
                             <div className="flex justify-between items-center text-xl border-t-2 border-dashed border-slate-700 pt-4 mt-4">
                                <span className="text-green-300 font-semibold">Total Bayar:</span>
                                <span className="font-bold text-green-300 tracking-tight">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(finalPrice)}</span>
                            </div>
                        </div>
                        <p className="text-xs text-center text-slate-500 mt-4">Pastikan ID tujuan sudah benar. Kesalahan input bukan tanggung jawab kami.</p>
                    </div>
                );
            default: return null;
        }
    }
    
    return (
        <>
            <div className="glass-pane p-8 rounded-2xl max-w-2xl mx-auto animate-slide-in-up relative">
                 {onBackToSelection && step === 1 && (
                    <button 
                        onClick={onBackToSelection} 
                        className="absolute top-6 left-6 flex items-center gap-1 text-sm text-green-400 hover:text-white transition-colors z-10"
                        aria-label="Kembali ke pemilihan"
                    >
                        <ArrowLeftIcon className="h-4 w-4" /> Kembali
                    </button>
                )}
                <div className="mb-12 pt-4 flex justify-center">
                    <StepIndicator step={step} labels={['Paket', 'Bayar', 'Konfirmasi']} />
                </div>
                
                <div className="min-h-[420px]">{renderStepContent()}</div>

                <div className="mt-8 flex gap-4">
                    {step > 1 && <button type="button" onClick={prevStep} className="btn-secondary flex-1 sm:flex-none sm:w-1/3 flex justify-center items-center gap-2"><ArrowLeftIcon className="h-5 w-5" /> Kembali</button>}
                    {step < 3 ? <button type="button" onClick={nextStep} disabled={step === 2 && noPaymentMethodAvailable} className="btn-primary btn-shimmer flex-grow flex justify-center items-center gap-2 !bg-green-600">Lanjut <ArrowRightIcon className="h-5 w-5" /></button>
                    : <button onClick={handleSubmit} disabled={isLoading} className="btn-primary btn-shimmer flex-grow flex justify-center items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                        {isLoading ? 'Memproses...' : <><ShoppingCartIcon className="h-5 w-5" /> Beli & Proses</>}
                        </button>}
                </div>
            </div>
            
            {isQrisModalOpen && qrisImage && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setQrisModalOpen(false)}>
                    <div className="glass-pane rounded-2xl w-full max-w-xs p-6 space-y-4 animate-slide-in-up" onClick={e => e.stopPropagation()}>
                         <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Pindai untuk Membayar</h3>
                            <button onClick={() => setQrisModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                         </div>
                        <img src={qrisImage} alt="QRIS Code" className="w-full h-auto rounded-lg border-2 border-slate-600" />
                        <button 
                            onClick={handleDownloadQris}
                            className="btn-primary w-full flex justify-center items-center gap-2"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            Unduh QRIS
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default BuyChipView;
import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Transaction, AdminSettings, TransactionStatus, DataContextType, ToastMessage, ToastType, PaymentMethod, AddTransactionData, TransactionType, PromoCode, Partner, ChatMessage, VipTier, VipStatus, AffiliateStats, AffiliateCommission } from '../types';
import { CHIP_UNIT, INDONESIAN_BANKS, INDONESIAN_EWALLETS, anonymizeId, CHIP_PACKAGES, DEFAULT_ADMIN_PIN, formatChipAmount } from '../constants';

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper function to convert data URL to Blob for Telegram upload
const dataURLtoBlob = (dataurl: string): Blob | null => {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || mimeMatch.length < 2) return null;
    const mime = mimeMatch[1];
    try {
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    } catch (e) {
        console.error("Error decoding base64 string for Telegram:", e);
        return null;
    }
};


// Helper function for Telegram notifications
const sendTelegramNotification = async (settings: AdminSettings, transaction: Transaction) => {
    const { enabled, botToken, chatId } = settings.notifications.adminBot;
    if (!enabled || !botToken || !chatId) {
        return;
    }

    const appUrl = window.location.origin + window.location.pathname;
    const adminSecret = settings.adminPin;

    const keyboard = {
        inline_keyboard: [
            [
                { text: '✅ Verifikasi', url: `${appUrl}?tx_id=${transaction.id}&new_status=${TransactionStatus.VERIFYING}&admin_secret=${adminSecret}` },
                { text: '💰 Bayar/Kirim', url: `${appUrl}?tx_id=${transaction.id}&new_status=${TransactionStatus.PAID}&admin_secret=${adminSecret}` },
                { text: '❌ Tolak', url: `${appUrl}?tx_id=${transaction.id}&new_status=${TransactionStatus.REJECTED}&admin_secret=${adminSecret}` }
            ]
        ]
    };

    const transactionType = transaction.type === 'SELL' ? 'Penjualan' : 'Pembelian';
    let details = '';
    if (transaction.type === 'SELL' && transaction.paymentDetails) {
        details = `*Pembayaran Ke:* ${transaction.paymentDetails.provider} - ${transaction.paymentDetails.accountNumber} a/n ${transaction.paymentDetails.accountName}`;
    } else if (transaction.type === 'BUY' && transaction.chipPackage) {
        details = `*Paket:* ${transaction.chipPackage.name}`;
    }
    
    const promoCode = transaction.promoCodeUsed ? settings.promoCodes.find(p => p.id === transaction.promoCodeUsed)?.code : null;


    const message = `
*🔔 Transaksi Baru Masuk!*

*ID Transaksi:* \`${transaction.id}\`
*Tipe:* ${transactionType}
*ID User:* \`${transaction.destinationId}\`
*Jumlah Chip:* ${formatChipAmount(transaction.chipAmount)}
*Nilai Rupiah:* *Rp ${new Intl.NumberFormat('id-ID').format(transaction.moneyValue)}*
${promoCode ? `*Kode Promo:* \`${promoCode}\`` : ''}

${details}

*Pilih aksi cepat di bawah ini:*
    `.trim();

    // Try to send proof image as a photo with caption
    if (transaction.proofImage) {
        const blob = dataURLtoBlob(transaction.proofImage);
        if (blob) {
            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('photo', blob, 'proof-image.png');
            formData.append('caption', message);
            formData.append('parse_mode', 'Markdown');
            formData.append('reply_markup', JSON.stringify(keyboard));

            const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                });
                const responseData = await response.json();
                if (responseData.ok) {
                    return; // Successfully sent photo, so we're done.
                }
                console.error("Telegram API error (sendPhoto):", responseData.description);
            } catch (error) {
                console.error("Failed to send Telegram photo notification:", error);
            }
        }
    }

    // Fallback to sending a text message if no image or if photo sending failed
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            }),
        });
    } catch (error) {
        console.error("Failed to send Telegram text notification:", error);
    }
};

const defaultPartners: Partner[] = [
    { id: 'p-pragmatic', name: 'Pragmatic Play', logoUrl: null },
    { id: 'p-pgsoft', name: 'PG Soft', logoUrl: null },
    { id: 'p-joker', name: 'Joker Gaming', logoUrl: null },
    { id: 'p-google', name: 'Google', logoUrl: null },
    { id: 'p-microsoft', name: 'Microsoft', logoUrl: null },
    { id: 'p-aws', name: 'Amazon Web Services', logoUrl: null },
    { id: 'p-nvidia', name: 'NVIDIA', logoUrl: null },
];

// FIX: Added default settings for VIP System
const trophyIcon = (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="w-8 h-8"><path fill-rule="evenodd" d="M5.166 2.072A.75.75 0 0 1 6 .75h12A.75.75 0 0 1 18.834 2.072l-4.25 4.25a.75.75 0 0 1-1.06 0l-1.47-1.47a.75.75 0 0 0-1.06 0l-1.47 1.47a.75.75 0 0 1-1.06 0l-4.25-4.25Zm.848 5.428 4.25 4.25a.75.75 0 0 0 1.06 0l1.47-1.47a.75.75 0 0 1 1.06 0l1.47 1.47a.75.75 0 0 0 1.06 0l4.25-4.25a.75.75 0 0 1 1.06 1.06l-4.25 4.25a.75.75 0 0 0 0 1.06l4.25 4.25a.75.75 0 0 1-1.06 1.06l-4.25-4.25a.75.75 0 0 0-1.06 0l-1.47 1.47a.75.75 0 0 1-1.06 0l-1.47-1.47a.75.75 0 0 0-1.06 0l-4.25 4.25a.75.75 0 0 1-1.06-1.06l4.25-4.25a.75.75 0 0 0 0-1.06L4.106 8.56a.75.75 0 0 1 1.06-1.06Z" clip-rule="evenodd" /></svg>`;

const defaultVipTiers: VipTier[] = [
    { name: 'Bronze', threshold: 0, icon: trophyIcon('#cd7f32'), buyRateBonus: 0, sellRateBonus: 0.5 },
    { name: 'Silver', threshold: 1000000, icon: trophyIcon('#c0c0c0'), buyRateBonus: 0.5, sellRateBonus: 1 },
    { name: 'Gold', threshold: 5000000, icon: trophyIcon('#ffd700'), buyRateBonus: 1, sellRateBonus: 1.5 },
    { name: 'Platinum', threshold: 20000000, icon: trophyIcon('#e5e4e2'), buyRateBonus: 1.5, sellRateBonus: 2 },
];

const defaultSettings: AdminSettings = {
    adminPin: DEFAULT_ADMIN_PIN,
    branding: {
      appName: "Raxnet Store",
      appLogoSvg: `<svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c084fc" /><stop offset="100%" stop-color="#a855f7" /></linearGradient><linearGradient id="logo-highlight" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f59e0b" /><stop offset="100%" stop-color="#FFD700" /></linearGradient><filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#logo-glow)"><path d="M25,80 L25,20 L60,20 C75,20 75,40 60,40 L45,40 L75,80 L55,80 L25,45 L25,80 Z" fill="url(#logo-grad)" /><path d="M28,23 L60,23 C72,23 72,37 60,37 L45,37 L72,77 L58,77 L28,45 L28,23 Z" fill="url(#logo-highlight)" /><path d="M25,80 L25,20 L60,20 C75,20 75,40 60,40 L45,40 L75,80 L55,80 L25,45 L25,80 Z" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" /></g></svg>`,
    },
    exchangeRate: 60000, // User sells to Admin
    buyRate: 65000, // User buys from Admin
    adminGameId: "29795801", // For SELL, user sends here
    adminPaymentInfo: {
        bankName: "BCA",
        accountNumber: "123-456-7890",
        accountName: "Raxnet Admin",
        qrisImage: null,
        paymentMethods: { bankTransfer: true, qris: true, },
    },
    maintenanceMode: false,
    announcement: "Selamat Datang di Raxnet Store!",
    enabledFeatures: { sellChip: true, buyChip: true, globalHistory: true, providerCarousel: true, },
    notifications: {
        adminBot: { enabled: true, botToken: "7543069089:AAHaGID56F99-ovQqMYdeGHF6LKfJr7wF9g", chatId: "7910050681" },
        userBot: { enabled: true, botUsername: "configinjek_bot" }
    },
    promoCodes: [],
    partners: defaultPartners,
    chatSettings: {
        enabled: true,
        agentName: "CS Raxnet",
        welcomeMessage: "Halo! Ada yang bisa kami bantu? Silakan ketik pertanyaan Anda di sini.",
    },
    // FIX: Added default settings for VIP and Affiliate systems.
    vipSystem: {
        enabled: true,
        tiers: defaultVipTiers,
    },
    affiliateSystem: {
        enabled: true,
        commissionRate: 5, // 5%
    },
};

const generateInitialTransactions = (settings: AdminSettings): Transaction[] => {
    const transactions: Transaction[] = [];
    const now = Date.now();
    for (let i = 0; i < 50; i++) {
        const id = `RP-${(now - i * 3600000).toString(36).substr(2, 9)}`.toUpperCase();
        const type: TransactionType = Math.random() < 0.5 ? 'SELL' : 'BUY';
        const createdAt = now - (i * 1800000 + Math.random() * 1800000);
        
        let transaction: Partial<Transaction> = {
            id,
            anonymizedId: anonymizeId(id),
            type,
            status: TransactionStatus.PAID,
            createdAt,
            verifiedAt: createdAt + 60000 * 5,
            paidAt: createdAt + 60000 * 7,
            destinationId: `USER${Math.floor(100000 + Math.random() * 900000)}`,
            proofImage: '',
        };

        if (type === 'SELL') {
            const chipAmount = (Math.random() * 10 + 0.5) * CHIP_UNIT;
            const moneyValue = (chipAmount / CHIP_UNIT) * settings.exchangeRate;
            const method: PaymentMethod = Math.random() < 0.6 ? 'Bank' : 'E-Wallet';
            const provider = method === 'Bank' 
                ? INDONESIAN_BANKS[Math.floor(Math.random() * INDONESIAN_BANKS.length)]
                : INDONESIAN_EWALLETS[Math.floor(Math.random() * INDONESIAN_EWALLETS.length)];
            
            transaction = { ...transaction, chipAmount, moneyValue, paymentDetails: { method, provider, accountNumber: `***${Math.floor(1000 + Math.random() * 9000)}`, accountName: '*****', }, };
        } else { // BUY
            const chipPackage = CHIP_PACKAGES[Math.floor(Math.random() * CHIP_PACKAGES.length)];
            const moneyValue = (chipPackage.chipAmount / CHIP_UNIT) * settings.buyRate;
            transaction = { ...transaction, chipAmount: chipPackage.chipAmount, moneyValue: moneyValue, chipPackage, };
        }
        
        transactions.push(transaction as Transaction);
    }
    return transactions.sort((a,b) => b.createdAt - a.createdAt);
};


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
    const [settings, setSettings] = useLocalStorage<AdminSettings>('settings', defaultSettings);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [chatLogs, setChatLogs] = useLocalStorage<{ [gameId: string]: ChatMessage[] }>('raxnet-chat-logs', {});


    useEffect(() => {
        const storedTransactions = window.localStorage.getItem('transactions');
        const storedSettings = window.localStorage.getItem('settings');

        const deepMerge = (target: any, source: any) => {
            const output = { ...target };
            if (target && typeof target === 'object' && source && typeof source === 'object') {
                Object.keys(source).forEach(key => {
                    if (Array.isArray(source[key])) {
                        output[key] = source[key];
                    } else if (source[key] && typeof source[key] === 'object' && key in target) {
                        output[key] = deepMerge(target[key], source[key]);
                    } else {
                        output[key] = source[key];
                    }
                });
            }
            return output;
        };
        
        if (!storedSettings) {
            setSettings(defaultSettings);
        } else {
            const parsedSettings = JSON.parse(storedSettings);
            const mergedSettings = deepMerge(defaultSettings, parsedSettings);
            setSettings(mergedSettings);
        }

        if (!storedTransactions || JSON.parse(storedTransactions).length === 0) {
            setTransactions(generateInitialTransactions(settings));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const showToast = (message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const updateTransactionStatus = (id: string, status: TransactionStatus) => {
        setTransactions(prev =>
            prev.map((tx) => {
                if (tx.id === id) {
                    const updatedTx: Transaction = { ...tx, status };
                    if (status === TransactionStatus.VERIFYING && !tx.verifiedAt) updatedTx.verifiedAt = Date.now();
                    if (status === TransactionStatus.PAID && !tx.paidAt) {
                        updatedTx.paidAt = Date.now();
                        if (!tx.verifiedAt) updatedTx.verifiedAt = Date.now();
                    }
                    return updatedTx;
                }
                return tx;
            })
        );
    };

    const updateSettings = (newSettings: Partial<AdminSettings>) => {
        setSettings(prev => {
            const merged = {
                ...prev,
                ...newSettings,
                branding: { ...prev.branding, ...(newSettings.branding || {})},
                adminPaymentInfo: { ...prev.adminPaymentInfo, ...(newSettings.adminPaymentInfo || {}), paymentMethods: { ...prev.adminPaymentInfo.paymentMethods, ...(newSettings.adminPaymentInfo?.paymentMethods || {}) } },
                enabledFeatures: { ...prev.enabledFeatures, ...(newSettings.enabledFeatures || {}), },
                notifications: {
                    adminBot: { ...prev.notifications.adminBot, ...(newSettings.notifications?.adminBot || {}) },
                    userBot: { ...prev.notifications.userBot, ...(newSettings.notifications?.userBot || {}) },
                },
                promoCodes: newSettings.promoCodes || prev.promoCodes,
                partners: newSettings.partners || prev.partners,
                chatSettings: { ...prev.chatSettings, ...(newSettings.chatSettings || {}) },
                // FIX: Correctly merge nested VIP and Affiliate settings
                vipSystem: { ...prev.vipSystem, ...(newSettings.vipSystem || {}), tiers: newSettings.vipSystem?.tiers || prev.vipSystem.tiers },
                affiliateSystem: { ...prev.affiliateSystem, ...(newSettings.affiliateSystem || {}) },
            };
            return merged;
        });
    };

    const updatePin = (newPin: string): boolean => {
        if (newPin.length < 4) {
            showToast("PIN minimal harus 4 digit.", "error");
            return false;
        }
        setSettings(prev => ({...prev, adminPin: newPin}));
        showToast("PIN berhasil diperbarui.", "success");
        return true;
    }

    // --- PROMO CODE MANAGEMENT ---
    const promoCodes = settings.promoCodes || [];

    const addPromoCode = useCallback((codeData: Omit<PromoCode, 'id' | 'currentUses' | 'createdAt' | 'isActive'>) => {
        const newCode: PromoCode = {
            ...codeData,
            id: `PC-${Date.now().toString(36)}`,
            currentUses: 0,
            createdAt: Date.now(),
            isActive: true,
        };
        setSettings(prev => ({
            ...prev,
            promoCodes: [...(prev.promoCodes || []), newCode],
        }));
        showToast(`Kode promo "${newCode.code}" berhasil dibuat!`, 'success');
    }, [setSettings, showToast]);

    const updatePromoCode = useCallback((id: string, updates: Partial<PromoCode>) => {
         setSettings(prev => ({
            ...prev,
            promoCodes: (prev.promoCodes || []).map(pc => pc.id === id ? { ...pc, ...updates } : pc),
        }));
    }, [setSettings]);
    
    const deletePromoCode = useCallback((id: string) => {
        setSettings(prev => ({
            ...prev,
            promoCodes: (prev.promoCodes || []).filter(pc => pc.id !== id),
        }));
        showToast('Kode promo berhasil dihapus.', 'info');
    }, [setSettings, showToast]);

    const validatePromoCode = useCallback((code: string, type: TransactionType, gameId: string) => {
        const promo = promoCodes.find(pc => pc.code.toLowerCase() === code.toLowerCase());

        if (!promo) return { isValid: false, message: "Kode promo tidak ditemukan." };
        if (!promo.isActive) return { isValid: false, message: "Kode promo sudah tidak aktif." };
        if (promo.maxUses > 0 && promo.currentUses >= promo.maxUses) return { isValid: false, message: "Kode promo sudah mencapai batas penggunaan." };
        if (promo.type !== 'BOTH' && promo.type !== type) return { isValid: false, message: `Kode promo tidak valid untuk transaksi ${type === 'BUY' ? 'pembelian' : 'penjualan'}.` };
        
        const userHasUsed = transactions.some(tx => tx.destinationId === gameId && tx.promoCodeUsed === promo.id);
        if (userHasUsed) return { isValid: false, message: "Anda sudah pernah menggunakan kode promo ini." };

        return { isValid: true, promo, message: "Kode promo berhasil diterapkan!", discountPercent: promo.discountPercent };
    }, [promoCodes, transactions]);
    

    const addTransaction = useCallback(async (txData: AddTransactionData): Promise<string> => {
        const id = `RP-${Date.now().toString(36).substr(2, 9)}`.toUpperCase();
        let finalTxData = { ...txData.data };

        const promoCodeStr = finalTxData.promoCodeUsed;
        const promo = promoCodeStr ? settings.promoCodes.find(p => p.code.toLowerCase() === promoCodeStr.toLowerCase()) : undefined;

        if (promo) {
            updatePromoCode(promo.id, { currentUses: promo.currentUses + 1 });
            finalTxData.promoCodeUsed = promo.id; // Store ID, not code
        }
        
        // FIX: Capture referral ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const refId = urlParams.get('ref');

        const newTransaction: Transaction = { 
            ...(finalTxData as any),
            id,
            type: txData.type,
            anonymizedId: anonymizeId(id), 
            status: TransactionStatus.PENDING, 
            createdAt: Date.now(),
            referredBy: refId || undefined,
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
        
        await sendTelegramNotification(settings, newTransaction);

        return newTransaction.id;
    }, [settings, setTransactions, updatePromoCode]);

    const sendChatMessage = useCallback((gameId: string, message: string) => {
        const userMessage: ChatMessage = {
            id: `msg-user-${Date.now()}`,
            sender: 'user',
            text: message,
            timestamp: Date.now(),
        };
        
        setChatLogs(prev => {
            const userLog = prev[gameId] || [];
            return { ...prev, [gameId]: [...userLog, userMessage] };
        });

        // Simulate agent auto-response
        setTimeout(() => {
            const agentResponse: ChatMessage = {
                id: `msg-agent-auto-${Date.now()}`,
                sender: 'agent',
                text: "Terima kasih atas pesan Anda. Tim support kami akan segera merespons jika diperlukan. Harap dicatat, ini adalah respons otomatis.",
                timestamp: Date.now(),
            };
            setChatLogs(prev => {
                const userLog = prev[gameId] || [];
                return { ...prev, [gameId]: [...userLog, agentResponse] };
            });
        }, 1500);
    }, [setChatLogs]);

    const sendAdminChatMessage = useCallback((gameId: string, message: string) => {
        const adminMessage: ChatMessage = {
            id: `msg-agent-manual-${Date.now()}`,
            sender: 'agent',
            text: message,
            timestamp: Date.now(),
        };
        
        setChatLogs(prev => {
            const userLog = prev[gameId] || [];
            return { ...prev, [gameId]: [...userLog, adminMessage] };
        });
    }, [setChatLogs]);

    // FIX: Implemented getUserVipStatus function
    const getUserVipStatus = useCallback((gameId: string): VipStatus | null => {
        if (!settings.vipSystem.enabled) return null;
        
        const userTransactions = transactions.filter(tx => tx.destinationId === gameId && tx.status === TransactionStatus.PAID);
        const totalVolume = userTransactions.reduce((sum, tx) => sum + tx.moneyValue, 0);

        const sortedTiers = [...settings.vipSystem.tiers].sort((a, b) => a.threshold - b.threshold);
        let currentTier = sortedTiers[0];
        for (const tier of sortedTiers) {
            if (totalVolume >= tier.threshold) {
                currentTier = tier;
            } else {
                break;
            }
        }
        
        const currentTierIndex = sortedTiers.findIndex(t => t.name === currentTier.name);
        const nextTier = currentTierIndex < sortedTiers.length - 1 ? sortedTiers[currentTierIndex + 1] : null;

        let progress = 100;
        if (nextTier) {
            const prevTierThreshold = currentTier.threshold;
            const nextTierThreshold = nextTier.threshold;
            const range = nextTierThreshold - prevTierThreshold;
            const volumeInTier = totalVolume - prevTierThreshold;
            progress = range > 0 ? Math.min(100, (volumeInTier / range) * 100) : 100;
        }

        return { totalVolume, currentTier, nextTier, progress };
    }, [transactions, settings.vipSystem]);

    // FIX: Implemented getAffiliateStats function
    const getAffiliateStats = useCallback((gameId: string): AffiliateStats | null => {
        if (!settings.affiliateSystem.enabled) return null;

        const referredUserIds = [...new Set(transactions.filter(tx => tx.referredBy === gameId).map(tx => tx.destinationId))];

        const history: AffiliateCommission[] = [];
        let commissionBalance = 0;

        referredUserIds.forEach(userId => {
            const userTransactions = transactions.filter(tx => tx.destinationId === userId && tx.status === TransactionStatus.PAID);
            
            if (userTransactions.length > 0) {
                 const firstTxWithReferrer = userTransactions
                    .sort((a, b) => a.createdAt - b.createdAt)
                    .find(tx => tx.referredBy === gameId);

                if (firstTxWithReferrer) {
                     const isFirstOverallTx = userTransactions[0].id === firstTxWithReferrer.id;
                     if(isFirstOverallTx) {
                        const commission = firstTxWithReferrer.moneyValue * (settings.affiliateSystem.commissionRate / 100);
                        commissionBalance += commission;
                        history.push({
                            transactionId: firstTxWithReferrer.id,
                            amount: commission,
                            timestamp: firstTxWithReferrer.paidAt || firstTxWithReferrer.createdAt,
                        });
                     }
                }
            }
        });

        return {
            referrals: referredUserIds.length,
            commissionBalance,
            commissionPaid: 0,
            history,
        };
    }, [transactions, settings.affiliateSystem]);

    const testTelegramNotification = useCallback(async (telegramSettings: AdminSettings['notifications']['adminBot']) => {
        const { botToken, chatId } = telegramSettings;
        if (!botToken || !chatId) {
            showToast("Harap isi Token Bot dan Chat ID.", "error");
            return;
        }

        const message = "✅ *Koneksi Bot Telegram Berhasil!*\n\nNotifikasi dari Raxnet Store akan muncul di sini.";
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
            });
            const data = await response.json();
            if (data.ok) {
                showToast("Pesan tes berhasil dikirim! Periksa Telegram Anda.", "success");
            } else {
                throw new Error(data.description || 'Respons tidak valid dari API Telegram');
            }
        } catch (error: any) {
            console.error("Gagal mengirim notifikasi tes Telegram:", error);
            showToast(`Gagal mengirim pesan: ${error.message}`, "error");
        }
    }, [showToast]);

    return (
        <DataContext.Provider value={{ transactions, settings, toasts, addTransaction, updateTransactionStatus, updateSettings, updatePin, showToast, removeToast, promoCodes, addPromoCode, updatePromoCode, deletePromoCode, validatePromoCode, chatLogs, sendChatMessage, sendAdminChatMessage, getUserVipStatus, getAffiliateStats, testTelegramNotification }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
};
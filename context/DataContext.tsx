import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Transaction, AdminSettings, TransactionStatus, DataContextType, ToastMessage, ToastType, PaymentMethod, AddTransactionData, TransactionType, VipTier, PromoCode, Partner, ChatMessage, AffiliateData, Commission } from '../types';
import { CHIP_UNIT, INDONESIAN_BANKS, INDONESIAN_EWALLETS, anonymizeId, CHIP_PACKAGES, DEFAULT_ADMIN_PIN, VIP_TIER_ICONS } from '../constants';

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper function for Telegram notifications
const sendTelegramNotification = async (settings: AdminSettings, message: string) => {
    const { enabled, botToken, chatId } = settings.notifications.telegram;
    if (!enabled || !botToken || !chatId) {
        return;
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown',
            }),
        });
    } catch (error) {
        console.error("Failed to send Telegram notification:", error);
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
    vipSystem: {
        enabled: true,
        tiers: [
            { name: "Bronze", threshold: 0, buyRateBonus: 0, sellRateBonus: 0, icon: VIP_TIER_ICONS.bronze },
            { name: "Silver", threshold: 5000000, buyRateBonus: 0.5, sellRateBonus: 0.5, icon: VIP_TIER_ICONS.silver },
            { name: "Gold", threshold: 25000000, buyRateBonus: 1, sellRateBonus: 1, icon: VIP_TIER_ICONS.gold },
            { name: "Platinum", threshold: 100000000, buyRateBonus: 1.5, sellRateBonus: 2, icon: VIP_TIER_ICONS.platinum },
            { name: "Diamond", threshold: 500000000, buyRateBonus: 2, sellRateBonus: 3, icon: VIP_TIER_ICONS.diamond },
        ]
    },
    notifications: {
        telegram: { enabled: false, botToken: "", chatId: "" }
    },
    promoCodes: [],
    partners: defaultPartners,
    chatSettings: {
        enabled: true,
        agentName: "CS Raxnet",
        welcomeMessage: "Halo! Ada yang bisa kami bantu? Silakan ketik pertanyaan Anda di sini.",
    },
    affiliateSystem: {
        enabled: true,
        commissionRate: 1.0, // 1% commission
        minPayout: 50000, // Rp 50.000
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
    const [affiliateData, setAffiliateData] = useLocalStorage<AffiliateData>('affiliateData', {});
    
    // For user's current session
    const [chatHistory, setChatHistory] = useLocalStorage<ChatMessage[]>('raxnet-chat-session', []);
    // For admin to see all messages
    const [allChatMessages, setAllChatMessages] = useLocalStorage<ChatMessage[]>('raxnet-chat-log', []);


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
                vipSystem: { ...prev.vipSystem, ...(newSettings.vipSystem || {})},
                notifications: {
                    ...prev.notifications,
                    telegram: { ...prev.notifications.telegram, ...(newSettings.notifications?.telegram || {}) }
                },
                promoCodes: newSettings.promoCodes || prev.promoCodes,
                partners: newSettings.partners || prev.partners,
                chatSettings: { ...prev.chatSettings, ...(newSettings.chatSettings || {}) },
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

    const getUserVipStatus = useCallback((gameId: string) => {
        const userTransactions = transactions.filter(tx => tx.destinationId === gameId && tx.status === TransactionStatus.PAID);
        const totalVolume = userTransactions.reduce((sum, tx) => sum + tx.moneyValue, 0);

        const sortedTiers = [...settings.vipSystem.tiers].sort((a,b) => b.threshold - a.threshold);
        const currentTier = sortedTiers.find(tier => totalVolume >= tier.threshold) || settings.vipSystem.tiers[0];
        
        const nextTier = settings.vipSystem.tiers
            .filter(tier => tier.threshold > currentTier.threshold)
            .sort((a,b) => a.threshold - b.threshold)[0] || null;

        const progress = nextTier ? Math.min(100, (totalVolume / nextTier.threshold) * 100) : 100;
        
        return { currentTier, nextTier, progress, totalVolume };
    }, [transactions, settings.vipSystem.tiers]);

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
    
    // --- AFFILIATE SYSTEM ---
    const getAffiliateStats = useCallback((gameId: string) => {
        const data = affiliateData[gameId] || { commissionBalance: 0, commissionPaid: 0, referrals: [], history: [] };
        return {
            ...data,
            referrals: data.referrals.length,
        };
    }, [affiliateData]);

    const handlePayout = useCallback((gameId: string) => {
        setAffiliateData(prev => {
            const userData = prev[gameId];
            if (!userData) return prev;
            return {
                ...prev,
                [gameId]: {
                    ...userData,
                    commissionPaid: userData.commissionPaid + userData.commissionBalance,
                    commissionBalance: 0,
                }
            };
        });
        showToast(`Payout untuk ${gameId} berhasil ditandai sebagai selesai.`, 'success');
    }, [setAffiliateData, showToast]);


    const addTransaction = useCallback(async (txData: AddTransactionData): Promise<string> => {
        const id = `RP-${Date.now().toString(36).substr(2, 9)}`.toUpperCase();
        let finalTxData = { ...txData.data };

        const promoCode = finalTxData.promoCodeUsed;
        const promo = promoCode ? settings.promoCodes.find(p => p.code.toLowerCase() === promoCode.toLowerCase()) : undefined;

        if (promo) {
            updatePromoCode(promo.id, { currentUses: promo.currentUses + 1 });
            finalTxData.promoCodeUsed = promo.id; // Store ID
        }

        // Affiliate logic
        const referrerId = sessionStorage.getItem('referrerId');
        const isFirstTransaction = !transactions.some(tx => tx.destinationId === finalTxData.destinationId);
        
        if (settings.affiliateSystem.enabled && referrerId && isFirstTransaction && referrerId !== finalTxData.destinationId) {
            finalTxData.referrerId = referrerId;
            const commissionAmount = finalTxData.moneyValue * (settings.affiliateSystem.commissionRate / 100);
            
            setAffiliateData(prev => {
                const referrerData = prev[referrerId] || { commissionBalance: 0, commissionPaid: 0, referrals: [], history: [] };
                return {
                    ...prev,
                    [referrerId]: {
                        ...referrerData,
                        commissionBalance: referrerData.commissionBalance + commissionAmount,
                        referrals: [...referrerData.referrals, finalTxData.destinationId],
                        history: [...referrerData.history, { transactionId: id, amount: commissionAmount, timestamp: Date.now() }],
                    }
                };
            });
        }


        const newTransaction: Transaction = { 
            ...(finalTxData as any),
            id,
            type: txData.type,
            anonymizedId: anonymizeId(id), 
            status: TransactionStatus.PENDING, 
            createdAt: Date.now(),
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
        
        const notifMessage = `*Transaksi Baru Masuk!*\n*ID:* \`${newTransaction.id}\`\n*Tipe:* ${newTransaction.type}\n*Jumlah:* ${new Intl.NumberFormat('id-ID').format(newTransaction.moneyValue)} IDR\n*User ID:* \`${newTransaction.destinationId}\`\n${promoCode ? `*Promo:* \`${promoCode}\`` : ''}\n${newTransaction.referrerId ? `*Referral dari:* \`${newTransaction.referrerId}\`` : ''}\n_Harap segera diproses._`;
        await sendTelegramNotification(settings, notifMessage);

        return newTransaction.id;
    }, [settings, transactions, setTransactions, updatePromoCode, setAffiliateData]);

    const sendChatMessage = useCallback((message: string) => {
        const userMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: 'user',
            text: message,
            timestamp: Date.now(),
        };
        
        // Add to user's view and admin's log
        setChatHistory(prev => [...prev, userMessage]);
        setAllChatMessages(prev => [...prev, userMessage].sort((a,b) => b.timestamp - a.timestamp));

        // Simulate agent response
        setTimeout(() => {
            const agentResponse: ChatMessage = {
                id: `msg-agent-${Date.now()}`,
                sender: 'agent',
                text: "Terima kasih atas pesan Anda. Tim support kami akan segera merespons jika diperlukan. Harap dicatat, ini adalah respons otomatis.",
                timestamp: Date.now(),
            };
            setChatHistory(prev => [...prev, agentResponse]);
        }, 1500);
    }, [setChatHistory, setAllChatMessages]);


    return (
        <DataContext.Provider value={{ transactions, settings, toasts, addTransaction, updateTransactionStatus, updateSettings, updatePin, showToast, removeToast, getUserVipStatus, promoCodes, addPromoCode, updatePromoCode, deletePromoCode, validatePromoCode, chatHistory, allChatMessages, sendChatMessage, affiliateData, getAffiliateStats, handlePayout }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
};
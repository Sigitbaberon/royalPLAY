import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Transaction, AdminSettings, TransactionStatus, DataContextType, ToastMessage, ToastType, PaymentMethod, PaymentDetails, AddTransactionData, TransactionType } from '../types';
import { CHIP_UNIT, ADMIN_SELL_RATE, ADMIN_BUY_RATE, INDONESIAN_BANKS, INDONESIAN_EWALLETS, anonymizeId, CHIP_PACKAGES } from '../constants';

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultSettings: AdminSettings = {
    exchangeRate: ADMIN_SELL_RATE,
    buyRate: ADMIN_BUY_RATE,
    isDestinationIdRequired: true,
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
            
            transaction = {
                ...transaction,
                chipAmount,
                moneyValue,
                paymentDetails: {
                    method,
                    provider,
                    accountNumber: `***${Math.floor(1000 + Math.random() * 9000)}`,
                    accountName: '*****',
                },
            };
        } else { // BUY
            const chipPackage = CHIP_PACKAGES[Math.floor(Math.random() * CHIP_PACKAGES.length)];
            transaction = {
                ...transaction,
                chipAmount: chipPackage.chipAmount,
                moneyValue: chipPackage.price,
                chipPackage,
            };
        }
        
        transactions.push(transaction as Transaction);
    }
    return transactions.sort((a,b) => b.createdAt - a.createdAt);
};


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
    const [settings, setSettings] = useLocalStorage<AdminSettings>('settings', defaultSettings);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        const storedTransactions = window.localStorage.getItem('transactions');
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

    const addTransaction = (txData: AddTransactionData): string => {
        const id = `RP-${Date.now().toString(36).substr(2, 9)}`.toUpperCase();
        let newTransaction: Transaction;

        if (txData.type === 'SELL') {
            const moneyValue = (txData.data.chipAmount / CHIP_UNIT) * settings.exchangeRate;
            newTransaction = {
                ...txData.data,
                id,
                type: 'SELL',
                anonymizedId: anonymizeId(id),
                status: TransactionStatus.PENDING,
                createdAt: Date.now(),
                moneyValue: moneyValue,
            };
        } else { // BUY
            const moneyValue = txData.data.chipPackage!.price;
            newTransaction = {
                ...txData.data,
                id,
                type: 'BUY',
                anonymizedId: anonymizeId(id),
                status: TransactionStatus.PENDING,
                createdAt: Date.now(),
                moneyValue: moneyValue,
            };
        }
        
        setTransactions(prev => [newTransaction, ...prev]);
        return newTransaction.id;
    };

    const updateTransactionStatus = (id: string, status: TransactionStatus) => {
        setTransactions(
            transactions.map((tx) => {
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

    const updateSettings = (newSettings: AdminSettings) => setSettings(newSettings);

    return (
        <DataContext.Provider value={{ transactions, settings, toasts, addTransaction, updateTransactionStatus, updateSettings, showToast, removeToast }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
};
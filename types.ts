export enum TransactionStatus {
  PENDING = 'Tertunda',
  VERIFYING = 'Verifikasi',
  PAID = 'Dibayar',
  REJECTED = 'Ditolak'
}

export type TransactionType = 'SELL' | 'BUY';

export type PaymentMethod = 'Bank' | 'E-Wallet';

export interface PaymentDetails {
  method: PaymentMethod;
  provider: string; // e.g., 'BCA', 'DANA'
  accountNumber: string; // or phone number for e-wallet
  accountName: string;
}

export interface ChipPackage {
  id: string;
  chipAmount: number;
  price: number;
  name: string;
  icon: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  anonymizedId: string;
  chipAmount: number;
  moneyValue: number;
  paymentDetails?: PaymentDetails; // For SELL transactions
  destinationId?: string; // This is the user's game ID
  proofImage: string; // Base64 string
  status: TransactionStatus;
  createdAt: number; // timestamp
  verifiedAt?: number;
  paidAt?: number;
  chipPackage?: ChipPackage; // For BUY transactions
}

export interface AdminSettings {
  exchangeRate: number; // SELL rate for 1B chips
  buyRate: number; // BUY rate for 1B chips (Admin's selling price)
  isDestinationIdRequired: boolean;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export type AddTransactionData = 
  | { type: 'SELL'; data: Omit<Transaction, 'id' | 'status' | 'createdAt' | 'moneyValue' | 'anonymizedId' | 'type' | 'chipPackage'> }
  | { type: 'BUY'; data: Omit<Transaction, 'id' | 'status' | 'createdAt' | 'moneyValue' | 'anonymizedId' | 'type' | 'paymentDetails'> };

export interface DataContextType {
    transactions: Transaction[];
    settings: AdminSettings;
    toasts: ToastMessage[];
    addTransaction: (txData: AddTransactionData) => string;
    updateTransactionStatus: (id: string, status: TransactionStatus) => void;
    updateSettings: (newSettings: AdminSettings) => void;
    showToast: (message: string, type: ToastType) => void;
    removeToast: (id: number) => void;
}
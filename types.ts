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
  name: string;
  icon: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  anonymizedId: string;
  chipAmount: number;
  moneyValue: number; // This will be the FINAL value after discounts/bonuses
  paymentDetails?: PaymentDetails; // For SELL transactions
  destinationId: string; // This is the user's game ID for BOTH sell and buy
  proofImage: string; // Base64 string
  status: TransactionStatus;
  createdAt: number; // timestamp
  verifiedAt?: number;
  paidAt?: number;
  chipPackage?: Omit<ChipPackage, 'price'>; // For BUY transactions
  promoCodeUsed?: string;
  referrerId?: string; // ID of the affiliate who referred this user
}

export interface VipTier {
    name: string;
    threshold: number; // Total transaction volume to reach this tier
    buyRateBonus: number; // Percentage discount for buying
    sellRateBonus: number; // Percentage bonus for selling
    icon: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  type: 'BUY' | 'SELL' | 'BOTH';
  maxUses: number; // 0 for unlimited
  currentUses: number;
  isActive: boolean;
  createdAt: number;
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string | null; // base64 string
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: number;
}

export interface ChatSettings {
  enabled: boolean;
  agentName: string;
  welcomeMessage: string;
}

export interface Commission {
  transactionId: string;
  amount: number;
  timestamp: number;
}

export interface AffiliateData {
  [gameId: string]: {
    commissionBalance: number;
    commissionPaid: number;
    referrals: string[]; // List of referred user game IDs
    history: Commission[];
  };
}

export interface AffiliateSettings {
  enabled: boolean;
  commissionRate: number; // Percentage
  minPayout: number; // Minimum amount for payout
}


export interface AdminSettings {
  adminPin: string;
  branding: {
    appName: string;
    appLogoSvg: string;
  };
  exchangeRate: number; // SELL rate for 1B chips
  buyRate: number; // BUY rate for 1B chips (Admin's selling price)
  adminGameId: string; // The game ID users send chips to (SELL)
  adminPaymentInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    qrisImage: string | null; // base64 string for QRIS
    paymentMethods: {
        bankTransfer: boolean;
        qris: boolean;
    };
  };
  maintenanceMode: boolean;
  announcement: string;
  enabledFeatures: {
      sellChip: boolean;
      buyChip: boolean;
      globalHistory: boolean;
      providerCarousel: boolean;
  };
  vipSystem: {
      enabled: boolean;
      tiers: VipTier[];
  };
  notifications: {
      telegram: {
          enabled: boolean;
          botToken: string;
          chatId: string;
      }
  };
  promoCodes: PromoCode[];
  partners: Partner[];
  chatSettings: ChatSettings;
  affiliateSystem: AffiliateSettings;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export type AddTransactionData = 
  | { type: 'SELL'; data: Omit<Transaction, 'id' | 'status' | 'createdAt' | 'anonymizedId' | 'type' | 'chipPackage'> }
  | { type: 'BUY'; data: Omit<Transaction, 'id' | 'status' | 'createdAt' | 'anonymizedId' | 'type' | 'paymentDetails'> };

export interface DataContextType {
    transactions: Transaction[];
    settings: AdminSettings;
    toasts: ToastMessage[];
    allChatMessages: ChatMessage[];
    chatHistory: ChatMessage[];
    affiliateData: AffiliateData;
    sendChatMessage: (message: string) => void;
    addTransaction: (txData: AddTransactionData) => Promise<string>;
    updateTransactionStatus: (id: string, status: TransactionStatus) => void;
    updateSettings: (newSettings: Partial<AdminSettings>) => void;
    updatePin: (newPin: string) => boolean;
    showToast: (message: string, type: ToastType) => void;
    removeToast: (id: number) => void;
    getUserVipStatus: (gameId: string) => { currentTier: VipTier, nextTier: VipTier | null, progress: number, totalVolume: number };
    promoCodes: PromoCode[];
    addPromoCode: (codeData: Omit<PromoCode, 'id' | 'currentUses' | 'createdAt' | 'isActive'>) => void;
    updatePromoCode: (id: string, updates: Partial<PromoCode>) => void;
    deletePromoCode: (id: string) => void;
    validatePromoCode: (code: string, type: TransactionType, gameId: string) => { isValid: boolean; promo?: PromoCode; message: string; discountPercent?: number };
    getAffiliateStats: (gameId: string) => { commissionBalance: number; commissionPaid: number; referrals: number; history: Commission[] };
    handlePayout: (gameId: string) => void;
}
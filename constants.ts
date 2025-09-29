import { ChipPackage } from "./types";

export const APP_NAME = "Royal Play";
export const APP_LOGO = `
<svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFD700" />
            <stop offset="100%" stop-color="#F59E0B" />
        </linearGradient>
        <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
    </defs>
    <g filter="url(#logo-glow)">
        <path d="M20 80L50 20L80 80L65 80L50 50L35 80L20 80Z" fill="url(#logo-grad)" />
        <path d="M50 20L65 80H80L50 20Z" fill="white" fill-opacity="0.5" />
        <path d="M50 20L35 80H20L50 20Z" fill="white" fill-opacity="0.2" />
        <path d="M5 90H95" stroke="url(#logo-grad)" stroke-width="5" stroke-linecap="round"/>
    </g>
</svg>`;

export const ADMIN_PIN = "24032000";
export const ADMIN_GAME_ID = "29795801"; // For SELL, user sends here
export const ADMIN_PAYMENT_INFO = "BCA: 123-456-7890 (a/n Royal Play Admin) / QRIS"; // For BUY, user pays here

export const CHIP_UNIT = 1000000000; // Rate is per 1,000,000,000 (1B) chips
export const ADMIN_SELL_RATE = 60000; // Admin BUYS from user at this rate
export const ADMIN_BUY_RATE = 65000; // Admin SELLS to user at this rate

export const INDONESIAN_BANKS = ['BCA', 'Mandiri', 'BRI', 'BNI', 'CIMB Niaga', 'Danamon'];
export const INDONESIAN_EWALLETS = ['DANA', 'OVO', 'GoPay', 'ShopeePay', 'LinkAja'];

export const CHIP_PACKAGES: ChipPackage[] = [
    { id: 'p1', chipAmount: 1_000_000_000, price: 65000, name: '1B Koin Emas', icon: 'coin' },
    { id: 'p2', chipAmount: 2_000_000_000, price: 130000, name: '2B Koin Emas', icon: 'coin' },
    { id: 'p3', chipAmount: 5_000_000_000, price: 325000, name: '5B Koin Ungu', icon: 'gem' },
    { id: 'p4', chipAmount: 10_000_000_000, price: 650000, name: '10B Koin Ungu', icon: 'gem' },
    { id: 'p5', chipAmount: 20_000_000_000, price: 1300000, name: '20B Koin Sultan', icon: 'crown' },
    { id: 'p6', chipAmount: 50_000_000_000, price: 3250000, name: '50B Koin Sultan', icon: 'crown' },
];

export const GAME_PROVIDER_LOGOS = [
    `<svg viewBox="0 0 200 50" fill="white"><text x="10" y="35" font-size="24">PRAGMATIC</text></svg>`,
    `<svg viewBox="0 0 200 50" fill="white"><text x="10" y="35" font-size="24">PG SOFT</text></svg>`,
    `<svg viewBox="0 0 200 50" fill="white"><text x="10" y="35" font-size="24">JOKER</text></svg>`,
    `<svg viewBox="0 0 200 50" fill="white"><text x="10" y="35" font-size="24">HABANERO</text></svg>`,
    `<svg viewBox="0 0 200 50" fill="white"><text x="10" y="35" font-size="24">SPADEGAMING</text></svg>`,
    `<svg viewBox="0 0 200 50" fill="white"><text x="10" y="35" font-size="24">CQ9</text></svg>`,
];


export const formatChipAmount = (amount: number): string => {
    if (amount >= 1_000_000_000) {
        return `${(amount / 1_000_000_000).toLocaleString('en-US', {maximumFractionDigits: 2})}B`;
    }
    if (amount >= 1_000_000) {
        return `${(amount / 1_000_000).toLocaleString('en-US', {maximumFractionDigits: 2})}M`;
    }
    if (amount >= 1_000) {
        return `${(amount / 1_000).toLocaleString('en-US', {maximumFractionDigits: 2})}K`;
    }
    return amount.toLocaleString('id-ID');
};

export const parseChipInput = (input: string): number => {
    const cleaned = String(input).toLowerCase().trim().replace(/\s/g, '');
    if (!cleaned) return 0;
    let multiplier = 1;
    let valueStr = cleaned;
    if (cleaned.endsWith('b')) {
        multiplier = 1_000_000_000;
        valueStr = cleaned.slice(0, -1);
    } else if (cleaned.endsWith('m')) {
        multiplier = 1_000_000;
        valueStr = cleaned.slice(0, -1);
    } else if (cleaned.endsWith('k')) {
        multiplier = 1_000;
        valueStr = cleaned.slice(0, -1);
    }
    const value = parseFloat(valueStr.replace(/,/g, '.'));
    if (isNaN(value)) return 0;
    return Math.round(value * multiplier);
};

export const anonymizeId = (id: string): string => {
    if (id.length <= 8) return id;
    const prefix = id.substring(0, 3);
    const suffix = id.substring(id.length - 3);
    return `${prefix}***${suffix}`;
};
import { ChipPackage, VipTier } from "./types";

export const DEFAULT_ADMIN_PIN = "12345678";

export const CHIP_UNIT = 1000000000; // Rate is per 1,000,000,000 (1B) chips

export const INDONESIAN_BANKS = ['BCA', 'Mandiri', 'BRI', 'BNI', 'CIMB Niaga', 'Danamon'];
export const INDONESIAN_EWALLETS = ['DANA', 'OVO', 'GoPay', 'ShopeePay', 'LinkAja'];

const coinIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 mx-auto text-amber-400"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9.563 8.281c.336-.513.93-1.003 1.688-1.29v7.163c-.844.259-1.424.954-1.688 1.542a.75.75 0 0 0 .563 1.049 8.21 8.21 0 0 0 3.75 0 .75.75 0 0 0 .563-1.05c-.264-.588-.844-1.282-1.688-1.54V6.99c.758.288 1.352.777 1.688 1.291a.75.75 0 1 0 1.299-.752C15.06 6.53 13.926 5.25 12.75 5.25h-1.5c-1.176 0-2.31.28-3.062 1.279a.75.75 0 1 0 1.3.752Z" clip-rule="evenodd" /></svg>`;
const gemIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 mx-auto text-violet-400"><path d="M12.75 1.5a.75.75 0 0 0-1.5 0v.143c-1.95.215-3.791.9-5.342 2.052a.75.75 0 0 0 .934 1.176A10.493 10.493 0 0 1 12 4.5c1.925 0 3.737.522 5.32 1.425a.75.75 0 0 0 .934-1.176C16.69 2.543 14.85.858 12.9.643V1.5Z" /><path fill-rule="evenodd" d="M3.145 8.163a.75.75 0 0 1 1.06 0l7.25 7.25a.75.75 0 0 0 1.06 0l7.25-7.25a.75.75 0 1 1 1.06 1.06l-7.25 7.25a2.25 2.25 0 0 1-3.182 0l-7.25-7.25a.75.75 0 0 1 0-1.06Zm17.02-.97a.75.75 0 0 0-1.12.02l-5.696 6.362a.75.75 0 0 1-1.128 0L6.53 7.213a.75.75 0 0 0-1.12-.02C3.593 9.018 3 11.213 3 12.75c0 2.45 1.492 4.6 4.01 5.663a.75.75 0 0 0 .98-1.033A5.992 5.992 0 0 1 6 12.75c0-1.018.32-1.99.888-2.827l5.228 5.844a2.25 2.25 0 0 0 3.182 0l5.228-5.844c.567.836.888 1.81.888 2.827a5.992 5.992 0 0 1-2.01 4.63.75.75 0 1 0 .98 1.033C19.508 17.35 21 15.2 21 12.75c0-1.537-.593-3.732-2.428-5.557Z" clip-rule="evenodd" /></svg>`;
const crownIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 mx-auto text-yellow-300"><path fill-rule="evenodd" d="M13.28 3.97a.75.75 0 0 1 0 1.06L11.56 7.5l1.06 1.06a.75.75 0 0 1-1.06 1.06l-1.06-1.06-1.72 1.72a.75.75 0 1 1-1.06-1.06l1.72-1.72-1.06-1.06a.75.75 0 0 1 1.06-1.06l1.06 1.06 1.72-1.72a.75.75 0 0 1 1.06 0ZM4.5 12.75a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z" clip-rule="evenodd" /><path d="m3.165 17.84-.627 1.175a.75.75 0 0 0 1.32.704l.328-.616a11.209 11.209 0 0 1 13.628 0l.328.616a.75.75 0 0 0 1.32-.704l-.627-1.175a12.71 12.71 0 0 0-14.982 0Z" /></svg>`;

export const CHIP_PACKAGES: ChipPackage[] = [
    { id: 'p1', chipAmount: 1_000_000_000, name: '1B Koin Emas', icon: coinIcon },
    { id: 'p2', chipAmount: 2_000_000_000, name: '2B Koin Emas', icon: coinIcon },
    { id: 'p3', chipAmount: 5_000_000_000, name: '5B Koin Ungu', icon: gemIcon },
    { id: 'p4', chipAmount: 10_000_000_000, name: '10B Koin Ungu', icon: gemIcon },
    { id: 'p5', chipAmount: 20_000_000_000, name: '20B Koin Sultan', icon: crownIcon },
    { id: 'p6', chipAmount: 50_000_000_000, name: '50B Koin Sultan', icon: crownIcon },
];

// VIP Tiers
export const VIP_TIER_ICONS = {
    bronze: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#CD7F32" class="w-7 h-7"><path fill-rule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.071L12 4.429l-1.892-1.892a.75.75 0 00-1.071 1.071l1.892 1.892-1.892 1.892a.75.75 0 101.071 1.071l1.892-1.892 1.892 1.892a.75.75 0 101.071-1.071L13.072 6.57l1.892-1.892a.75.75 0 00-1.071-1.071L12 4.429l1.892-1.892zM11.25 8.25a.75.75 0 100 1.5h1.5a.75.75 0 100-1.5h-1.5z" clip-rule="evenodd" /><path d="M4.5 9.75a.75.75 0 000 1.5h15a.75.75 0 000-1.5h-15zm10.05 4.72a.75.75 0 10-1.06-1.06l-2.752 2.752-1.44-1.44a.75.75 0 10-1.06 1.06l2.122 2.121a.75.75 0 001.06 0l3.5-3.5a.75.75 0 00.165-.824z" /><path d="M3.165 17.84a12.71 12.71 0 0117.67 0l-1.012 1.708a11.21 11.21 0 00-15.646 0L3.165 17.84z" /></svg>`,
    silver: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#C0C0C0" class="w-7 h-7"><path fill-rule="evenodd" d="M11.644 2.13a.75.75 0 011.06 0l.248.247 1.32-1.319a.75.75 0 011.06 1.06l-1.318 1.318.247.248a.75.75 0 010 1.06l-.247.248 1.318 1.318a.75.75 0 01-1.06 1.06L13.2 6.255l-.247.248a.75.75 0 01-1.06 0l-.248-.248-1.319 1.32a.75.75 0 01-1.06-1.06l1.318-1.319-.248-.248a.75.75 0 010-1.06l.248-.247L9.305 2.378a.75.75 0 011.06-1.06l1.319 1.318.248-.247z" clip-rule="evenodd" /><path d="M4.5 9.75a.75.75 0 000 1.5h15a.75.75 0 000-1.5h-15zm9 5.25a.75.75 0 100-1.5.75.75 0 000 1.5zm-3-1.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm-3.375-3a.75.75 0 100-1.5.75.75 0 000 1.5z" /><path d="M3.165 17.84a12.71 12.71 0 0117.67 0l-1.012 1.708a11.21 11.21 0 00-15.646 0L3.165 17.84z" /></svg>`,
    gold: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFD700" class="w-7 h-7"><path fill-rule="evenodd" d="M13.28 3.97a.75.75 0 010 1.06L11.56 7.5l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06-1.72 1.72a.75.75 0 11-1.06-1.06l1.72-1.72-1.06-1.06a.75.75 0 011.06-1.06l1.06 1.06 1.72-1.72a.75.75 0 011.06 0zM4.5 12.75a.75.75 0 000 1.5h15a.75.75 0 000-1.5h-15z" clip-rule="evenodd" /><path d="m3.165 17.84-.627 1.175a.75.75 0 001.32.704l.328-.616a11.209 11.209 0 0113.628 0l.328.616a.75.75 0 001.32-.704l-.627-1.175a12.71 12.71 0 00-14.982 0z" /></svg>`,
    platinum: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E5E4E2" class="w-7 h-7"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0V6zM12 13.5a.75.75 0 100 1.5.75.75 0 000-1.5zM12 16.5a.75.75 0 100 1.5.75.75 0 000-1.5z" clip-rule="evenodd" /><path d="M2.37 19.332a.75.75 0 001.06 1.061 14.212 14.212 0 0117.14 0 .75.75 0 101.06-1.06 15.712 15.712 0 00-19.26 0z" /></svg>`,
    diamond: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#B9F2FF" class="w-7 h-7"><path d="M12.75 1.5a.75.75 0 00-1.5 0v.143c-1.95.215-3.791.9-5.342 2.052a.75.75 0 00.934 1.176A10.493 10.493 0 0112 4.5c1.925 0 3.737.522 5.32 1.425a.75.75 0 00.934-1.176C16.69 2.543 14.85.858 12.9.643V1.5z" /><path fill-rule="evenodd" d="M3.145 8.163a.75.75 0 011.06 0l7.25 7.25a.75.75 0 001.06 0l7.25-7.25a.75.75 0 111.06 1.06l-7.25 7.25a2.25 2.25 0 01-3.182 0l-7.25-7.25a.75.75 0 010-1.06zM20.172 7.213a.75.75 0 00-1.12.02L12 14.828 4.949 7.233a.75.75 0 00-1.12-.02C1.722 9.324 1.5 11.666 1.5 12.75c0 2.45 1.492 4.6 4.01 5.663a.75.75 0 10.98-1.033A5.992 5.992 0 016 12.75c0-1.018.32-1.99.888-2.827l5.111 5.679a.75.75 0 001.002 0l5.112-5.679c.567.836.888 1.81.888 2.827a5.992 5.992 0 01-2.01 4.63.75.75 0 10.98 1.033C21.008 17.35 22.5 15.2 22.5 12.75c0-1.084-.222-3.426-2.328-5.537z" clip-rule="evenodd" /></svg>`,
};


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
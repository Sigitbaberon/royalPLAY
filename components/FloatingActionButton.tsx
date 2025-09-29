import React, { useState } from 'react';
import { PlusIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/solid';

interface FloatingActionButtonProps {
    onBuyClick: () => void;
    onSellClick: () => void;
    buyEnabled: boolean;
    sellEnabled: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onBuyClick, onSellClick, buyEnabled, sellEnabled }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!buyEnabled && !sellEnabled) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div className="relative flex flex-col-reverse items-center gap-4">
                
                {/* Buy Button */}
                {buyEnabled && (
                    <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'}`} style={{ transitionDelay: isOpen ? '100ms' : '0ms' }}>
                        <button
                            onClick={() => { onBuyClick(); setIsOpen(false); }}
                            className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-green-600 text-white shadow-lg transform hover:scale-110 transition-transform"
                            aria-label="Beli Chip"
                        >
                            <ArrowTrendingDownIcon className="w-6 h-6" />
                            <span className="font-semibold text-sm">Beli</span>
                        </button>
                    </div>
                )}
                
                {/* Sell Button */}
                {sellEnabled && (
                     <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'}`} style={{ transitionDelay: isOpen ? (buyEnabled ? '200ms' : '100ms') : '0ms' }}>
                        <button
                            onClick={() => { onSellClick(); setIsOpen(false); }}
                            className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-purple-600 text-white shadow-lg transform hover:scale-110 transition-transform"
                            aria-label="Jual Chip"
                        >
                            <ArrowTrendingUpIcon className="w-6 h-6" />
                            <span className="font-semibold text-sm">Jual</span>
                        </button>
                    </div>
                )}

                {/* Main FAB */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-yellow-500 text-white shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-110 hover:rotate-12 z-10"
                    aria-label="Buka menu transaksi"
                    aria-expanded={isOpen}
                >
                    <PlusIcon className={`w-7 h-7 transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`} />
                </button>
            </div>
        </div>
    );
};

export default FloatingActionButton;
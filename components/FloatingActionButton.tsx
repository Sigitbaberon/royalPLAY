import React, { useState } from 'react';
import { PlusIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon, XMarkIcon } from '@heroicons/react/24/solid';

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
            <div className="relative flex flex-col items-center gap-3">
                {/* Sell Button */}
                {sellEnabled && (
                     <button
                        onClick={() => { onSellClick(); setIsOpen(false); }}
                        className={`flex items-center gap-2 p-3 rounded-full bg-purple-600 text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}
                        aria-label="Jual Chip"
                    >
                        <ArrowTrendingUpIcon className="w-6 h-6" />
                        <span className={`transition-all duration-200 whitespace-nowrap ${isOpen ? 'w-auto opacity-100 ml-2' : 'w-0 opacity-0'}`}>Jual Cepat</span>
                    </button>
                )}
                
                {/* Buy Button */}
                {buyEnabled && (
                    <button
                        onClick={() => { onBuyClick(); setIsOpen(false); }}
                        className={`flex items-center gap-2 p-3 rounded-full bg-green-600 text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}
                        style={{ transitionDelay: isOpen ? '50ms' : '0ms' }}
                        aria-label="Beli Chip"
                    >
                        <ArrowTrendingDownIcon className="w-6 h-6" />
                        <span className={`transition-all duration-200 whitespace-nowrap ${isOpen ? 'w-auto opacity-100 ml-2' : 'w-0 opacity-0'}`}>Beli Cepat</span>
                    </button>
                )}

                {/* Main FAB */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 text-white shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-110 hover:rotate-12"
                    aria-label="Buka menu transaksi"
                >
                    <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45 scale-90' : 'rotate-0'}`}>
                        <PlusIcon className="w-7 h-7" />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default FloatingActionButton;
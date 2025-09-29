import React, { useState } from 'react';
import UserForm from './UserForm';
import TransactionTracker from './TransactionTracker';
import GlobalHistoryFeed from './GlobalHistoryFeed';
import BuyChipView from './BuyChipView';
import { useData } from '../context/DataContext';
import FloatingActionButton from './FloatingActionButton';
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/solid';

type ViewState = 'form' | 'tracker';

const UserView: React.FC = () => {
    const { settings } = useData();
    const { sellChip, buyChip } = settings.enabledFeatures;

    // This state determines which form is shown, or null for the main selection.
    const [activeForm, setActiveForm] = useState<'sell' | 'buy' | null>(() => {
        if (buyChip && sellChip) return null; // START WITH SELECTION
        if (buyChip) return 'buy';
        if (sellChip) return 'sell';
        return null;
    });

    // This state handles the transaction tracker view.
    const [view, setView] = useState<ViewState>('form');
    const [transactionId, setTransactionId] = useState<string | null>(null);

    // Effect to react to admin toggling features.
    React.useEffect(() => {
        // If the currently active form is disabled by admin, reset to the main menu/view.
        if ((activeForm === 'buy' && !buyChip) || (activeForm === 'sell' && !sellChip)) {
            setActiveForm(buyChip && sellChip ? null : buyChip ? 'buy' : sellChip ? 'sell' : null);
        }
        
        // If we are on the selection screen, but one of the options gets disabled, switch to the remaining one.
        if (activeForm === null) {
            if (buyChip && !sellChip) setActiveForm('buy');
            else if (sellChip && !buyChip) setActiveForm('sell');
        }

    }, [sellChip, buyChip, activeForm]);


    const handleTransactionComplete = (id: string) => {
        setTransactionId(id);
        setView('tracker');
    };

    const backToSelection = () => setActiveForm(null);

    // This function is called to return to the form view from tracker or via FAB
    const showForm = (formType: 'sell' | 'buy') => {
        setView('form');
        setTransactionId(null);
        setActiveForm(formType);
    }
    
    const renderMainContent = () => {
        // First, always prioritize showing the tracker if a transaction was just completed.
        if (view === 'tracker' && transactionId) {
             return <TransactionTracker 
                initialTransactionId={transactionId} 
                onBackToForm={() => {
                    setView('form');
                    setTransactionId(null);
                    // Go back to selection menu if both are active, otherwise go to the single active form
                    setActiveForm(buyChip && sellChip ? null : buyChip ? 'buy' : sellChip ? 'sell' : null);
                }} 
            />
        }

        // --- CORE LOGIC FIX ---
        // If both features are enabled AND no form is chosen yet, show the selection menu.
        if (buyChip && sellChip && activeForm === null) {
            return (
                <div className="max-w-4xl mx-auto text-center animate-slide-in-up">
                    <h2 className="text-5xl font-extrabold text-white mb-4">Selamat Datang di {settings.branding.appName}</h2>
                    <p className="text-slate-300 mb-12 text-lg">Platform Jual Beli Chip #1 di Indonesia. Pilih transaksi Anda.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Buy Card */}
                        <div 
                            onClick={() => setActiveForm('buy')} 
                            className="glass-pane rounded-2xl p-8 cursor-pointer group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-2"
                        >
                            <div className="absolute top-0 right-0 h-32 w-32 bg-green-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="relative z-10">
                                <ArrowTrendingDownIcon className="w-16 h-16 text-green-400 mb-4 mx-auto md:mx-0" />
                                <h3 className="text-3xl font-bold text-white mb-2">Beli Chip</h3>
                                <p className="text-slate-400 mb-6">Dapatkan chip dengan harga terbaik dan proses instan. Kirim langsung ke ID game Anda.</p>
                                <span className="font-bold text-lg text-green-400 group-hover:text-white transition-colors">Mulai Beli &rarr;</span>
                            </div>
                        </div>
                         {/* Sell Card */}
                        <div 
                            onClick={() => setActiveForm('sell')} 
                            className="glass-pane rounded-2xl p-8 cursor-pointer group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2"
                        >
                            <div className="absolute top-0 right-0 h-32 w-32 bg-purple-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="relative z-10">
                                <ArrowTrendingUpIcon className="w-16 h-16 text-purple-400 mb-4 mx-auto md:mx-0" />
                                <h3 className="text-3xl font-bold text-white mb-2">Jual Chip</h3>
                                <p className="text-slate-400 mb-6">Uangkan chip Anda dengan kurs tertinggi. Pembayaran aman dan cepat ke rekening Anda.</p>
                                <span className="font-bold text-lg text-purple-400 group-hover:text-white transition-colors">Mulai Jual &rarr;</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        
        // Show the specific form based on activeForm state or if only one is enabled
        if ((activeForm === 'buy' || (buyChip && !sellChip))) {
            return buyChip ? <BuyChipView onComplete={handleTransactionComplete} onBackToSelection={buyChip && sellChip ? backToSelection : undefined} /> : null;
        }
        if ((activeForm === 'sell' || (sellChip && !buyChip))) {
            return sellChip ? <UserForm onComplete={handleTransactionComplete} onBackToSelection={buyChip && sellChip ? backToSelection : undefined} /> : null;
        }

        // Default case: No features are enabled at all.
        return (
             <div className="glass-pane p-8 rounded-2xl max-w-lg mx-auto text-center">
                <h3 className="text-xl font-bold text-yellow-300">Layanan Dinonaktifkan</h3>
                <p className="text-slate-400 mt-2">Fitur jual dan beli chip sedang tidak tersedia saat ini. Silakan coba lagi nanti.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2">
               {renderMainContent()}
            </div>
            <div className="hidden lg:block">
                 {settings.enabledFeatures.globalHistory && <GlobalHistoryFeed />}
            </div>
            
            <FloatingActionButton 
                onBuyClick={() => showForm('buy')}
                onSellClick={() => showForm('sell')}
                buyEnabled={buyChip}
                sellEnabled={sellChip}
            />
        </div>
    );
};

export default UserView;
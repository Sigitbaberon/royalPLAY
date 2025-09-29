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
                <div className="glass-pane p-12 rounded-2xl max-w-lg mx-auto text-center animate-fade-in-up">
                    <h2 className="text-3xl font-bold text-white mb-4">Selamat Datang di {settings.branding.appName}</h2>
                    <p className="text-slate-400 mb-8">Pilih transaksi yang ingin Anda lakukan.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={() => setActiveForm('buy')} className="btn-shimmer flex-1 flex justify-center items-center gap-3 py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105">
                            <ArrowTrendingDownIcon className="w-6 h-6" /> Beli Chip
                        </button>
                        <button onClick={() => setActiveForm('sell')} className="btn-shimmer flex-1 flex justify-center items-center gap-3 py-4 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105">
                           <ArrowTrendingUpIcon className="w-6 h-6" /> Jual Chip
                        </button>
                    </div>
                </div>
            );
        }
        
        // Show the specific form based on activeForm state or if only one is enabled
        if ((activeForm === 'buy' || (buyChip && !sellChip))) {
            return buyChip ? <BuyChipView onComplete={handleTransactionComplete} /> : null;
        }
        if ((activeForm === 'sell' || (sellChip && !buyChip))) {
            return sellChip ? <UserForm onComplete={handleTransactionComplete} /> : null;
        }

        // Default case: No features are enabled at all.
        return (
             <div className="glass-pane p-8 rounded-2xl max-w-lg mx-auto text-center">
                <h3 className="text-xl font-bold text-amber-300">Layanan Dinonaktifkan</h3>
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
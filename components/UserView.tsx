import React, { useState } from 'react';
import UserForm from './UserForm';
import TransactionTracker from './TransactionTracker';
import GlobalHistoryFeed from './GlobalHistoryFeed';
import BuyChipView from './BuyChipView';
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/solid';

type UserAction = 'sell' | 'buy';
type ViewState = 'form' | 'tracker';

const UserView: React.FC = () => {
    const [action, setAction] = useState<UserAction>('sell');
    const [view, setView] = useState<ViewState>('form');
    const [transactionId, setTransactionId] = useState<string | null>(null);

    const handleTransactionComplete = (id: string) => {
        setTransactionId(id);
        setView('tracker');
    };

    const switchToForm = () => {
        setView('form');
        setTransactionId(null);
    }
    
    const renderActionView = () => {
        if (view === 'tracker') {
             return <TransactionTracker 
                initialTransactionId={transactionId} 
                onBackToForm={switchToForm} 
            />
        }
        switch(action) {
            case 'sell':
                return <UserForm onComplete={handleTransactionComplete} />;
            case 'buy':
                return <BuyChipView onComplete={handleTransactionComplete} />;
            default:
                return null;
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2">
                <div className="max-w-lg mx-auto mb-8">
                     <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/30 rounded-xl glass-pane">
                         <button 
                            onClick={() => {setAction('sell'); setView('form');}}
                            className={`py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 ${action === 'sell' ? 'bg-purple-600 text-white shadow-[0_0_15px_theme(colors.purple.500)]' : 'hover:bg-purple-500/10'}`}>
                             <ArrowTrendingUpIcon className="h-5 w-5" /> Jual Chip
                         </button>
                         <button 
                            onClick={() => {setAction('buy'); setView('form');}}
                            className={`py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 ${action === 'buy' ? 'bg-green-600 text-white shadow-[0_0_15px_theme(colors.green.500)]' : 'hover:bg-green-500/10'}`}>
                              <ArrowTrendingDownIcon className="h-5 w-5" /> Beli Chip
                         </button>
                     </div>
                </div>
               {renderActionView()}
            </div>
            <div className="hidden lg:block">
                 <GlobalHistoryFeed />
            </div>
        </div>
    );
};

export default UserView;
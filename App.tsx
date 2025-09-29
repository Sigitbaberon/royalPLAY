
import React, { useState, useCallback, useMemo } from 'react';
import { DataProvider, useData } from './context/DataContext';
import AdminPanel from './components/AdminPanel';
import UserView from './components/UserView';
import { LockClosedIcon, UserIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { APP_NAME, APP_LOGO, GAME_PROVIDER_LOGOS } from './constants';
import ToastContainer from './components/ToastContainer';
import AdminPinModal from './components/AdminPinModal';

type View = 'user' | 'admin';

const LiveRateTicker: React.FC = () => {
    const { settings } = useData();
    const sellRateText = `JUAL: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(settings.exchangeRate)} / 1B`;
    const buyRateText = `BELI: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(settings.buyRate)} / 1B`;
    return (
        <div className="bg-black/50 overflow-hidden border-t border-b border-purple-500/10">
            <div className="animate-marquee whitespace-nowrap py-1.5 text-xs font-semibold">
                <span className="mx-4 text-amber-400">{sellRateText}</span>
                <span className="mx-4 text-green-400">{buyRateText}</span>
                <span className="mx-4 text-purple-400">TRANSAKSI AMAN & TERPROSES OTOMATIS 24/7</span>
                <span className="mx-4 text-amber-400">{sellRateText}</span>
                <span className="mx-4 text-green-400">{buyRateText}</span>
                <span className="mx-4 text-purple-400">PLATFORM JUAL BELI CHIP #1 DI INDONESIA</span>
                <span className="mx-4 text-amber-400">{sellRateText}</span>
                <span className="mx-4 text-green-400">{buyRateText}</span>
            </div>
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    width: 200%;
                    display: inline-block;
                    animation: marquee 40s linear infinite;
                }
            `}</style>
        </div>
    );
}

const GameProviderCarousel: React.FC = () => {
    const logos = useMemo(() => [...GAME_PROVIDER_LOGOS, ...GAME_PROVIDER_LOGOS], []);
    return (
        <div className="w-full py-8">
            <div className="carousel-container">
                <div className="carousel-track">
                    {logos.map((logo, index) => (
                        <div key={index} className="carousel-item" dangerouslySetInnerHTML={{ __html: logo }}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AppContent: React.FC = () => {
    const [view, setView] = useState<View>('user');
    const [isPinModalOpen, setPinModalOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    const switchToAdmin = useCallback(() => setPinModalOpen(true), []);
    const handlePinSuccess = useCallback(() => {
        setView('admin');
        setPinModalOpen(false);
    }, []);
    const switchToUser = useCallback(() => setView('user'), []);

    return (
        <div className="min-h-screen bg-transparent font-sans relative z-10 flex flex-col">
            <header className="bg-black/30 backdrop-blur-lg border-b border-purple-500/20 sticky top-0 z-50">
                <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                         <div dangerouslySetInnerHTML={{ __html: APP_LOGO }} />
                        <h1 className="text-2xl font-bold text-white tracking-wider uppercase">
                            {APP_NAME}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-slate-400 hover:text-white transition-colors">
                            {isMuted ? <SpeakerXMarkIcon className="h-5 w-5" /> : <SpeakerWaveIcon className="h-5 w-5" />}
                        </button>
                        {view === 'user' ? (
                            <button
                                onClick={switchToAdmin}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm font-semibold transition-all text-purple-300 hover:text-white hover:border-purple-500/70 btn-shimmer"
                            >
                                <LockClosedIcon className="h-4 w-4" />
                                Admin Panel
                            </button>
                        ) : (
                            <button
                                onClick={switchToUser}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500/80 hover:bg-amber-500 border border-amber-500/50 rounded-lg text-sm text-white font-semibold transition-colors btn-shimmer"
                            >
                                <UserIcon className="h-4 w-4" />
                                Tampilan Pengguna
                            </button>
                        )}
                    </div>
                </nav>
                 <LiveRateTicker />
            </header>

            <main className="container mx-auto px-4 sm:px-6 py-12 flex-grow">
                {view === 'user' ? <UserView /> : <AdminPanel />}
            </main>
            
            <footer className="text-center py-6 text-slate-500 text-xs border-t border-purple-500/10 mt-12">
                <GameProviderCarousel />
                <p>&copy; {new Date().getFullYear()} {APP_NAME}. Platform Jual Beli Chip Premium.</p>
                <p className="mt-1">Semua transaksi dienkripsi dan diproses dengan aman. Layanan 24/7.</p>
            </footer>
            <ToastContainer />
            <AdminPinModal 
                isOpen={isPinModalOpen}
                onClose={() => setPinModalOpen(false)}
                onSuccess={handlePinSuccess}
            />
        </div>
    );
};

const App: React.FC = () => (
    <DataProvider>
        <AppContent />
    </DataProvider>
);

export default App;

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DataProvider, useData } from './context/DataContext';
import AdminPanel from './components/AdminPanel';
import UserView from './components/UserView';
import { LockClosedIcon, UserIcon, WrenchScrewdriverIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import ToastContainer from './components/ToastContainer';
import AdminPinModal from './components/AdminPinModal';
import ChatWidget from './components/ChatWidget';

type View = 'user' | 'admin';

const LiveRateTicker: React.FC<{announcement?: string}> = ({ announcement }) => {
    const { settings } = useData();
    const sellRateText = `JUAL: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(settings.exchangeRate)} / 1B`;
    const buyRateText = `BELI: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(settings.buyRate)} / 1B`;
    
    const messages = [
        sellRateText,
        buyRateText,
        announcement || "TRANSAKSI AMAN & TERPROSES OTOMATIS 24/7",
        sellRateText,
        buyRateText,
        announcement || "PLATFORM JUAL BELI CHIP #1 DI INDONESIA",
        sellRateText,
        buyRateText,
    ];

    return (
        <div className="bg-black/50 overflow-hidden border-t border-b border-purple-500/10">
            <div className="animate-marquee whitespace-nowrap py-1.5 text-xs font-semibold">
                {messages.map((msg, i) => (
                    <span key={i} className={`mx-4 ${i % 3 === 0 ? 'text-amber-400' : i % 3 === 1 ? 'text-green-400' : 'text-purple-400'}`}>{msg}</span>
                ))}
            </div>
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: inline-block;
                    animation: marquee 40s linear infinite;
                    /* Calculate width based on content to ensure smooth loop */
                    width: ${Math.max(200, messages.join('').length / 2)}%;
                }
            `}</style>
        </div>
    );
}

const PartnershipSection: React.FC = () => {
  const { settings } = useData();
  if (!settings.enabledFeatures.providerCarousel) {
    return null;
  }

  const partnerLogos = useMemo(() => {
    const logos = settings.partners.map(p => p.logoUrl ? `<img src="${p.logoUrl}" alt="${p.name}"/>` : `<div class="text-slate-300 font-semibold text-center text-lg">${p.name}</div>`);
    // Duplicate for seamless scroll
    return [...logos, ...logos];
  }, [settings.partners]);

  useEffect(() => {
    const logoUrls = settings.partners.filter(p => p.logoUrl).map(p => p.logoUrl);
    (window as any).PROVIDER_LOGOS_FOR_ANIMATION = logoUrls;
     if (typeof (window as any).generateBackgroundAnimations === 'function') {
        (window as any).generateBackgroundAnimations();
    }
  }, [settings.partners]);


  return (
    <div className="py-12">
      <h2 className="text-center text-base font-semibold text-slate-400 tracking-widest uppercase mb-8">
        Didukung Penuh Oleh Mitra Terpercaya
      </h2>
      <div className="w-full">
            <div className="carousel-container">
                <div className="carousel-track">
                    {partnerLogos.map((logoHtml, index) => (
                        <div key={index} className="carousel-item flex items-center justify-center" dangerouslySetInnerHTML={{ __html: logoHtml }}></div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};


const MaintenanceView: React.FC = () => (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="glass-pane p-12 rounded-2xl max-w-md w-full">
            <WrenchScrewdriverIcon className="h-20 w-20 mx-auto text-amber-400 animate-pulse" />
            <h1 className="text-4xl font-bold text-white mt-6">Under Maintenance</h1>
            <p className="text-slate-400 mt-4">
                Kami sedang melakukan beberapa pembaruan untuk meningkatkan pengalaman Anda.
                Platform akan segera kembali online. Terima kasih atas kesabaran Anda!
            </p>
        </div>
    </div>
);


const AppContent: React.FC = () => {
    const [view, setView] = useState<View>('user');
    const [isPinModalOpen, setPinModalOpen] = useState(false);
    const { settings } = useData();

    const { appName, appLogoSvg } = settings.branding;

    useEffect(() => {
        document.title = `${appName} | Platform Jual Beli Chip #1`;
    }, [appName]);

    const switchToAdmin = useCallback(() => setPinModalOpen(true), []);
    const handlePinSuccess = useCallback(() => {
        setView('admin');
        setPinModalOpen(false);
    }, []);
    const switchToUser = useCallback(() => setView('user'), []);

    // If in maintenance mode and not an admin, show maintenance view
    if (settings.maintenanceMode && view !== 'admin') {
        return (
             <div className="min-h-screen bg-transparent font-sans relative z-10 flex flex-col">
                <header className="bg-black/30 backdrop-blur-lg border-b border-purple-500/20 sticky top-0 z-50">
                    <nav className="container mx-auto px-6 py-3 flex justify-start items-center">
                        <div className="flex items-center gap-4">
                            <div dangerouslySetInnerHTML={{ __html: appLogoSvg }} />
                            <h1 className="text-2xl font-bold text-white tracking-wider uppercase">
                                {appName}
                            </h1>
                            <button
                                onClick={switchToAdmin}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm font-semibold transition-all text-purple-300 hover:text-white hover:border-purple-500/70 btn-shimmer"
                            >
                                <LockClosedIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Admin Panel</span>
                            </button>
                        </div>
                    </nav>
                </header>
                <main className="container mx-auto px-4 sm:px-6 py-12 flex-grow">
                    <MaintenanceView />
                </main>
                <AdminPinModal 
                    isOpen={isPinModalOpen}
                    onClose={() => setPinModalOpen(false)}
                    onSuccess={handlePinSuccess}
                />
             </div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent font-sans relative z-10 flex flex-col">
            <header className="bg-black/30 backdrop-blur-lg border-b border-purple-500/20 sticky top-0 z-50">
                <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                         <div dangerouslySetInnerHTML={{ __html: appLogoSvg }} />
                        <h1 className="text-2xl font-bold text-white tracking-wider uppercase">
                            {appName}
                        </h1>
                        {view === 'user' ? (
                            <button
                                onClick={switchToAdmin}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm font-semibold transition-all text-purple-300 hover:text-white hover:border-purple-500/70 btn-shimmer"
                            >
                                <LockClosedIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Admin Panel</span>
                            </button>
                        ) : (
                            <button
                                onClick={switchToUser}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500/80 hover:bg-amber-500 border border-amber-500/50 rounded-lg text-sm text-white font-semibold transition-colors btn-shimmer"
                            >
                                <UserIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Tampilan Pengguna</span>
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {/* VIP, Affiliate, and Speaker buttons removed */}
                    </div>
                </nav>
                 <LiveRateTicker announcement={settings.announcement} />
            </header>

            <main className="container mx-auto px-4 sm:px-6 py-12 flex-grow">
                {view === 'user' ? <UserView /> : <AdminPanel />}
            </main>
            
            {view === 'user' && <PartnershipSection />}
            
            <footer className="text-center py-6 text-slate-500 text-xs border-t border-purple-500/10 mt-12">
                <p>&copy; {new Date().getFullYear()} {appName}. Platform Jual Beli Chip Premium.</p>
                <p className="mt-1">Semua transaksi dienkripsi dan diproses dengan aman. Layanan 24/7.</p>
            </footer>
            <ToastContainer />
            <AdminPinModal 
                isOpen={isPinModalOpen}
                onClose={() => setPinModalOpen(false)}
                onSuccess={handlePinSuccess}
            />
            {view === 'user' && settings.chatSettings.enabled && <ChatWidget />}
        </div>
    );
};

const App: React.FC = () => (
    <DataProvider>
        <AppContent />
    </DataProvider>
);

export default App;

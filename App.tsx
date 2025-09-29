import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DataProvider, useData } from './context/DataContext';
import AdminPanel from './components/AdminPanel';
import UserView from './components/UserView';
import { LockClosedIcon, UserIcon, WrenchScrewdriverIcon, ChatBubbleLeftRightIcon, SparklesIcon, ShareIcon } from '@heroicons/react/24/solid';
import ToastContainer from './components/ToastContainer';
import AdminPinModal from './components/AdminPinModal';
import ChatWidget from './components/ChatWidget';
import VipModal from './components/VipModal';
import AffiliateModal from './components/AffiliateModal';
import { TransactionStatus } from './types';

type View = 'user' | 'admin';

const LiveRateTicker: React.FC<{announcement?: string}> = ({ announcement }) => {
    const { settings } = useData();
    const sellRateText = `JUAL: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(settings.exchangeRate)} / 1B`;
    const buyRateText = `BELI: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(settings.buyRate)} / 1B`;
    
    const messages = useMemo(() => [
        sellRateText,
        buyRateText,
        announcement || "TRANSAKSI AMAN & TERPROSES OTOMATIS 24/7",
        ` • ${sellRateText}`,
        buyRateText,
        announcement || "PLATFORM JUAL BELI CHIP #1 DI INDONESIA",
    ], [sellRateText, buyRateText, announcement]);

    const fullMessageString = useMemo(() => messages.join(' • '), [messages]);

    return (
        <div className="bg-black/50 overflow-hidden border-t border-b border-[var(--border-color)] relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-yellow-500/10 opacity-50"></div>
            <div className="marquee-container text-xs font-bold tracking-wider py-2.5">
                <span className="text-purple-400">{fullMessageString} •&nbsp;</span>
                <span className="text-yellow-400">{fullMessageString} •&nbsp;</span>
                <span className="text-green-400">{fullMessageString} •&nbsp;</span>
                <span className="text-purple-400">{fullMessageString} •&nbsp;</span>
            </div>
            <style>{`
                .marquee-container {
                    white-space: nowrap;
                    animation: marquee 80s linear infinite;
                }
                .group:hover .marquee-container {
                    animation-play-state: paused;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
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
    const logos = settings.partners.map(p => p.logoUrl ? `<img src="${p.logoUrl}" alt="${p.name}" class="max-h-12 w-auto object-contain"/>` : `<div class="text-slate-300 font-semibold text-center text-lg">${p.name}</div>`);
    // Duplicate for seamless scroll
    return [...logos, ...logos];
  }, [settings.partners]);


  return (
    <div className="py-24">
      <h2 className="text-center text-base font-semibold text-slate-400 tracking-widest uppercase mb-12 animate-slide-in-up">
        Didukung Penuh Oleh Mitra Terpercaya
      </h2>
      <div className="w-full animate-slide-in-up" style={{animationDelay: '150ms'}}>
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
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 -mt-24">
        <div className="glass-pane p-12 rounded-2xl max-w-md w-full animate-slide-in-up">
            <WrenchScrewdriverIcon className="h-20 w-20 mx-auto text-yellow-400 animate-pulse" />
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
    const [isVipModalOpen, setVipModalOpen] = useState(false);
    const [isAffiliateModalOpen, setAffiliateModalOpen] = useState(false);
    const { settings, updateTransactionStatus, showToast } = useData();

    const { appName, appLogoSvg } = settings.branding;

    useEffect(() => {
        document.title = `${appName} | Platform Jual Beli Chip #1`;
    }, [appName]);

    // This effect handles transaction updates from Telegram links.
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const txId = urlParams.get('tx_id');
        const newStatus = urlParams.get('new_status') as TransactionStatus;
        const adminSecret = urlParams.get('admin_secret');

        if (txId && newStatus && adminSecret) {
            // Immediately clear the params from URL to prevent re-triggering on refresh
            window.history.replaceState({}, document.title, window.location.pathname);

            if (adminSecret === settings.adminPin) {
                if (Object.values(TransactionStatus).includes(newStatus)) {
                    updateTransactionStatus(txId, newStatus);
                    showToast(`Transaksi ${txId} berhasil diupdate ke status "${newStatus}".`, 'success');
                } else {
                    showToast(`Status "${newStatus}" tidak valid.`, 'error');
                }
            } else {
                showToast('Kunci rahasia admin tidak valid. Aksi dibatalkan.', 'error');
            }
        }
    }, [settings.adminPin, updateTransactionStatus, showToast]);

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
                <header className="bg-black/30 backdrop-blur-lg border-b border-[var(--border-color)] sticky top-0 z-50">
                    <nav className="container mx-auto px-6 py-4 flex justify-start items-center">
                        <div className="flex items-center gap-4">
                            <div dangerouslySetInnerHTML={{ __html: appLogoSvg }} />
                            <h1 className="text-2xl font-bold text-white tracking-wider uppercase">
                                {appName}
                            </h1>
                            <button
                                onClick={switchToAdmin}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-purple-600/30 border border-purple-600/40 rounded-lg text-sm font-semibold transition-all text-purple-300 hover:text-white hover:border-purple-500/70"
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
            <header className="bg-black/30 backdrop-blur-lg border-b border-[var(--border-color)] sticky top-0 z-50">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                         <div dangerouslySetInnerHTML={{ __html: appLogoSvg }} />
                        <h1 className="text-2xl font-bold text-white tracking-wider uppercase">
                            {appName}
                        </h1>
                        {view === 'user' ? (
                            <button
                                onClick={switchToAdmin}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-purple-600/30 border border-purple-600/40 rounded-lg text-sm font-semibold transition-all text-purple-300 hover:text-white hover:border-purple-500/70"
                            >
                                <LockClosedIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Admin Panel</span>
                            </button>
                        ) : (
                            <button
                                onClick={switchToUser}
                                className="flex items-center gap-2 px-3 py-2 bg-yellow-500/80 hover:bg-yellow-500 border border-yellow-500/50 rounded-lg text-sm text-black font-semibold transition-colors btn-shimmer"
                            >
                                <UserIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Tampilan Pengguna</span>
                            </button>
                        )}
                    </div>
                    {view === 'user' && (
                        <div className="flex items-center gap-2">
                             {settings.vipSystem.enabled && (
                                <button onClick={() => setVipModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-lg text-sm font-semibold transition-all text-yellow-300 hover:text-white">
                                    <SparklesIcon className="h-4 w-4" />
                                    <span className="hidden sm:inline">Program VIP</span>
                                </button>
                            )}
                             {settings.affiliateSystem.enabled && (
                                <button onClick={() => setAffiliateModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-sm font-semibold transition-all text-green-300 hover:text-white">
                                    <ShareIcon className="h-4 w-4" />
                                    <span className="hidden sm:inline">Afiliasi</span>
                                </button>
                            )}
                        </div>
                    )}
                </nav>
                 <LiveRateTicker announcement={settings.announcement} />
            </header>

            <main className="container mx-auto px-4 sm:px-6 py-12 flex-grow">
                {view === 'user' ? <UserView /> : <AdminPanel />}
            </main>
            
            {view === 'user' && <PartnershipSection />}
            
            <footer className="text-center py-8 text-slate-500 text-sm border-t border-[var(--border-color)] mt-16">
                <p>&copy; {new Date().getFullYear()} {appName}. Platform Jual Beli Chip Premium.</p>
                <p className="mt-1 text-xs">Semua transaksi dienkripsi dan diproses dengan aman. Layanan 24/7.</p>
            </footer>

            {/* Modals & Widgets */}
            <ToastContainer />
            <AdminPinModal 
                isOpen={isPinModalOpen}
                onClose={() => setPinModalOpen(false)}
                onSuccess={handlePinSuccess}
            />
             <VipModal isOpen={isVipModalOpen} onClose={() => setVipModalOpen(false)} />
             <AffiliateModal isOpen={isAffiliateModalOpen} onClose={() => setAffiliateModalOpen(false)} />

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

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, UserCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { ChatMessage } from '../types';

const ChatWidget: React.FC = () => {
    const { settings, chatLogs, sendChatMessage } = useData();
    const { agentName, welcomeMessage } = settings.chatSettings;
    
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'pre-chat' | 'chat'>('pre-chat');
    const [gameId, setGameId] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chatHistory = useMemo(() => chatLogs[gameId] || [], [chatLogs, gameId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [chatHistory, isTyping]);
    
    useEffect(() => {
        if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].sender === 'user') {
            setIsTyping(true);
            const timer = setTimeout(() => {
                setIsTyping(false);
            }, 1400); // Just before agent response
            return () => clearTimeout(timer);
        }
    }, [chatHistory]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && gameId) {
            sendChatMessage(gameId, inputValue.trim());
            setInputValue('');
        }
    };
    
    const handleStartChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (gameId.trim()) {
            setStep('chat');
        }
    }
    
    const handleClose = () => {
        setIsOpen(false);
        // Reset to pre-chat after a delay to allow for closing animation
        setTimeout(() => {
            setStep('pre-chat');
        }, 300);
    }
    
    const MessageBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
        const isUser = msg.sender === 'user';
        return (
            <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-2.5 ${isUser ? 'bg-purple-600 text-white rounded-br-lg' : 'bg-slate-700 text-slate-200 rounded-bl-lg'}`}>
                    <p className="text-sm">{msg.text}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            <div className={`
                flex flex-col
                glass-pane rounded-2xl overflow-hidden
                transition-all duration-300 ease-in-out
                ${isOpen ? 'w-[calc(100vw-2rem)] max-w-sm h-[60vh] opacity-100' : 'w-0 h-0 opacity-0 pointer-events-none'}
            `}>
                <div className="flex-shrink-0 p-4 bg-black/30 border-b border-purple-500/20 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-white">{step === 'chat' ? `Chat (${gameId})` : agentName}</h3>
                        <p className="text-xs text-green-400">Online</p>
                    </div>
                    <button onClick={handleClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {step === 'pre-chat' ? (
                     <div className="flex-1 p-6 flex flex-col justify-center text-center">
                        <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto text-purple-400" />
                        <h3 className="text-lg font-bold text-white mt-4">Butuh Bantuan?</h3>
                        <p className="text-slate-400 text-sm mt-2 mb-6">Masukkan ID Game Anda untuk memulai percakapan dengan tim support kami.</p>
                         <form onSubmit={handleStartChat} className="flex flex-col items-center gap-3">
                            <div className="relative w-full">
                                <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                <input
                                    type="text"
                                    value={gameId}
                                    onChange={(e) => setGameId(e.target.value)}
                                    placeholder="Masukkan ID Game Anda"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                />
                            </div>
                            <button type="submit" className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg transition-all disabled:bg-slate-600" disabled={!gameId.trim()}>
                                Mulai Chat <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                            <div className="flex justify-start">
                                <div className="max-w-xs md:max-w-sm rounded-2xl px-4 py-2.5 bg-slate-700 text-slate-200 rounded-bl-lg">
                                <p className="text-sm">{welcomeMessage}</p>
                                </div>
                            </div>
                            {chatHistory.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="rounded-2xl px-4 py-2.5 bg-slate-700 text-slate-200 rounded-bl-lg">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                    </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <form onSubmit={handleSendMessage} className="flex-shrink-0 p-3 bg-black/30 border-t border-purple-500/20">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ketik pesan..."
                                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                />
                                <button type="submit" className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:bg-slate-600" disabled={!inputValue.trim()}>
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>

            {/* FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    absolute bottom-0 right-0 p-4 rounded-full text-white shadow-2xl 
                    transition-all duration-300 ease-in-out transform hover:scale-110 
                    ${isOpen ? 'bg-red-600 opacity-0 pointer-events-none' : 'bg-gradient-to-br from-purple-500 to-amber-500'}
                `}
                aria-label="Buka Live Chat"
            >
                <ChatBubbleLeftRightIcon className="w-7 h-7" />
            </button>
        </div>
    );
};

export default ChatWidget;

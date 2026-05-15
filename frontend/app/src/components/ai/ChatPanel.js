// frontend/app/src/components/ai/ChatPanel.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaComment, FaTimes, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const panelVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } },
};

function ChatPanel() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 'welcome', role: 'assistant', text: t('chatPanel.welcome', 'Hello! I\'m your GoalMaster AI assistant. Ask me anything about your goals!') },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen, messages, scrollToBottom]);

    const handleSend = useCallback(async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        const userMessage = { id: Date.now().toString(), role: 'user', text: trimmed };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/ai/chat`,
                { message: trimmed },
                { headers: { Authorization: token ? `Bearer ${token}` : '' } }
            );

            const aiText = response?.data?.reply || response?.data?.response || response?.data?.message || t('chatPanel.noResponse', 'No response received.');
            const aiMessage = { id: (Date.now() + 1).toString(), role: 'assistant', text: aiText };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            const errorMsg = err?.response?.data?.message || err.message || t('chatPanel.error', 'Sorry, I encountered an error. Please make sure Ollama is running on the server.');
            setError(errorMsg);
            const errorMessage = { id: (Date.now() + 1).toString(), role: 'assistant', text: errorMsg, isError: true };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, t]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating button */}
            <motion.button
                className="fixed bottom-6 right-6 z-[1001] w-14 h-14 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_4px_16px_rgba(0,0,0,0.25)] flex items-center justify-center border-none cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                aria-label={isOpen ? t('chatPanel.closeChat', 'Close chat') : t('chatPanel.openChat', 'Open chat')}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <FaTimes size={20} />
                        </motion.span>
                    ) : (
                        <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <FaComment size={20} />
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed bottom-24 right-6 z-[1000] w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-8rem)] bg-[var(--card)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-[var(--border)] flex flex-col overflow-hidden"
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <FaRobot size={20} />
                                <span className="font-semibold text-base">{t('chatPanel.title', 'AI Assistant')}</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="bg-transparent border-none text-[var(--primary-foreground)] cursor-pointer p-1 hover:opacity-80 transition-opacity"
                                aria-label={t('chatPanel.closeChat', 'Close chat')}
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 scroll-smooth">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                >
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${msg.role === 'user' ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-[var(--muted)] text-[var(--foreground)]'}`}>
                                        {msg.role === 'user' ? <FaUser size={14} /> : <FaRobot size={14} />}
                                    </div>
                                    <div
                                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] rounded-tr-sm'
                                                : msg.isError
                                                    ? 'bg-[var(--destructive-soft-bg)] text-[var(--destructive)] border border-[var(--destructive)] rounded-tl-sm'
                                                    : 'bg-[var(--muted)] text-[var(--foreground)] rounded-tl-sm'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    className="flex gap-3"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center">
                                        <FaRobot size={14} className="text-[var(--foreground)]" />
                                    </div>
                                    <div className="bg-[var(--muted)] text-[var(--foreground)] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm">
                                        <motion.span
                                            animate={{ opacity: [1, 0.4, 1] }}
                                            transition={{ duration: 1.2, repeat: Infinity }}
                                        >
                                            {t('chatPanel.thinking', 'Thinking...')}
                                        </motion.span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="px-5 py-4 border-t border-[var(--border)] bg-[var(--card)] flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={t('chatPanel.placeholder', 'Ask about your goals...')}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--ring)] focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--ring)_25%,transparent)] disabled:opacity-60"
                                />
                                <motion.button
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className="w-10 h-10 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label={t('chatPanel.send', 'Send')}
                                >
                                    <FaPaperPlane size={14} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default ChatPanel;

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';
import api from '../../services/apiService';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ChatPanel = () => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: t('assistant.welcome', { defaultValue: '¡Hola! Soy tu asistente de GoalMaster. ¿En qué puedo ayudarte hoy?' }) },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await api.sendChatMessage(userMsg);
            setMessages(prev => [...prev, { role: 'assistant', content: res?.data?.response || t('assistant.error', { defaultValue: 'No pude procesar tu mensaje.' }) }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: err.message }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--app-header-height) - 4rem)', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                background: msg.role === 'user' ? 'var(--primary)' : 'var(--card)',
                                color: msg.role === 'user' ? 'var(--primary-foreground)' : 'var(--foreground)',
                                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                            }}
                        >
                            {msg.role === 'assistant' && <FaRobot style={{ marginRight: '0.5rem', opacity: 0.7 }} />}
                            {msg.content}
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={bottomRef} />
            </div>
            <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--border)' }}>
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('assistant.placeholder', { defaultValue: 'Escribe tu mensaje...' })}
                    disabled={loading}
                    style={{ flex: 1 }}
                />
                <Button type="submit" variant="primary" disabled={loading || !input.trim()} leftIcon={<FaPaperPlane />} />
            </form>
        </div>
    );
};

export default ChatPanel;

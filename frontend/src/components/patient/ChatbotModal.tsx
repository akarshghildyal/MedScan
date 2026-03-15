'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Sparkles, Send, X } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export interface ChatbotModalProps {
    open: boolean;
    onClose: () => void;
    reportId: string | null;
    filename?: string;
}

export function ChatbotModal({ open, onClose, reportId, filename }: ChatbotModalProps) {
    const [messages, setMessages] = useState<Array<{ role: 'bot' | 'user'; text: string }>>([
        { role: 'bot', text: "Hello! I've read through your report. What questions do you have about the findings?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendQuestion = async (question: string) => {
        if (!reportId) {
            setError('Report id is missing.');
            return;
        }

        setIsTyping(true);
        setError(null);

        try {
            const response = await fetchApi('/chat/query', {
                method: 'POST',
                body: JSON.stringify({ report_id: reportId, question })
            });

            const answer = response.answer || 'Sorry, I could not generate a response.';
            setMessages(prev => [...prev, { role: 'bot', text: answer }]);
        } catch (err: any) {
            setMessages(prev => [...prev, { role: 'bot', text: err.message || 'Failed to connect to chat service.' }]);
            setError(err.message);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const question = input.trim();
        if (!question) return;

        setMessages(prev => [...prev, { role: 'user', text: question }]);
        setInput('');
        sendQuestion(question);
    };

    const suggestedQuestions = [
        "What does high HDL mean?",
        "Is my cholesterol normal?",
        "Should I change my diet?"
    ];

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed sm:bottom-8 sm:right-8 bottom-4 right-4 z-50 flex h-[70vh] w-[90vw] max-w-md flex-col rounded-xl border bg-card shadow-elevated"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Bot size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-card-foreground">MedScan AI</h3>
                                <p className="text-xs text-muted-foreground">Contextual Q&A</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Context Banner */}
                    <div className="flex items-center gap-2 border-b border-info/20 bg-info/5 px-4 py-2 text-xs text-info-foreground">
                        <Sparkles size={14} className="text-info" />
                        <span>Answering based on <strong>{filename || 'your report'}</strong></span>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-primary/10 text-primary'}`}>
                                    {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-card-foreground'}`}>
                                    {m.text}
                                </div>
                            </motion.div>
                        ))}
                        {error && (
                            <div className="text-xs text-destructive mt-2">
                                {error}
                            </div>
                        )}

                        {isTyping && (
                            <div className="flex items-center gap-1.5 py-2 pl-11">
                                {[0, 1, 2].map((dot) => (
                                    <motion.div
                                        key={dot}
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: dot * 0.15 }}
                                        className="h-2 w-2 rounded-full bg-muted-foreground/40"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t p-3 bg-card rounded-b-xl">
                        {/* Suggested Pills */}
                        {messages.length === 1 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                                {suggestedQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setInput(q);
                                        }}
                                        className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Row */}
                        <form onSubmit={handleSend} className="flex gap-2 relative">
                            <input
                                type="text"
                                placeholder="Ask a question about this report..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isTyping}
                                className="flex-1 rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-40"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50 transition-colors"
                            >
                                {isTyping ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/60 border-t-primary" /> : <Send size={16} />}
                            </button>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

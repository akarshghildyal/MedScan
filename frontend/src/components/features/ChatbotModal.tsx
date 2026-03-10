'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, TriangleAlert, Send, Activity } from 'lucide-react';
import { SuggestedQuestionPill } from '@/components/ui/SuggestedQuestionPill';
import { cn } from '@/lib/utils';
import { useDemoData } from '@/hooks/useDemoData';

interface Message {
    id: string;
    text: string;
    sender: 'ai' | 'patient';
    timestamp: string;
}

interface ChatbotModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reportContext?: string;
}

export function ChatbotModal({ open, onOpenChange, reportContext }: ChatbotModalProps) {
    const demoData = useDemoData();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open && demoData && reportContext && demoData.chatHistory[reportContext]) {
            setMessages(demoData.chatHistory[reportContext].map((m: any, idx: number) => ({
                id: `demo-msg-${idx}`,
                text: m.content,
                sender: m.role === 'user' ? 'patient' : 'ai',
                timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })));
        } else if (!open) {
            setMessages([]);
        }
    }, [open, demoData, reportContext]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = (text: string) => {
        if (!text.trim()) return;

        const newMsg: Message = {
            id: Date.now().toString(),
            text,
            sender: 'patient',
            timestamp: 'Just now'
        };

        setMessages((prev) => [...prev, newMsg]);
        setInputValue('');
        setIsTyping(true);

        // Mock AI Response
        setTimeout(() => {
            setIsTyping(false);
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    text: demoData
                        ? "This is a demo session. In a live account, MedScan's AI would analyse your specific report data and provide a detailed, contextualised response to your question. Please consult your doctor for personalised medical advice."
                        : "I've reviewed your report. A high WBC can indicate your body is fighting off an infection or experiencing inflammation. Given your other results, it is likely a mild, acute response, but you should discuss it further with your physician.",
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        }, demoData ? 1500 : 2000);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend(inputValue);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 transition-opacity duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-[70] flex h-[600px] w-full max-w-[640px] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-[8px] bg-bg-base shadow-2xl border border-border duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] focus:outline-none">

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border bg-bg-elevated px-[24px] py-[16px] shrink-0">
                        <Dialog.Title className="font-sora text-[18px] font-bold text-text-primary m-0">
                            MedScan Assistant
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-text-muted hover:text-text-primary rounded-full p-2 transition-colors focus:ring-accent focus:outline-none focus:ring-2">
                                <X className="h-5 w-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    {/* Sticky Disclaimer */}
                    <div className="chatbot-disclaimer bg-bg-surface border-b border-border py-2 px-4 flex items-center justify-center gap-2 shrink-0">
                        <TriangleAlert className="chatbot-disclaimer-icon h-3 w-3 text-status-low" />
                        <span className="chatbot-disclaimer-text text-[11px] text-text-muted uppercase tracking-wider font-medium">
                            AI-powered insights · Not a substitute for medical advice
                        </span>
                    </div>

                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-[24px] flex flex-col gap-6">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 mt-8">
                                <div className="h-12 w-12 rounded-full bg-bg-elevated flex items-center justify-center border border-border mb-4">
                                    <Activity className="h-6 w-6 text-accent" />
                                </div>
                                <SuggestedQuestionPill question="What does my high WBC mean?" onClick={handleSend} />
                                <SuggestedQuestionPill question="Is my hemoglobin within normal range?" onClick={handleSend} />
                                <SuggestedQuestionPill question="Should I be concerned about these results?" onClick={handleSend} />
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={cn("flex w-full", msg.sender === 'patient' ? "justify-end" : "justify-start")}>
                                    {msg.sender === 'ai' && (
                                        <div className="h-8 w-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center shrink-0 mr-3 mt-1">
                                            <Activity className="h-4 w-4 text-accent" />
                                        </div>
                                    )}
                                    <div className="max-w-[80%] flex flex-col gap-1">
                                        <div className={cn(
                                            "p-[16px] text-[14px] leading-[1.5] rounded-[6px]",
                                            msg.sender === 'patient'
                                                ? "bg-accent/20 text-text-primary rounded-tr-none ml-11"
                                                : "bg-bg-elevated text-text-body border border-border rounded-tl-none"
                                        )}>
                                            {msg.text}
                                        </div>
                                        <span className={cn("text-[11px] text-text-muted", msg.sender === 'patient' ? "text-right" : "text-left leading-none")}>
                                            {msg.timestamp}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}

                        {isTyping && (
                            <div className="flex w-full justify-start">
                                <div className="h-8 w-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center shrink-0 mr-3 mt-1">
                                    <Activity className="h-4 w-4 text-accent" />
                                </div>
                                <div className="bg-bg-elevated border border-border rounded-[6px] rounded-tl-none px-4 py-3 flex items-center gap-1 mt-1">
                                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-[20px] bg-bg-surface border-t border-border focus-within:bg-bg-elevated transition-colors shrink-0">
                        <div className="relative flex items-center w-full">
                            <input
                                type="text"
                                placeholder="Ask a question about your report..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full h-[44px] bg-bg-base border border-border rounded-[4px] rounded-r-none pl-[16px] pr-[16px] text-[14px] text-text-primary outline-none focus:border-accent focus:shadow-[0_0_0_1px_rgba(0,201,167,0.3)] transition-all placeholder:text-text-muted"
                                disabled={isTyping}
                            />
                            <button
                                onClick={() => handleSend(inputValue)}
                                disabled={!inputValue.trim() || isTyping}
                                className="h-[44px] px-[16px] bg-accent text-bg-base flex items-center justify-center rounded-[4px] rounded-l-none hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-surface"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

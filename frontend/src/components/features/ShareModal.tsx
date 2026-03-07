'use client';

import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reportId?: string;
}

export function ShareModal({ open, onOpenChange, reportId }: ShareModalProps) {
    const [doctorId, setDoctorId] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!doctorId.trim()) return;

        // Mock API Call
        if (doctorId === 'error') {
            setError('Doctor ID not found.');
        } else {
            setError(null);
            setIsSuccess(true);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange(newOpen);
        if (!newOpen) {
            // Reset state when closed
            setTimeout(() => {
                setDoctorId('');
                setIsSuccess(false);
                setError(null);
            }, 200);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/60 transition-opacity duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-[90] flex w-full max-w-[400px] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-[8px] bg-bg-surface shadow-2xl border border-border duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] focus:outline-none">

                    <div className="flex items-center justify-between border-b border-border bg-bg-elevated px-[24px] py-[16px] shrink-0">
                        <Dialog.Title className="font-sora text-[18px] font-bold text-text-primary m-0">
                            Share with a Doctor
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-text-muted hover:text-text-primary rounded-full p-2 transition-colors focus:ring-accent focus:outline-none focus:ring-2">
                                <X className="h-5 w-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <div className="p-[24px]">
                        {isSuccess ? (
                            <div className="flex flex-col items-center justify-center py-6">
                                <CheckCircle className="h-16 w-16 text-status-normal mb-6 animate-in zoom-in spin-in-180 duration-500" />
                                <h3 className="font-sora text-[20px] font-bold text-text-primary mb-2">
                                    Report shared successfully
                                </h3>
                                <p className="text-[14px] text-text-muted text-center mb-8">
                                    Your doctor has been notified and can now review your analysis.
                                </p>
                                <Dialog.Close asChild>
                                    <button className="w-full bg-bg-elevated border border-border text-text-primary hover:bg-white/[0.02] rounded-[4px] py-[10px] text-[15px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-accent flex items-center justify-center">
                                        Close
                                    </button>
                                </Dialog.Close>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                <div className="flex flex-col gap-[8px]">
                                    <label className="font-sans text-[12px] font-medium tracking-[0.08em] uppercase text-text-muted">
                                        Doctor ID
                                    </label>
                                    <input
                                        type="text"
                                        value={doctorId}
                                        onChange={(e) => {
                                            setDoctorId(e.target.value);
                                            if (error) setError(null);
                                        }}
                                        placeholder="Enter Doctor's ID"
                                        className={cn(
                                            'h-[44px] w-full rounded-[6px] border bg-bg-base px-[16px] text-[15px] font-mono text-text-primary transition-all duration-200 outline-none placeholder:text-text-muted placeholder:font-sans',
                                            error
                                                ? 'border-status-high focus:border-status-high focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
                                                : 'border-border focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,201,167,0.15)]'
                                        )}
                                    />
                                    {error && <span className="text-[12px] text-status-high">{error}</span>}

                                    <p className="text-[12px] text-text-muted mt-2 leading-[1.5]">
                                        The doctor will have read-only access to this report and its AI analysis.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!doctorId.trim()}
                                    className="w-full bg-accent text-bg-base hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 rounded-[4px] py-[10px] text-[15px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-surface"
                                >
                                    Share Report
                                </button>
                            </form>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

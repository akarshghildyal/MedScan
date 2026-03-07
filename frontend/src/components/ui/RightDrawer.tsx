'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RightDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    badge?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function RightDrawer({
    open,
    onOpenChange,
    title,
    badge,
    children,
    footer,
}: RightDrawerProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 transition-opacity duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content
                    className={cn(
                        'fixed inset-y-0 right-0 z-50 flex w-full max-w-[640px] flex-col bg-bg-surface shadow-2xl transition-transform duration-200 ease-out focus:outline-none focus:ring-0',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right'
                    )}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border bg-bg-elevated px-[24px] py-[16px] sticky top-0 z-10 shrink-0">
                        <div className="flex items-center gap-3">
                            <Dialog.Title className="font-sora text-[18px] font-bold text-text-primary m-0">
                                {title}
                            </Dialog.Title>
                            {badge && <div>{badge}</div>}
                        </div>
                        <Dialog.Close asChild>
                            <button
                                className="text-text-muted hover:text-text-primary rounded-full p-2 transition-colors focus:ring-accent focus:outline-none focus:ring-2"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-[24px]" style={{ overscrollBehavior: 'contain' }}>
                        {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                        <div className="border-t border-border bg-bg-elevated px-[24px] py-[16px] sticky bottom-0 z-10 shrink-0">
                            {footer}
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

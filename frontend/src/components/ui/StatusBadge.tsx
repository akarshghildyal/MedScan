import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType =
    | 'NORMAL'
    | 'HIGH'
    | 'LOW'
    | 'CRITICAL'
    | 'PROCESSING'
    | 'ANALYZED'
    | 'FAILED';

export interface StatusBadgeProps {
    status: StatusType;
    className?: string;
    subMessage?: string;
}

export function StatusBadge({ status, className, subMessage }: StatusBadgeProps) {
    const baseClasses =
        'inline-flex items-center justify-center rounded-[4px] px-[12px] py-[6px] text-[11px] font-bold tracking-wider uppercase';

    const statusStyles: Record<StatusType, string> = {
        NORMAL: 'bg-[var(--color-status-normal-bg)] text-[var(--color-status-normal-text)]',
        HIGH: 'bg-[var(--color-status-high-bg)] text-[var(--color-status-high-text)]',
        LOW: 'bg-[var(--color-status-low-bg)] text-[var(--color-status-low-text)]',
        CRITICAL: 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical-text)] animate-pulse-glow',
        ANALYZED: 'bg-accent/15 text-accent',
        FAILED: 'border border-status-high text-status-high bg-transparent',
        PROCESSING: 'animate-shimmer text-status-processing',
    };

    if (status === 'PROCESSING' && subMessage) {
        return (
            <span className={cn(baseClasses, statusStyles[status], "pl-[10px]", className)}>
                <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-processing animate-ping" />
                    <span className="normal-case tracking-normal truncate max-w-[160px]">{subMessage}</span>
                </span>
            </span>
        );
    }

    return (
        <span className={cn(baseClasses, statusStyles[status], className)}>
            {status}
        </span>
    );
}

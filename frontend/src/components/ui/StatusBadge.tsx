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
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const baseClasses =
        'inline-flex items-center justify-center rounded-[4px] px-[12px] py-[6px] text-[11px] font-bold tracking-wider uppercase';

    const statusStyles: Record<StatusType, string> = {
        NORMAL: 'bg-status-normal/15 text-status-normal',
        HIGH: 'bg-status-high/15 text-status-high',
        LOW: 'bg-status-low/15 text-status-low',
        CRITICAL: 'bg-status-critical/20 text-status-critical animate-pulse-glow',
        ANALYZED: 'bg-accent/15 text-accent',
        FAILED: 'border border-status-high text-status-high bg-transparent',
        PROCESSING: 'animate-shimmer text-status-processing',
    };

    return (
        <span className={cn(baseClasses, statusStyles[status], className)}>
            {status}
        </span>
    );
}

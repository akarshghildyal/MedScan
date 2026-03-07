import React from 'react';
import { cn } from '@/lib/utils';

export interface MetricChipProps {
    label: string;
    value: string | number;
    variant?: 'default' | 'warning' | 'danger';
    className?: string;
}

export function MetricChip({
    label,
    value,
    variant = 'default',
    className,
}: MetricChipProps) {
    const valueColor = {
        default: 'text-text-primary',
        warning: 'text-status-low',
        danger: 'text-status-high',
    };

    return (
        <div
            className={cn(
                'mx-auto flex min-w-[120px] flex-col items-start justify-center rounded-[6px] bg-bg-surface p-[16px]',
                className
            )}
        >
            <span className="mb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted">
                {label}
            </span>
            <span className={cn('font-sora text-[22px] font-bold', valueColor[variant])}>
                {value}
            </span>
        </div>
    );
}

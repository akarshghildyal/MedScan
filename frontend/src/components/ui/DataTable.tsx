'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type RowVariant = 'success' | 'error' | 'warning' | 'processing' | 'default';

export interface Column<T> {
    key: string;
    header: string;
    render?: (row: T) => React.ReactNode;
    width?: string;
}

export interface DataTableProps<T> {
    columns: Column<T>[];
    rows: T[];
    loading?: boolean;
    emptyState?: React.ReactNode;
    getRowKey: (row: T) => string;
    getRowVariant?: (row: T) => RowVariant;
    className?: string;
}

const variantStyles: Record<RowVariant, string> = {
    success: 'border-l-status-normal',
    error: 'border-l-status-high',
    warning: 'border-l-status-low',
    processing: 'border-l-status-processing animate-shimmer', // Appends the purple shimmer class
    default: 'border-l-transparent',
};

export function DataTable<T>({
    columns,
    rows,
    loading = false,
    emptyState,
    getRowKey,
    getRowVariant,
    className,
}: DataTableProps<T>) {
    if (loading) {
        return (
            <div className={cn('w-full rounded-[6px] overflow-hidden border border-border bg-bg-surface', className)}>
                {/* Skeleton Header */}
                <div className="flex h-[44px] items-center border-b border-border bg-bg-elevated px-6" />
                {/* Skeleton Rows */}
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="flex min-h-[52px] w-full items-center border-b border-border border-l-[3px] border-l-transparent px-6 last:border-b-0"
                    >
                        <div className="h-4 w-[80%] animate-pulse rounded bg-bg-elevated" />
                    </div>
                ))}
            </div>
        );
    }

    if (rows.length === 0 && emptyState) {
        return <div className={className}>{emptyState}</div>;
    }

    return (
        <div className={cn('w-full overflow-hidden rounded-[6px] border border-border bg-bg-surface', className)}>
            <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-bg-elevated sticky top-0 z-10">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    style={{ width: col.width }}
                                    className="px-6 py-3 text-[10px] font-medium tracking-[0.08em] uppercase text-text-muted border-b border-border whitespace-nowrap"
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => {
                            const variant = getRowVariant ? getRowVariant(row) : 'default';
                            return (
                                <tr
                                    key={getRowKey(row)}
                                    className={cn(
                                        'group min-h-[52px] border-b border-border border-l-[3px] transition-colors last:border-b-0 hover:bg-white/[0.02]',
                                        variantStyles[variant]
                                    )}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className="px-6 py-4 text-[14px] text-text-primary h-[52px] align-middle"
                                        >
                                            {col.render ? col.render(row) : (row as any)[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

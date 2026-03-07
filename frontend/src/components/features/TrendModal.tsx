'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Info } from 'lucide-react';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    ReferenceArea
} from 'recharts';

interface TrendDataPoint {
    date: string;
    value: number;
    status: StatusType;
}

interface TrendModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    markerName: string;
    unit: string;
    data: TrendDataPoint[];
    refRangeMin: number;
    refRangeMax: number;
}

export function TrendModal({
    open,
    onOpenChange,
    markerName,
    unit,
    data,
    refRangeMin,
    refRangeMax
}: TrendModalProps) {

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload as TrendDataPoint;
            return (
                <div className="bg-bg-elevated border border-border p-3 rounded shadow-lg z-50">
                    <p className="text-text-muted text-[11px] uppercase tracking-wider mb-2">{label}</p>
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-[16px] font-bold text-text-primary">
                            {dataPoint.value}
                        </span>
                        <StatusBadge status={dataPoint.status} />
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 transition-opacity duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-[70] w-full max-w-[720px] translate-x-[-50%] translate-y-[-50%] flex flex-col bg-bg-elevated rounded-[8px] shadow-2xl border border-border duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] focus:outline-none">

                    <div className="flex items-center justify-between p-[24px] pb-[16px]">
                        <Dialog.Title className="font-sora text-[20px] font-bold text-text-primary m-0 flex items-center gap-2">
                            {markerName} over time <span className="font-sans text-[14px] font-normal text-text-muted ml-1">· {unit}</span>
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button
                                className="text-text-muted hover:text-text-primary rounded-full p-2 transition-colors focus:ring-accent focus:outline-none focus:ring-2"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <div className="px-[24px] pb-[32px]">
                        {data.length <= 1 && (
                            <div className="flex items-center gap-2 bg-bg-surface border border-border rounded px-4 py-3 mb-6">
                                <Info className="h-4 w-4 text-text-muted" />
                                <span className="text-[13px] text-text-muted font-medium">Upload more reports to see trends</span>
                            </div>
                        )}

                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="var(--color-text-muted)"
                                        fontSize={11}
                                        tickMargin={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="var(--color-text-muted)"
                                        fontSize={11}
                                        tickMargin={12}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={['dataMin - 2', 'dataMax + 2']}
                                        width={40}
                                    />

                                    {/* Reference Range Band with 8% opacity green */}
                                    <ReferenceArea
                                        y1={refRangeMin}
                                        y2={refRangeMax}
                                        fill="rgba(34, 197, 94, 0.08)"
                                        strokeOpacity={0}
                                    />

                                    <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border)' }} />

                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="var(--color-accent)"
                                        strokeWidth={3}
                                        dot={{ fill: 'var(--color-bg-elevated)', stroke: 'var(--color-accent)', strokeWidth: 2, r: 4 }}
                                        activeDot={{ fill: 'var(--color-accent)', stroke: 'var(--color-bg-elevated)', strokeWidth: 2, r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

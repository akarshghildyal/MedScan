'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea
} from 'recharts';

import { fetchApi } from '@/lib/api';

export interface TrendViewerModalProps {
    open: boolean;
    onClose: () => void;
    markerName?: string;
    markers?: string[];
}

interface TrendPoint {
    date: string;
    value: number;
}

const METRIC_NORMAL_MIN = 125;
const METRIC_NORMAL_MAX = 200;

const CustomDot = (props: any) => {
    const { cx, cy, value } = props;
    const isOutOfRange = value < METRIC_NORMAL_MIN || value > METRIC_NORMAL_MAX;

    if (isOutOfRange) {
        return (
            <circle cx={cx} cy={cy} r={5} stroke="hsl(var(--card))" strokeWidth={2} fill="hsl(var(--critical))" />
        );
    }
    return (
        <circle cx={cx} cy={cy} r={3.5} stroke="hsl(var(--card))" strokeWidth={2} fill="hsl(var(--primary))" />
    );
};

export function TrendViewerModal({ open, onClose, markerName, markers }: TrendViewerModalProps) {
    const [timeframe, setTimeframe] = useState<'3M' | '6M' | '1Y' | 'All'>('1Y');
    const [selectedMarker, setSelectedMarker] = useState<string>(markerName || markers?.[0] || '');
    const [data, setData] = useState<TrendPoint[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadTrend = async (marker: string) => {
        if (!marker) return;
        setIsLoading(true);
        try {
            const trend = await fetchApi(`/trends/${encodeURIComponent(marker)}`);
            setData(trend.data || []);
        } catch (err) {
            console.error('Failed to load trend data', err);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (!open) return;
        const marker = markerName || selectedMarker || markers?.[0];
        if (marker) {
            setSelectedMarker(marker);
            loadTrend(marker);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, markerName, markers]);

    React.useEffect(() => {
        if (!open) return;
        if (selectedMarker) {
            loadTrend(selectedMarker);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMarker]);

    const filteredData = React.useMemo(() => {
        if (timeframe === 'All') return data;
        if (!data.length) return [];

        const now = new Date();
        const cutoff = new Date(now);
        switch (timeframe) {
            case '3M':
                cutoff.setMonth(now.getMonth() - 3);
                break;
            case '6M':
                cutoff.setMonth(now.getMonth() - 6);
                break;
            case '1Y':
                cutoff.setFullYear(now.getFullYear() - 1);
                break;
        }

        return data.filter((point) => {
            const d = new Date(point.date);
            return d >= cutoff;
        });
    }, [data, timeframe]);

    const latestValue = filteredData.length ? filteredData[filteredData.length - 1].value : undefined;
    const highestValue = filteredData.length ? Math.max(...filteredData.map((d) => d.value)) : undefined;
    const lowestValue = filteredData.length ? Math.min(...filteredData.map((d) => d.value)) : undefined;

    const chartData = filteredData.map((d) => ({ date: d.date, value: d.value }));

    const domainMin = Math.min(...(chartData.map((d) => d.value).concat([0])));
    const domainMax = Math.max(...(chartData.map((d) => d.value).concat([100])));

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-elevated"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-card-foreground">{markerName} Trends</h2>
                                <p className="text-sm text-muted-foreground">Track how this biomarker changes over time</p>
                            </div>
                            <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Controls Row */}
                        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <span className="text-sm font-medium text-text-primary">Biomarker:</span>
                                <select
                                    value={selectedMarker}
                                    onChange={(e) => setSelectedMarker(e.target.value)}
                                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    {(markers || []).map((marker) => (
                                        <option key={marker} value={marker}>{marker}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                {['3M', '6M', '1Y', 'All'].map((th) => (
                                    <button
                                        key={th}
                                        onClick={() => setTimeframe(th as any)}
                                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${timeframe === th
                                                ? 'bg-primary text-primary-foreground'
                                                : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                                            }`}
                                    >
                                        {th}
                                    </button>
                                ))}
                            </div>

                            {isLoading && <span className="text-sm text-muted-foreground">Loading…</span>}
                        </div>

                        {/* Chart Area */}
                        <div className="h-[264px] w-full mb-6">
                            {(!markers || markers.length === 0) ? (
                                <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg-surface text-center">
                                    <p className="text-sm font-medium text-text-muted">No biomarker data available yet.</p>
                                    <p className="text-xs text-text-muted/80">Upload a report to see trends.</p>
                                </div>
                            ) : (!selectedMarker ? (
                                <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg-surface text-center">
                                    <p className="text-sm font-medium text-text-muted">Select a biomarker to view trends.</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                            tickLine={false}
                                            axisLine={false}
                                            domain={[domainMin, domainMax]}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2.5}
                                            dot={<CustomDot />}
                                            activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ))}
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="rounded-lg border p-3 text-center">
                                <TrendingUp className="mx-auto mb-1 text-warning" size={20} />
                                <div className="text-lg font-bold text-card-foreground">{highestValue ?? '--'}</div>
                                <div className="text-xs text-muted-foreground">Highest</div>
                            </div>
                            <div className="rounded-lg border p-3 text-center">
                                <TrendingDown className="mx-auto mb-1 text-info" size={20} />
                                <div className="text-lg font-bold text-card-foreground">{lowestValue ?? '--'}</div>
                                <div className="text-xs text-muted-foreground">Lowest</div>
                            </div>
                            <div className="rounded-lg border p-3 text-center">
                                <Minus className="mx-auto mb-1 text-foreground" size={20} />
                                <div className="text-lg font-bold text-card-foreground">{latestValue ?? '--'}</div>
                                <div className="text-xs text-muted-foreground">Latest</div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

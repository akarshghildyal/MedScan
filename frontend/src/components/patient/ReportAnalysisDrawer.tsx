'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MarkerData {
    name: string;
    value: number | string;
    reference?: string;
    reference_min?: number | null;
    reference_max?: number | null;
    status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
}

interface ReportData {
    filename: string;
    type: string;
    date: string;
    summary: string;
    insights: string[];
    detailed_analysis: string;
    markers: MarkerData[];
}

export interface ReportAnalysisDrawerProps {
    open: boolean;
    onClose: () => void;
    report: ReportData | null;
    onTrendClick?: (markerName: string) => void;
}

export function ReportAnalysisDrawer({ open, onClose, report }: ReportAnalysisDrawerProps) {
    const [activeTab, setActiveTab] = useState<'summary' | 'raw'>('summary');

    if (!report) return null;

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col bg-card shadow-elevated border-l"
                    >
                        {/* Sticky Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card p-4">
                            <div>
                                <h2 className="font-semibold text-card-foreground">{report.filename}</h2>
                                <p className="text-sm text-muted-foreground">{report.type} • {report.date}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors">
                                    <Download size={16} /> Download
                                </button>
                                <button onClick={onClose} className="rounded-md p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b px-4 mt-2 gap-4">
                            <button
                                onClick={() => setActiveTab('summary')}
                                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'summary' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            >
                                AI Summary
                            </button>
                            <button
                                onClick={() => setActiveTab('raw')}
                                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'raw' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            >
                                Raw Data
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'summary' ? (
                                <div className="space-y-6">
                                    <div className="rounded-lg bg-secondary/50 p-4 border shadow-soft">
                                        <h3 className="text-sm font-semibold text-foreground mb-2">Executive Summary</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{report.summary}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground mb-3">Key Clinical Insights</h3>
                                        <ul className="space-y-3">
                                            {report.insights.map((insight, i) => (
                                                <motion.li
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="flex items-start gap-3 rounded-lg border p-3 text-sm text-card-foreground bg-card shadow-sm"
                                                >
                                                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                                    <span className="leading-relaxed">{insight}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground mb-3">Detailed Explanation</h3>
                                        <div className="rounded-lg border p-4 text-sm leading-relaxed text-muted-foreground">
                                            {report.detailed_analysis ? report.detailed_analysis.split('\n').map((paragraph, i) => (
                                                <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
                                            )) : (
                                                <p>No detailed explanation available.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border shadow-soft overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/30">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground border-b">Biomarker</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground border-b">Value</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground border-b">Reference</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground border-b">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.markers.map((marker, i) => {
                                                const variantMap: Record<string, "success" | "destructive" | "info" | "critical"> = {
                                                    NORMAL: "success",
                                                    HIGH: "destructive",
                                                    LOW: "destructive",
                                                    CRITICAL: "critical"
                                                };
                                                return (
                                                    <motion.tr
                                                        key={i}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                                                    >
                                                        <td className="px-4 py-3 font-medium text-card-foreground">{marker.name}</td>
                                                        <td className="px-4 py-3 font-mono text-card-foreground">{marker.value}</td>
                                                        <td className="px-4 py-3 text-muted-foreground text-xs">
                                                            {marker.reference_min != null || marker.reference_max != null ? (
                                                                <span>
                                                                    {marker.reference_min != null ? marker.reference_min : 'N/A'}
                                                                    {' - '}
                                                                    {marker.reference_max != null ? marker.reference_max : 'N/A'}
                                                                </span>
                                                            ) : (
                                                                marker.reference || 'N/A'
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant={variantMap[marker.status] || "success"}>{marker.status}</Badge>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { RightDrawer } from '@/components/ui/RightDrawer';
import { Badge } from '@/components/ui/badge';

interface MarkerData {
    name: string;
    value: number | string;
    reference: string;
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

interface ReportAnalysisDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filename: string;
    type: string;
    report?: any;
    onShareClick?: () => void;
    onTrendClick: (markerName: string) => void;
    isDoctorView?: boolean;
    onReviewClick?: () => void;
}

export function ReportAnalysisDrawer({
    open,
    onOpenChange,
    filename,
    type,
    report,
    onShareClick,
    onTrendClick,
    isDoctorView = false,
    onReviewClick,
}: ReportAnalysisDrawerProps) {
    const [activeTab, setActiveTab] = useState<'summary' | 'raw'>('summary');

    const headerBadge = (
        <span className="inline-flex items-center rounded-md bg-bg-surface border border-border px-2 py-1 text-[11px] font-medium text-text-body">
            {type}
        </span>
    );

    const footer = (
        <div className="flex flex-col gap-3">
            {isDoctorView ? (
                <button
                    onClick={onReviewClick}
                    className="w-full bg-transparent border border-status-normal text-status-normal hover:bg-status-normal/10 rounded-[4px] py-[10px] text-[15px] font-bold transition-all focus:outline-none flex items-center justify-center gap-2"
                >
                    Mark as Reviewed
                </button>
            ) : (
                <button
                    onClick={onShareClick}
                    className="w-full bg-accent text-bg-base hover:brightness-110 rounded-[4px] py-[10px] text-[15px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-elevated flex items-center justify-center gap-2"
                >
                    Share with Doctor
                </button>
            )}
            <button className="w-full bg-transparent border border-border text-text-primary hover:bg-white/[0.02] rounded-[4px] py-[10px] text-[15px] font-bold transition-all focus:outline-none flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                Download PDF
            </button>
        </div>
    );

    return (
        <RightDrawer
            open={open}
            onOpenChange={onOpenChange}
            title={filename}
            badge={headerBadge}
            footer={footer}
        >
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
                            <p className="text-sm text-muted-foreground leading-relaxed">{report?.summary || "No summary available."}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3">Key Clinical Insights</h3>
                            <ul className="space-y-3">
                                {(report?.insights || []).map((insight: string, i: number) => (
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
                                {(!report?.insights || report.insights.length === 0) && (
                                    <p className="text-sm text-muted-foreground">No specific insights detected.</p>
                                )}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3">Detailed Explanation</h3>
                            <div className="rounded-lg border p-4 text-sm leading-relaxed text-muted-foreground">
                                {report?.detailed_analysis ? report.detailed_analysis.split('\n').map((paragraph: string, i: number) => (
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
                                {(report?.markers || []).map((marker: any, i: number) => {
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
                                                    'N/A'
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={variantMap[marker.status] || "success"}>{marker.status}</Badge>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                                {(!report?.markers || report.markers.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                                            No biomarkers extracted from this report.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </RightDrawer>
    );
}

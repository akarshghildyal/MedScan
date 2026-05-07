'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Share2, MessageCircle, FileText, CheckCircle, Clock, AlertTriangle, Upload, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

import { DashboardHeader } from '@/components/DashboardHeader';
import { MetricCard } from '@/components/MetricCard';
import { Badge } from '@/components/ui/badge';

// Modals adapted from the UI Spec
import { ReportAnalysisDrawer } from '@/components/patient/ReportAnalysisDrawer';
import { ShareModal } from '@/components/features/ShareModal';
import { TrendViewerModal } from '@/components/patient/TrendViewerModal';
import { ChatbotModal } from '@/components/patient/ChatbotModal';

interface ReportRow {
    id: string;
    filename: string;
    type: string;
    dateUploaded: string;
    status: 'UPLOADED' | 'PROCESSING' | 'ANALYZED' | 'FAILED';
    currentStep?: string;
    summaryPreview: string;
    raw?: any;
}

export default function PatientDashboard() {
    const router = useRouter();
    const [reports, setReports] = useState<ReportRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState('Patient');

    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragActive, setIsDragActive] = useState(false);

    // Modal States
    const [activeReport, setActiveReport] = useState<ReportRow | null>(null);
    const [activeReportDetail, setActiveReportDetail] = useState<any>(null);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [activeTrendMarker, setActiveTrendMarker] = useState<string>('');
    const [isTrendOpen, setIsTrendOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Polling Reference to avoid dependency loops
    const pollTimeoutRef = React.useRef<NodeJS.Timeout>();

    // Fetch API Data
    const loadData = useCallback(async (isInitial = false) => {
        try {
            if (isInitial) {
                setIsLoading(true);
                const user = await fetchApi('/auth/me');
                setUserName(user.full_name?.split(' ')[0] || user.full_name || 'Patient');
            }

            const data = await fetchApi('/reports/');
            const mappedReports: ReportRow[] = data.map((r: any) => ({
                id: r.report_id,
                filename: r.file_name || 'Unknown Document',
                type: r.report_type || 'Unknown',
                dateUploaded: new Date(r.upload_date).toLocaleDateString(),
                status: (r.status || 'PROCESSING').toUpperCase() as any,
                currentStep: r.current_step || 'Initializing...',
                summaryPreview: r.summary || (r.status === 'FAILED' ? 'Failed to process document' : r.status === 'PROCESSING' ? `Running: ${r.current_step || 'Initializing...'}` : 'No summary available'),
                raw: r
            }));
            setReports(mappedReports);

            // Chain the next poll if there are still processing reports
            const stillProcessing = mappedReports.some(r => r.status === 'PROCESSING');
            if (stillProcessing) {
                if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
                pollTimeoutRef.current = setTimeout(() => {
                    loadData(false);
                }, 4000); // 4 second intervals
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            router.push('/login');
        } finally {
            if (isInitial) setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        loadData(true);
    }, [loadData]);

    useEffect(() => {
        // Clean up timeout on unmount
        return () => {
            if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
        };
    }, []);

    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        setUploadProgress(20);

        try {
            const formData = new FormData();
            formData.append('file', file);
            setUploadProgress(60);

            const result = await fetchApi('/reports/upload', {
                method: 'POST',
                body: formData
            });

            setUploadProgress(100);

            setTimeout(() => {
                const newRow: ReportRow = {
                    id: result.report_id,
                    filename: result.file_name || file.name,
                    type: result.report_type || 'Pending',
                    dateUploaded: 'Just now',
                    status: (result.status || 'PROCESSING').toUpperCase() as any,
                    currentStep: result.current_step || 'Initializing...',
                    summaryPreview: `Running: ${result.current_step || 'Initializing...'}`,
                    raw: result
                };
                setReports(prev => [newRow, ...prev]);
                // Kick off polling explicitly now that we have a PROCESSING row
                if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
                pollTimeoutRef.current = setTimeout(() => loadData(false), 4000);
                setIsUploading(false);
                setUploadProgress(0);
            }, 600);

        } catch (error: any) {
            console.error('Upload failed:', error);
            setIsUploading(false);
            setUploadProgress(0);
            alert('Upload failed: ' + (error.message || 'Error uploading file'));
        }
    };

    const openReport = async (row: ReportRow) => {
        setActiveReport(row);
        setIsDrawerOpen(true);
        setActiveReportDetail(null);
        setIsReportLoading(true);

        try {
            const detail = await fetchApi(`/reports/${row.id}`);
            setActiveReportDetail(detail);
        } catch (error) {
            console.error('Failed to load report details', error);
        } finally {
            setIsReportLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    // Calculate metrics
    const analyzedCount = reports.filter(r => r.status === 'ANALYZED').length;
    const processingCount = reports.filter(r => r.status === 'PROCESSING').length;

    const trendMarkers = React.useMemo(() => {
        const set = new Set<string>();
        reports.forEach((r) => {
            r.raw?.markers?.forEach((m: any) => {
                if (m?.name) set.add(m.name);
            });
        });
        return Array.from(set);
    }, [reports]);

    return (
        <div className="min-h-screen bg-bg-base text-text-body flex flex-col">
            <DashboardHeader userName={userName} roleOverride="Patient" />

            <main className="mx-auto w-full max-w-[1280px] px-[20px] lg:px-[48px] py-[48px] flex flex-col flex-1">
                <div className="flex w-full flex-col gap-[32px]">

                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 animate-fade-up">
                        <div>
                            <div className="flex items-center gap-4 mb-1">
                                <h1 className="font-sora text-[28px] font-bold text-text-primary">
                                    Patient Dashboard
                                </h1>
                            </div>
                            <p className="text-text-muted">View your medical reports and insights</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <MetricCard title="Total Reports" value={reports.length} icon={FileText} accent="primary" delay={0.1} />
                            <MetricCard title="Analyzed" value={analyzedCount} icon={CheckCircle} accent="success" delay={0.2} />
                            <MetricCard title="Processing" value={processingCount} icon={Clock} accent="info" delay={0.3} />
                        </div>
                    </div>

                    {/* Upload + Trend Row */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Upload Zone */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className="lg:col-span-2"
                        >
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                                onDragLeave={() => setIsDragActive(false)}
                                onDrop={handleDrop}
                                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-border bg-bg-surface hover:bg-bg-elevated'
                                    }`}
                            >
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept="application/pdf"
                                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                                />
                                <div className="mb-4 rounded-full bg-primary/10 p-4">
                                    <Upload className="text-primary" size={36} />
                                </div>
                                <h3 className="mb-1 text-lg font-semibold text-text-primary">Upload Pathology Report</h3>
                                <p className="mb-4 text-sm text-text-muted">Drag and drop your PDF here, or click to browse</p>

                                {isUploading ? (
                                    <div className="w-full max-w-xs space-y-2">
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className="h-full bg-primary transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-muted-foreground">{uploadProgress}% processing...</div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                        className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                                    >
                                        Select File
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        {/* Trend Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                            className="flex flex-col items-center justify-center rounded-xl border border-border bg-bg-surface p-6 text-center shadow-soft"
                        >
                            <div className="mb-4 rounded-full bg-primary/10 p-4">
                                <RefreshCw className="text-primary" size={32} />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-text-primary">Biomarker Trends</h3>
                            <p className="mb-6 text-sm text-text-muted">Track how your health markers change over time.</p>
                            <button
                                onClick={() => setIsTrendOpen(true)}
                                className="rounded-md border border-border bg-bg-base text-text-primary hover:bg-bg-elevated px-6 py-2.5 text-sm font-medium shadow-sm transition-colors"
                            >
                                View Trends
                            </button>
                        </motion.div>
                    </div>

                    {/* Reports Table */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}
                        className="rounded-[6px] border border-border bg-bg-surface shadow-soft overflow-hidden"
                    >
                        <div className="border-b border-border px-5 py-4">
                            <h2 className="text-lg font-semibold text-text-primary">Report History</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-bg-elevated">
                                    <tr>
                                        <th className="px-5 py-3 text-[10px] font-medium tracking-[0.08em] uppercase text-text-muted border-b border-border">Filename</th>
                                        <th className="px-5 py-3 text-[10px] font-medium tracking-[0.08em] uppercase text-text-muted border-b border-border">Type</th>
                                        <th className="px-5 py-3 text-[10px] font-medium tracking-[0.08em] uppercase text-text-muted border-b border-border">Date Uploaded</th>
                                        <th className="px-5 py-3 text-[10px] font-medium tracking-[0.08em] uppercase text-text-muted border-b border-border">Status</th>
                                        <th className="px-5 py-3 text-[10px] font-medium tracking-[0.08em] uppercase text-text-muted border-b border-border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.length === 0 && !isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-text-muted">
                                                No reports found. Upload a document to begin.
                                            </td>
                                        </tr>
                                    ) : (
                                        reports.map((row, i) => (
                                            <motion.tr
                                                key={row.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.05 * i }}
                                                className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="px-5 py-3">
                                                    <span className="font-medium text-text-primary">{row.filename}</span>
                                                    <p className="mt-1 text-xs text-text-muted italic truncate max-w-sm">
                                                        {row.summaryPreview}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="inline-flex items-center rounded-md bg-bg-elevated border border-border px-2 py-1 text-[11px] font-medium text-text-body">{row.type}</span>
                                                </td>
                                                <td className="px-5 py-3 text-text-muted">{row.dateUploaded}</td>
                                                <td className="px-5 py-3 whitespace-nowrap">
                                                    {row.status === 'UPLOADED' && <span className="inline-flex items-center rounded-md bg-bg-elevated border border-border px-2 py-1 text-[11px] font-medium text-text-body">Uploaded</span>}
                                                    {row.status === 'PROCESSING' && <span className="inline-flex items-center rounded-md bg-bg-elevated border border-border px-2 py-1 text-[11px] font-medium text-text-body">{row.currentStep || 'Processing'}</span>}
                                                    {row.status === 'ANALYZED' && <span className="inline-flex items-center rounded-md bg-bg-elevated border border-border px-2 py-1 text-[11px] font-medium text-text-body">Analyzed</span>}
                                                    {row.status === 'FAILED' && <span className="inline-flex items-center rounded-md bg-bg-elevated border border-border px-2 py-1 text-[11px] font-medium text-destructive">Failed</span>}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        {row.status === 'FAILED' ? (
                                                            <button className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
                                                                <RefreshCw size={14} /> Retry
                                                            </button>
                                                        ) : row.status === 'ANALYZED' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => openReport(row)}
                                                                    className="flex items-center justify-center h-8 w-8 rounded-md text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-all"
                                                                    title="View Analysis"
                                                                >
                                                                    <Eye size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setActiveReport(row);
                                                                        setIsShareOpen(true);
                                                                    }}
                                                                    className="flex items-center justify-center h-8 w-8 rounded-md text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-all"
                                                                    title="Share Doctor"
                                                                >
                                                                    <Share2 size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setActiveReport(row);
                                                                        setIsChatOpen(true);
                                                                    }}
                                                                    className="flex items-center justify-center h-8 w-8 rounded-md text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-all"
                                                                    title="Ask AI"
                                                                >
                                                                    <MessageCircle size={16} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-text-muted">Please wait...</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                </div>
            </main>

            {/* Modals integrated explicitly mapping to UI components */}
            <ReportAnalysisDrawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                report={activeReportDetail ?? (activeReport ? {
                    summary: activeReport.summaryPreview,
                    insights: activeReport.raw?.insights || [],
                    detailed_analysis: activeReport.raw?.detailed_analysis || '',
                    markers: activeReport.raw?.markers || []
                } : null)}
                onTrendClick={(markerName: string) => {
                    setActiveTrendMarker(markerName);
                    setIsTrendOpen(true);
                }}
            />

            <ShareModal
                open={isShareOpen}
                onOpenChange={setIsShareOpen}
                reportId={activeReport?.id}
            />

            <TrendViewerModal
                open={isTrendOpen}
                onClose={() => setIsTrendOpen(false)}
                markerName={activeTrendMarker}
                markers={trendMarkers}
            />

            <ChatbotModal
                open={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                reportId={activeReport?.id ?? null}
                filename={activeReport?.filename || ''}
            />

        </div>
    );
}

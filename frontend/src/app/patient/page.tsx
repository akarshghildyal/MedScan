'use client';

import React, { useState } from 'react';
import { RefreshCw, Share2, MessageCircle, Activity } from 'lucide-react';
import { MetricChip } from '@/components/ui/MetricChip';
import { UploadStrip } from '@/components/ui/UploadStrip';
import { DataTable, Column, RowVariant } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import { ReportAnalysisDrawer } from '@/components/features/ReportAnalysisDrawer';
import { ChatbotModal } from '@/components/features/ChatbotModal';
import { ShareModal } from '@/components/features/ShareModal';
import { TrendModal } from '@/components/features/TrendModal';
import { ThemeToggle } from '@/components/features/ThemeToggle';
import { fetchApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface ReportRow {
    id: string;
    filename: string;
    type: string;
    dateUploaded: string;
    status: StatusType;
    summaryPreview: string;
    currentStep?: string;
    raw?: any;
}

const mockReports: ReportRow[] = [
    {
        id: '1',
        filename: 'Complete_Blood_Count_Jan2026_Final.pdf',
        type: 'Blood Test',
        dateUploaded: '10 mins ago',
        status: 'ANALYZED',
        summaryPreview: 'Elevated WBC count detected. All other markers normal.',
    },
    {
        id: '2',
        filename: 'Liver_Function_Panel_Q4.pdf',
        type: 'Biochemistry',
        dateUploaded: '2 hours ago',
        status: 'PROCESSING',
        summaryPreview: 'Extracting markers...',
    },
    {
        id: '3',
        filename: 'Thyroid_Scan_Results_Corrupted.pdf',
        type: 'Unknown',
        dateUploaded: '1 day ago',
        status: 'FAILED',
        summaryPreview: 'Failed to parse PDF document.',
    },
];

const mockTrendData = [
    { date: 'Jan 2025', value: 8.5, status: 'NORMAL' as StatusType },
    { date: 'Jun 2025', value: 9.2, status: 'NORMAL' as StatusType },
    { date: 'Oct 2025', value: 10.1, status: 'NORMAL' as StatusType },
    { date: 'Jan 2026', value: 11.8, status: 'HIGH' as StatusType },
];

export default function PatientDashboard() {
    const router = useRouter();
    const [reports, setReports] = useState<ReportRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState('Patient');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Modal States
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isTrendOpen, setIsTrendOpen] = useState(false);

    // Selected Report for Modals
    const [activeReport, setActiveReport] = useState<ReportRow | null>(null);
    const [activeTrendMarker, setActiveTrendMarker] = useState('');

    // Fetch data
    const loadData = React.useCallback(async (isInitial = false) => {
        try {
            if (isInitial) setIsLoading(true);
            const user = await fetchApi('/auth/me');
            setUserName(user.full_name?.split(' ')[0] || user.full_name || 'Patient');

            const data = await fetchApi('/reports/');
            const mappedReports: ReportRow[] = data.map((r: any) => ({
                id: r.report_id, // Map report_id to id
                filename: r.file_name || 'Unknown Document',
                type: r.report_type || 'Unknown',
                dateUploaded: new Date(r.upload_date).toLocaleDateString(),
                status: (r.status || 'PROCESSING').toUpperCase() as StatusType,
                summaryPreview: r.summary || (r.status === 'FAILED' ? 'Failed to process document' : r.status === 'PROCESSING' ? `Running: ${r.current_step || 'Initializing...'}` : 'No summary available'),
                raw: r
            }));
            setReports(mappedReports);
        } catch (error) {
            console.error('Error fetching data:', error);
            router.push('/login');
        } finally {
            if (isInitial) setIsLoading(false);
        }
    }, [router]);

    React.useEffect(() => {
        loadData(true);
    }, [loadData]);

    // Auto-polling for processing reports
    React.useEffect(() => {
        const hasProcessing = reports.some(r => r.status === 'PROCESSING');
        if (!hasProcessing) return;

        const interval = setInterval(() => {
            loadData(false);
        }, 3000);

        return () => clearInterval(interval);
    }, [reports, loadData]);

    const handleFileUpload = async (file: File) => {
        setSelectedFile(file);
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
                    status: (result.status || 'PROCESSING').toUpperCase() as StatusType,
                    summaryPreview: `Running: ${result.current_step || 'Initializing...'}`,
                    raw: result
                };
                setReports([newRow, ...reports]);
                setIsUploading(false);
                setSelectedFile(null);
            }, 600);

        } catch (error: any) {
            console.error('Upload failed:', error);
            setIsUploading(false);
            setUploadProgress(0);
            setSelectedFile(null);
            alert('Upload failed: ' + (error.message || 'Error uploading file'));
        }
    };

    const getRowVariant = (row: ReportRow): RowVariant => {
        if (row.status === 'ANALYZED') return 'success';
        if (row.status === 'FAILED') return 'error';
        if (row.status === 'PROCESSING') return 'processing';
        return 'default';
    };

    const openDrawer = async (report: ReportRow) => {
        setActiveReport(report); // Set immediately to open drawer and show title/summary
        setIsDrawerOpen(true);

        try {
            const fullReport = await fetchApi(`/reports/${report.id}`);
            setActiveReport(prev => prev?.id === report.id ? { ...report, raw: fullReport } : prev);
        } catch (error) {
            console.error('Failed to fetch full report details:', error);
        }
    };

    const openShare = (report: ReportRow) => {
        setActiveReport(report);
        setIsShareOpen(true);
    };

    const openChat = (report: ReportRow) => {
        setActiveReport(report);
        setIsChatOpen(true);
    };

    const columns: Column<ReportRow>[] = [
        {
            key: 'filename',
            header: 'Filename',
            render: (row) => {
                const fname = row.filename || 'Unknown Document';
                return (
                    <span className="truncate block max-w-[200px]" title={fname}>
                        {fname.length > 32 ? fname.substring(0, 29) + '...' : fname}
                    </span>
                );
            },
        },
        {
            key: 'type',
            header: 'Type',
            render: (row) => (
                <span className="inline-flex items-center rounded-md bg-bg-elevated border border-border px-2 py-1 text-[11px] font-medium text-text-body">
                    {row.type}
                </span>
            ),
        },
        { key: 'dateUploaded', header: 'Date Uploaded' },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <StatusBadge status={row.status} subMessage={row.status === 'PROCESSING' ? row.raw?.current_step : undefined} />,
        },
        {
            key: 'summaryPreview',
            header: 'Summary Preview',
            render: (row) => (
                <span className="italic text-[13px] text-text-muted truncate block max-w-[250px]">
                    {row.summaryPreview}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.status === 'FAILED' ? (
                        <button className="flex items-center gap-2 rounded border border-status-high px-3 py-1 text-[13px] font-medium text-status-high hover:bg-status-high/10 transition-colors">
                            <RefreshCw className="h-3 w-3" />
                            Retry
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => openDrawer(row)}
                                className="bg-accent text-bg-base hover:brightness-110 px-3 py-1.5 rounded-[4px] text-[13px] font-bold transition-all disabled:opacity-50"
                                disabled={row.status === 'PROCESSING'}
                            >
                                View
                            </button>
                            <button
                                onClick={() => openShare(row)}
                                className="text-text-muted hover:text-text-primary px-2 transition-colors disabled:opacity-50"
                                disabled={row.status === 'PROCESSING'}
                                title="Share"
                            >
                                <Share2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => openChat(row)}
                                className="text-text-muted hover:text-text-primary px-2 transition-colors disabled:opacity-50"
                                disabled={row.status === 'PROCESSING'}
                                title="Chat"
                            >
                                <MessageCircle className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="flex min-h-screen w-full flex-col bg-bg-base">

            {/* Top Navigation Bar */}
            <header className="dashboard-nav sticky top-0 z-30 flex h-[64px] w-full items-center justify-between border-b border-border bg-bg-surface px-[20px] lg:px-[48px]">
                <div className="flex items-center gap-2">
                    <span className="font-sora text-[20px] font-bold text-text-primary tracking-tight">MedScan</span>
                    <span className="text-[12px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full ml-2">PATIENT</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-text-primary">{userName}</span>
                    <ThemeToggle />
                    <button
                        onClick={() => { localStorage.removeItem('medscan-token'); router.push('/login'); }}
                        className="text-sm text-text-muted hover:text-status-high transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1280px] px-[20px] lg:px-[48px] py-[48px] flex flex-col gap-[32px] flex-1">
                {/* Header Row */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 animate-fade-up">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="font-sora text-[28px] font-bold text-text-primary">
                                Welcome back, {userName}
                            </h1>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-text-muted hover:text-accent transition-colors p-2 rounded-full focus:ring-accent focus:outline-none focus:ring-2"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <MetricChip label="Total Reports" value={reports.length} />
                        <MetricChip
                            label="Last Upload"
                            value={reports.length > 0 ? reports[0].dateUploaded : '--'}
                        />
                    </div>
                </div>

                {/* Upload Strip */}
                <div className="animate-fade-up" style={{ animationDelay: '60ms' }}>
                    <UploadStrip
                        onFileSelect={handleFileUpload}
                        onClear={() => setSelectedFile(null)}
                        state={isUploading ? 'uploading' : selectedFile ? 'success' : 'idle'}
                        progress={uploadProgress}
                        selectedFile={selectedFile}
                    />
                </div>

                {/* History Table */}
                <div className="animate-fade-up flex flex-col gap-4" style={{ animationDelay: '120ms' }}>
                    <h2 className="font-sora text-[20px] font-bold text-text-primary mt-4">
                        Report History
                    </h2>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-bg-surface rounded-[6px] border border-border">
                            <div className="animate-pulse h-[2px] w-[60px] bg-accent mb-6 rounded-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/50 w-full animate-[shimmer_1s_infinite]"></div>
                            </div>
                            <h3 className="font-sora text-text-primary mb-2">Loading reports...</h3>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-bg-surface rounded-[6px] border border-border">
                            <div className="h-[2px] w-[60px] bg-accent mb-6 relative overflow-hidden rounded-full">
                                <Activity className="absolute right-0 top-1/2 -translate-y-1/2 text-accent h-4 w-4" />
                            </div>
                            <h3 className="font-sora text-[24px] font-bold text-text-primary mb-2">
                                No reports yet
                            </h3>
                            <p className="text-text-muted mb-8">
                                Upload your first pathology PDF to get started
                            </p>
                            <button
                                onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                                className="bg-accent text-bg-base hover:brightness-110 px-6 py-2 rounded-[4px] font-bold transition-all"
                            >
                                Upload PDF
                            </button>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            rows={reports}
                            getRowKey={(r) => r.id}
                            getRowVariant={getRowVariant}
                        />
                    )}
                </div>

                {/* Modals integrated here */}
                <ReportAnalysisDrawer
                    open={isDrawerOpen}
                    onOpenChange={setIsDrawerOpen}
                    filename={activeReport?.filename || 'Report Analysis'}
                    type={activeReport?.type || 'Diagnosis'}
                    report={activeReport?.raw}
                    onShareClick={() => {
                        setIsDrawerOpen(false);
                        setIsShareOpen(true);
                    }}
                    onTrendClick={(marker) => {
                        setActiveTrendMarker(marker);
                        setIsTrendOpen(true);
                    }}
                />

                <ChatbotModal
                    open={isChatOpen}
                    onOpenChange={setIsChatOpen}
                    reportContext={activeReport?.id}
                />

                <ShareModal
                    open={isShareOpen}
                    onOpenChange={setIsShareOpen}
                    reportId={activeReport?.id}
                />

                <TrendModal
                    open={isTrendOpen}
                    onOpenChange={setIsTrendOpen}
                    markerName={activeTrendMarker}
                    unit="x10^9/L"
                    data={mockTrendData}
                    refRangeMin={4.0}
                    refRangeMax={11.0}
                />

            </main>
        </div>
    );
}

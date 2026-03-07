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

interface ReportRow {
    id: string;
    filename: string;
    type: string;
    dateUploaded: string;
    status: StatusType;
    summaryPreview: string;
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
    const [reports, setReports] = useState<ReportRow[]>(mockReports);
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

    // Test scripts
    React.useEffect(() => {
        (window as any).clearReports = () => setReports([]);
        (window as any).loadReports = () => setReports(mockReports);
    }, []);

    const handleFileUpload = (file: File) => {
        setSelectedFile(file);
        setIsUploading(true);
        setUploadProgress(0);

        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setIsUploading(false);
                        setReports([{
                            id: Date.now().toString(),
                            filename: file.name,
                            type: 'Pending',
                            dateUploaded: 'Just now',
                            status: 'PROCESSING',
                            summaryPreview: 'Pending analysis...',
                        }, ...reports]);
                        setSelectedFile(null);
                    }, 500);
                    return 100;
                }
                return prev + 15;
            });
        }, 200);
    };

    const getRowVariant = (row: ReportRow): RowVariant => {
        if (row.status === 'ANALYZED') return 'success';
        if (row.status === 'FAILED') return 'error';
        if (row.status === 'PROCESSING') return 'processing';
        return 'default';
    };

    const openDrawer = (report: ReportRow) => {
        setActiveReport(report);
        setIsDrawerOpen(true);
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
            render: (row) => (
                <span className="truncate block max-w-[200px]" title={row.filename}>
                    {row.filename.length > 32 ? row.filename.substring(0, 29) + '...' : row.filename}
                </span>
            ),
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
            render: (row) => <StatusBadge status={row.status} />,
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
        <div className="flex w-full flex-col gap-[32px]">

            {/* Header Row */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 animate-fade-up">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="font-sora text-[28px] font-bold text-text-primary">
                            Welcome back, John
                        </h1>
                        <button className="text-text-muted hover:text-accent transition-colors p-2 rounded-full focus:ring-accent focus:outline-none focus:ring-2">
                            <RefreshCw className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <MetricChip label="Total Reports" value={reports.length} />
                    <MetricChip label="Last Upload" value="10m ago" />
                    <MetricChip label="Abnormal Markers" value={1} variant="danger" />
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

                {reports.length === 0 ? (
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

        </div>
    );
}

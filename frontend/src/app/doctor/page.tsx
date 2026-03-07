'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { MetricChip } from '@/components/ui/MetricChip';
import { DataTable, Column, RowVariant } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import { ReportAnalysisDrawer } from '@/components/features/ReportAnalysisDrawer';
import { TrendModal } from '@/components/features/TrendModal';
import { ThemeToggle } from '@/components/features/ThemeToggle';
import { fetchApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface DoctorReportRow {
    id: string;
    patientName: string;
    patientId: string;
    type: string;
    dateShared: string;
    flaggedCount: number;
    highestSeverity: StatusType;
    isReviewed: boolean;
}

const mockTrendData = [
    { date: '2024-01', value: 6.2, status: 'NORMAL' as const },
    { date: '2024-04', value: 7.1, status: 'NORMAL' as const },
    { date: '2024-07', value: 5.8, status: 'NORMAL' as const },
    { date: '2024-10', value: 8.3, status: 'HIGH' as const },
];

export default function DoctorDashboard() {
    const router = useRouter();
    const [reports, setReports] = useState<DoctorReportRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isTrendOpen, setIsTrendOpen] = useState(false);

    const [activeReport, setActiveReport] = useState<DoctorReportRow | null>(null);
    const [activeTrendMarker, setActiveTrendMarker] = useState('');

    // Load data
    const loadData = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('medscan-token') : null;
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            setIsLoading(true);
            const data = await fetchApi('/doctor/reports');
            const mappedReports: DoctorReportRow[] = data.map((r: any) => ({
                id: r.report_id,
                patientName: r.patient_name,
                patientId: r.patient_id,
                type: r.report_type,
                dateShared: new Date(r.date_shared).toLocaleString(),
                flaggedCount: r.flagged_count,
                highestSeverity: r.highest_severity as StatusType,
                isReviewed: r.is_reviewed
            }));
            setReports(mappedReports);
        } catch (error: any) {
            console.error('Error fetching reports:', error);
            if (error.message?.includes('access required') || error.message?.includes('Not authenticated')) {
                router.push('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Default Sort: Critical first, then most recently shared
    const sortedReports = useMemo(() => {
        return [...reports].sort((a, b) => {
            if (a.highestSeverity === 'CRITICAL' && b.highestSeverity !== 'CRITICAL') return -1;
            if (b.highestSeverity === 'CRITICAL' && a.highestSeverity !== 'CRITICAL') return 1;
            // In a real app we would use actual timestamp comparison for dateShared
            return 0; // Keeping original order for demo
        });
    }, [reports]);

    const criticalCount = reports.filter(r => r.highestSeverity === 'CRITICAL').length;
    const pendingCount = reports.filter(r => !r.isReviewed).length;

    const getRowVariant = (row: DoctorReportRow): RowVariant => {
        if (row.highestSeverity === 'CRITICAL') return 'error';
        return 'default';
    };

    const openDrawer = (report: DoctorReportRow) => {
        setActiveReport(report);
        setIsDrawerOpen(true);
    };

    const handleReview = () => {
        if (!activeReport) return;
        setReports(prev => prev.map(r =>
            r.id === activeReport.id ? { ...r, isReviewed: true } : r
        ));
        setIsDrawerOpen(false);
    };

    const columns: Column<DoctorReportRow>[] = [
        { key: 'patientName', header: 'Patient Name', render: (row) => <span className="font-bold text-text-primary">{row.patientName}</span> },
        { key: 'patientId', header: 'Patient ID', render: (row) => <span className="font-mono text-text-muted">{row.patientId}</span> },
        { key: 'type', header: 'Report Type', render: (row) => <span className="inline-flex items-center rounded-md bg-bg-elevated border border-border px-2 py-1 text-[11px] font-medium text-text-body">{row.type}</span> },
        { key: 'dateShared', header: 'Date Shared' },
        {
            key: 'markersFlagged',
            header: 'Markers Flagged',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span className="text-[14px] font-mono text-text-muted w-4">{row.flaggedCount}</span>
                    {row.flaggedCount > 0 && <StatusBadge status={row.highestSeverity} />}
                </div>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => openDrawer(row)}
                        className="text-accent hover:text-white transition-colors text-[13px] font-bold"
                    >
                        View Details
                    </button>
                    {row.isReviewed && (
                        <span className="text-status-normal text-[11px] uppercase font-bold tracking-wider">Reviewed</span>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-bg-base text-text-body flex flex-col">

            {/* Top Navigation Bar */}
            <header className="dashboard-nav sticky top-0 z-30 flex h-[64px] w-full items-center justify-between border-b border-border bg-bg-surface px-[20px] lg:px-[48px]">
                <div className="flex items-center gap-2">
                    <span className="font-sora text-[20px] font-bold text-text-primary tracking-tight">MedScan</span>
                    <span className="text-[12px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full ml-2">DOCTOR</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-text-primary">Dr. Smith</span>
                    <ThemeToggle />
                    <button onClick={() => { localStorage.removeItem('medscan-token'); router.push('/login'); }} className="text-sm text-text-muted hover:text-status-high transition-colors">
                        Logout
                    </button>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1280px] px-[20px] lg:px-[48px] py-[48px] flex flex-col flex-1">
                <div className="flex w-full flex-col gap-[32px]">

                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 animate-fade-up">
                        <div>
                            <div className="flex items-center gap-4 mb-1">
                                <h1 className="font-sora text-[28px] font-bold text-text-primary">
                                    Dr. Smith Dashboard
                                </h1>
                            </div>
                            <p className="text-text-muted">Clinical review and analysis queue</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <MetricChip label="Total Shared" value={reports.length} />
                            <MetricChip label="Critical Reports" value={criticalCount} variant={criticalCount > 0 ? "danger" : "default"} />
                            <MetricChip label="Pending Review" value={pendingCount} variant={pendingCount > 0 ? "warning" : "default"} />
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="animate-fade-up flex flex-col gap-4" style={{ animationDelay: '60ms' }}>
                        <h2 className="font-sora text-[20px] font-bold text-text-primary mt-4">
                            Patient Queue
                        </h2>

                        {reports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 bg-bg-surface rounded-[6px] border border-border">
                                <div className="h-[2px] w-[60px] bg-accent mb-6 relative overflow-hidden rounded-full">
                                    <Activity className="absolute right-0 top-1/2 -translate-y-1/2 text-accent h-4 w-4" />
                                </div>
                                <h3 className="font-sora text-[24px] font-bold text-text-primary mb-2">
                                    No reports to review
                                </h3>
                                <p className="text-text-muted">
                                    Patients have not shared any reports with you yet.
                                </p>
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                rows={sortedReports}
                                getRowKey={(r) => r.id}
                                getRowVariant={getRowVariant}
                            />
                        )}
                    </div>

                </div>

                {/* Modals integrated here */}
                <ReportAnalysisDrawer
                    open={isDrawerOpen}
                    onOpenChange={setIsDrawerOpen}
                    filename={`${activeReport?.patientName} - ${activeReport?.type}`}
                    type={activeReport?.type || 'Diagnosis'}
                    onTrendClick={(marker) => {
                        setActiveTrendMarker(marker);
                        setIsTrendOpen(true);
                    }}
                    isDoctorView={true}
                    onReviewClick={handleReview}
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

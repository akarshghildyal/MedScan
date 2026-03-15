'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Activity, Users, AlertTriangle, Clock } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { DataTable, Column, RowVariant } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import { ReportAnalysisDrawer } from '@/components/features/ReportAnalysisDrawer';
import { TrendModal } from '@/components/features/TrendModal';
import { DashboardHeader } from '@/components/DashboardHeader';
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

interface AssignedPatient {
    patientId: string;
    patientName: string;
    patientEmail: string;
    assignedAt: string;
    reportCount: number;
}

const mockTrendData = [
    { date: '2024-01', value: 6.2, status: 'NORMAL' as const },
    { date: '2024-04', value: 7.1, status: 'NORMAL' as const },
    { date: '2024-07', value: 5.8, status: 'NORMAL' as const },
    { date: '2024-10', value: 8.3, status: 'HIGH' as const },
];

export default function DoctorDashboard() {
    const router = useRouter();
    const [userName, setUserName] = useState('Doctor');
    const [reports, setReports] = useState<DoctorReportRow[]>([]);
    const [assignedPatients, setAssignedPatients] = useState<AssignedPatient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isTrendOpen, setIsTrendOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'patients' | 'reports'>('patients');

    const [activeReport, setActiveReport] = useState<DoctorReportRow | null>(null);
    const [activeTrendMarker, setActiveTrendMarker] = useState('');
    const [fullReportData, setFullReportData] = useState<any>(null);

    // Load data
    const loadData = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('medscan-token') : null;
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            setIsLoading(true);

            // Load current user info for header display
            try {
                const user = await fetchApi('/auth/me');
                setUserName(user.full_name || user.email || 'Doctor');
            } catch {
                // ignore
            }

            const [reportsData, patientsData] = await Promise.all([
                fetchApi('/doctor/reports'),
                fetchApi('/doctor/patients')
            ]);

            const mappedReports: DoctorReportRow[] = reportsData.map((r: any) => ({
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

            const mappedPatients: AssignedPatient[] = patientsData.map((p: any) => ({
                patientId: p.patient_id,
                patientName: p.patient_name,
                patientEmail: p.patient_email,
                assignedAt: new Date(p.assigned_at).toLocaleDateString(),
                reportCount: p.report_count
            }));
            setAssignedPatients(mappedPatients);
        } catch (error: any) {
            console.error('Error fetching data:', error);
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

    // Default Sort: Critical first
    const sortedReports = useMemo(() => {
        return [...reports].sort((a, b) => {
            if (a.highestSeverity === 'CRITICAL' && b.highestSeverity !== 'CRITICAL') return -1;
            if (b.highestSeverity === 'CRITICAL' && a.highestSeverity !== 'CRITICAL') return 1;
            return 0;
        });
    }, [reports]);

    const pendingCount = reports.filter(r => !r.isReviewed).length;

    const getRowVariant = (row: DoctorReportRow): RowVariant => {
        if (row.highestSeverity === 'CRITICAL') return 'error';
        return 'default';
    };

    const openDrawer = async (report: DoctorReportRow) => {
        setActiveReport(report);
        setFullReportData(null); // Reset
        setIsDrawerOpen(true);
        try {
            const data = await fetchApi(`/doctor/report/${report.id}`);
            setFullReportData(data);
        } catch (error) {
            console.error("Failed to fetch full report details", error);
        }
    };

    const handleReview = () => {
        if (!activeReport) return;
        setReports(prev => prev.map(r =>
            r.id === activeReport.id ? { ...r, isReviewed: true } : r
        ));
        setIsDrawerOpen(false);
    };

    const reportColumns: Column<DoctorReportRow>[] = [
        { key: 'patientName', header: 'Patient Name', render: (row) => <span className="font-bold text-text-primary">{row.patientName}</span> },
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

    const patientColumns: Column<AssignedPatient>[] = [
        { key: 'patientName', header: 'Patient Name', render: (row) => <span className="font-bold text-text-primary">{row.patientName}</span> },
        { key: 'patientEmail', header: 'Email', render: (row) => <span className="text-text-muted">{row.patientEmail}</span> },
        { key: 'assignedAt', header: 'Assigned On' },
        { key: 'reportCount', header: 'Reports', render: (row) => <span className="font-mono text-text-muted">{row.reportCount}</span> },
    ];

    return (
        <div className="min-h-screen bg-bg-base text-text-body flex flex-col">

            {/* Top Navigation Bar */}
            <DashboardHeader roleOverride="Doctor" userName={userName} />

            <main className="mx-auto w-full max-w-[1280px] px-[20px] lg:px-[48px] py-[48px] flex flex-col flex-1">
                <div className="flex w-full flex-col gap-[32px]">

                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 animate-fade-up">
                        <div>
                            <div className="flex items-center gap-4 mb-1">
                                <h1 className="font-sora text-[28px] font-bold text-text-primary">
                                    Doctor Dashboard
                                </h1>
                            </div>
                            <p className="text-text-muted">Manage assigned patients and review shared reports</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <MetricCard title="Assigned Patients" value={assignedPatients.length} icon={Users} accent="primary" delay={0.1} />
                            <MetricCard title="Shared Reports" value={reports.length} icon={Activity} accent="info" delay={0.2} />
                            <MetricCard title="Pending Review" value={pendingCount} icon={Clock} accent={pendingCount > 0 ? 'warning' : 'success'} delay={0.3} />
                        </div>
                    </div>

                    {/* Tab Nav */}
                    <div className="flex items-center border-b border-border pb-4">
                        <div className="flex gap-6">
                            <button
                                onClick={() => setActiveTab('patients')}
                                className={`font-sora text-[15px] font-bold pb-[18px] -mb-[18px] border-b-[2px] transition-colors ${activeTab === 'patients' ? 'text-accent border-accent' : 'text-text-muted border-transparent hover:text-text-primary'}`}
                            >
                                <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Assigned Patients</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('reports')}
                                className={`font-sora text-[15px] font-bold pb-[18px] -mb-[18px] border-b-[2px] transition-colors ${activeTab === 'reports' ? 'text-accent border-accent' : 'text-text-muted border-transparent hover:text-text-primary'}`}
                            >
                                <span className="flex items-center gap-2"><Activity className="h-4 w-4" /> Shared Reports</span>
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="animate-fade-up" style={{ animationDelay: '60ms' }}>
                        {activeTab === 'patients' ? (
                            assignedPatients.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 bg-bg-surface rounded-[6px] border border-border">
                                    <Users className="h-8 w-8 text-text-muted mb-4" />
                                    <h3 className="font-sora text-[24px] font-bold text-text-primary mb-2">
                                        No assigned patients
                                    </h3>
                                    <p className="text-text-muted">
                                        The hospital admin has not assigned any patients to you yet.
                                    </p>
                                </div>
                            ) : (
                                <DataTable
                                    columns={patientColumns}
                                    rows={assignedPatients}
                                    getRowKey={(r) => r.patientId}
                                />
                            )
                        ) : (
                            reports.length === 0 ? (
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
                                    columns={reportColumns}
                                    rows={sortedReports}
                                    getRowKey={(r) => r.id}
                                    getRowVariant={getRowVariant}
                                />
                            )
                        )}
                    </div>

                </div>

                {/* Modals */}
                <ReportAnalysisDrawer
                    open={isDrawerOpen}
                    onOpenChange={setIsDrawerOpen}
                    filename={`${activeReport?.patientName} - ${activeReport?.type}`}
                    type={activeReport?.type || 'Diagnosis'}
                    report={fullReportData}
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

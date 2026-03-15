'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Terminal, Upload, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { MetricCard } from '@/components/MetricCard';
import { Badge } from '@/components/ui/badge';
import * as Dialog from '@radix-ui/react-dialog';

interface DevReportRow {
    id: string;
    filename: string;
    status: 'ANALYZED' | 'FAILED' | 'PROCESSING';
    uploadedAt: string;
    rawJson: any;
}

const mockJsonData = {
    pipeline_run_id: "RUN-992381",
    status: "success",
    duration_ms: 14032,
    classification: {
        type: "Blood Test",
        confidence: 0.98
    },
    extracted_data: [
        { marker: "WBC", value: 11.8, unit: "x10^9/L", min: 4.0, max: 11.0, flag: "HIGH" },
        { marker: "RBC", value: 4.8, unit: "x10^12/L", min: 4.5, max: 5.5, flag: "NORMAL" }
    ],
    insights: [
        "WBC is marginally elevated indicating mild immune response.",
        "RBC indices within normal limits."
    ]
};

const mockReports: DevReportRow[] = [
    { id: '1', filename: 'Sample_Lab_Report.pdf', status: 'ANALYZED', uploadedAt: '10 mins ago', rawJson: mockJsonData },
    { id: '2', filename: 'Failed_Upload.pdf', status: 'FAILED', uploadedAt: '20 mins ago', rawJson: { error: "PDF Parse Exception", code: 500 } },
];

export default function DevDashboard() {
    const [reports] = useState<DevReportRow[]>(mockReports);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [jsonModalOpen, setJsonModalOpen] = useState(false);
    const [activeJson, setActiveJson] = useState<any>(null);

    const viewJson = (json: any) => {
        setActiveJson(json);
        setJsonModalOpen(true);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            // Mock upload action would go here
        }
    };

    const successRuns = reports.filter(r => r.status === 'ANALYZED').length;
    const failedRuns = reports.filter(r => r.status === 'FAILED').length;

    return (
        <div className="flex min-h-screen flex-col bg-[#050505] text-[#A5D6FF] font-mono selection:bg-info/30 dark">

            {/* 1. Dashboard Header */}
            <DashboardHeader userName="System Admin" roleOverride="Dev" />

            <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 p-6 lg:p-10">
                {/* 2. Header Row */}
                <div className="flex items-center gap-3 border-b border-[#1A1A1A] pb-6">
                    <Terminal className="text-[#3FB950]" size={28} />
                    <h1 className="text-2xl font-bold tracking-tight text-white">MedScan Pipeline Console</h1>
                </div>

                {/* 3. Metric Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <MetricCard title="System Status" value="Online" icon={Activity} accent="success" delay={0.1} />
                    <MetricCard title="Total Pipeline Runs" value={reports.length} icon={Terminal} accent="info" delay={0.2} />
                    <MetricCard title="Successful Runs" value={successRuns} icon={CheckCircle} accent="success" delay={0.3} />
                    <MetricCard title="Failed Runs" value={failedRuns} icon={AlertTriangle} accent="destructive" delay={0.4} />
                </div>

                {/* 4. Upload Zone */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-6 lg:p-8 text-center"
                >
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#3FB950]/10">
                        <Upload className="text-[#3FB950]" size={28} />
                    </div>
                    <h2 className="mb-2 text-lg font-bold text-white uppercase tracking-wider">Test Pipeline Input</h2>
                    <p className="mb-6 text-sm text-muted-foreground/80 font-sans">Upload a document to manually trigger the analysis pipeline and view real-time log execution.</p>

                    <input
                        type="file"
                        id="dev-file-upload"
                        className="hidden"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => document.getElementById('dev-file-upload')?.click()}
                        className="rounded-md border border-[#3FB950]/30 bg-[#3FB950]/10 px-6 py-2.5 text-sm font-medium text-[#3FB950] transition-colors hover:bg-[#3FB950]/20"
                    >
                        {selectedFile ? selectedFile.name : 'Select PDF Payload'}
                    </button>
                </motion.div>

                {/* 5. Terminal Logs Table */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
                    className="rounded-xl border border-[#1A1A1A] shadow-2xl overflow-hidden bg-[#0A0A0A]"
                >
                    <div className="border-b border-[#1A1A1A] bg-[#111111] px-5 py-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Execution Logs</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-[#1A1A1A]">
                                <tr>
                                    <th className="px-5 py-3 text-left font-medium text-muted-foreground">Payload ID</th>
                                    <th className="px-5 py-3 text-left font-medium text-muted-foreground">Timestamp</th>
                                    <th className="px-5 py-3 text-left font-medium text-muted-foreground">Exit Code</th>
                                    <th className="px-5 py-3 text-left font-medium text-muted-foreground">Output</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.length === 0 ? (
                                    <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No execution logs found.</td></tr>
                                ) : (
                                    reports.map((row, i) => (
                                        <motion.tr
                                            key={row.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * i }}
                                            className="border-b border-[#1A1A1A] last:border-0 hover:bg-white/[0.02]"
                                        >
                                            <td className="px-5 py-4 font-mono text-white">{row.filename}</td>
                                            <td className="px-5 py-4 text-muted-foreground font-sans text-xs">{row.uploadedAt}</td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                {row.status === 'PROCESSING' && <Badge variant="processing">Pending</Badge>}
                                                {row.status === 'ANALYZED' && <Badge variant="success">0 - Success</Badge>}
                                                {row.status === 'FAILED' && <Badge variant="destructive">1 - Error</Badge>}
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => viewJson(row.rawJson)}
                                                    className="flex items-center gap-2 rounded-md bg-[#1A1A1A] px-3 py-1.5 text-xs font-medium text-[#A5D6FF] hover:bg-[#2A2A2A] transition-colors"
                                                >
                                                    <Code size={14} /> Inspect JSON
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>

            {/* JSON Viewer Dialog overlaying the dark layout */}
            <Dialog.Root open={jsonModalOpen} onOpenChange={setJsonModalOpen}>
                <AnimatePresence>
                    {jsonModalOpen && (
                        <Dialog.Portal forceMount>
                            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" asChild>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                            </Dialog.Overlay>
                            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 flex h-[80vh] w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] flex-col rounded-xl border border-[#333] bg-[#0A0A0A] shadow-2xl" asChild>
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                                    <div className="flex items-center justify-between border-b border-[#333] bg-[#111] px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <Code className="text-muted-foreground" size={18} />
                                            <Dialog.Title className="text-sm font-bold text-white tracking-wider uppercase">Pipeline Output Document</Dialog.Title>
                                        </div>
                                        <Dialog.Close asChild>
                                            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-[#333] hover:text-white"><X size={18} /></button>
                                        </Dialog.Close>
                                    </div>
                                    <div className="flex-1 overflow-auto p-6">
                                        <pre className="text-[13px] leading-loose text-[#A5D6FF] font-mono whitespace-pre-wrap">
                                            {JSON.stringify(activeJson, null, 2)}
                                        </pre>
                                    </div>
                                </motion.div>
                            </Dialog.Content>
                        </Dialog.Portal>
                    )}
                </AnimatePresence>
            </Dialog.Root>
        </div>
    );
}

// Minimal Activity Icon (missing from imports above)
function Activity({ size = 24, className }: { size?: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    )
}

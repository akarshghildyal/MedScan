'use client';

import React, { useState } from 'react';
import { UploadStrip } from '@/components/ui/UploadStrip';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import { Code, Terminal } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { ThemeToggle } from '@/components/features/ThemeToggle';
import { useDemoData } from '@/hooks/useDemoData';

interface DevReportRow {
    id: string;
    filename: string;
    status: StatusType;
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
    const demoData = useDemoData();
    const reports = demoData ? demoData.pipeline : mockReports;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Modal state
    const [jsonModalOpen, setJsonModalOpen] = useState(false);
    const [activeJson, setActiveJson] = useState<any>(null);

    const viewJson = (json: any) => {
        setActiveJson(json);
        setJsonModalOpen(true);
    };

    const columns: Column<DevReportRow>[] = [
        { key: 'filename', header: 'Filename', render: (row) => <span className="font-mono text-[13px] text-text-primary">{row.filename}</span> },
        { key: 'uploadedAt', header: 'Uploaded At' },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        {
            key: 'actions', header: 'Actions', render: (row) => (
                <button
                    onClick={() => viewJson(row.rawJson)}
                    className="flex items-center gap-2 text-accent hover:text-white transition-colors text-[13px] font-bold"
                >
                    <Code className="h-4 w-4" /> View Raw JSON
                </button>
            )
        },
    ];

    return (
        <div className="force-dark min-h-screen bg-[#07090C] text-text-body font-mono flex flex-col">

            {/* Top Navigation Bar */}
            <header className="dashboard-nav sticky top-0 z-30 flex h-[64px] w-full items-center justify-between border-b border-border bg-[#0a0a0a] px-[20px] lg:px-[48px]">
                <div className="flex items-center gap-2">
                    <span className="font-sora text-[20px] font-bold text-text-primary tracking-tight">MedScan</span>
                    {demoData && <span className="rounded-[4px] bg-accent/10 border border-accent/20 px-[6px] py-[2px] text-[10px] font-bold tracking-widest text-accent uppercase ml-1">DEMO</span>}
                    <span className="text-[12px] font-mono text-status-low bg-status-low/10 px-2 py-0.5 rounded-full ml-1">DEV</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-text-primary">SysAdmin</span>
                    <ThemeToggle />
                    <button className="text-sm text-text-muted hover:text-status-high transition-colors">
                        Logout
                    </button>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1280px] px-[20px] lg:px-[48px] py-[48px] flex flex-col gap-[32px] flex-1">

                {/* Header */}
                <div className="flex items-center gap-4 border-b border-border pb-6">
                    <Terminal className="text-accent h-6 w-6" />
                    <h1 className="text-[24px] font-bold text-text-primary tracking-tight">MedScan Developer Console</h1>
                </div>

                {/* Uploader */}
                <div>
                    <h2 className="text-[16px] text-text-primary mb-4 font-bold uppercase tracking-wider">Test Pipeline Input</h2>
                    <UploadStrip
                        onFileSelect={setSelectedFile}
                        onClear={() => setSelectedFile(null)}
                        selectedFile={selectedFile}
                    />
                </div>

                {/* Console History Table */}
                <div className="mt-8">
                    <h2 className="text-[16px] text-text-primary mb-4 font-bold uppercase tracking-wider">Pipeline Execution Logs</h2>
                    <DataTable
                        columns={columns}
                        rows={reports}
                        getRowKey={(r) => r.id}
                    />
                </div>

                {/* JSON Viewer Modal */}
                <Dialog.Root open={jsonModalOpen} onOpenChange={setJsonModalOpen}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80" />
                        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 flex h-[80vh] w-full max-w-[800px] translate-x-[-50%] translate-y-[-50%] flex-col rounded-[8px] bg-[#111] border border-border shadow-2xl">
                            <div className="flex justify-between items-center border-b border-border p-4 bg-black">
                                <Dialog.Title className="text-[14px] font-bold text-text-primary">Pipeline Document Result</Dialog.Title>
                                <Dialog.Close asChild><button className="text-text-muted hover:text-text-primary"><X className="h-5 w-5" /></button></Dialog.Close>
                            </div>
                            <div className="flex-1 overflow-auto p-4 bg-[#0a0a0a]">
                                <pre className="text-[13px] text-[#A5D6FF] font-mono leading-relaxed">
                                    {JSON.stringify(activeJson, null, 2)}
                                </pre>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

            </main>
        </div>
    );
}

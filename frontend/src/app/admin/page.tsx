'use client';

import React, { useState } from 'react';
import { UserPlus, Link as LinkIcon, Edit2, Trash2 } from 'lucide-react';
import { MetricChip } from '@/components/ui/MetricChip';
import { DataTable, Column } from '@/components/ui/DataTable';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface PatientRow { id: string; name: string; email: string; assignedDoctors: string[]; }
interface DoctorRow { id: string; name: string; email: string; hospitalId: string; assignedPatients: number; }

const mockPatients: PatientRow[] = [
    { id: 'PT-8932', name: 'John Doe', email: 'john@example.com', assignedDoctors: ['Dr. Smith'] },
    { id: 'PT-4021', name: 'Alice Smith', email: 'alice@example.com', assignedDoctors: [] },
];

const mockDoctors: DoctorRow[] = [
    { id: 'DOC-101', name: 'Dr. Sarah Smith', email: 'smith@hospital.org', hospitalId: 'HOSP-A', assignedPatients: 1 },
    { id: 'DOC-102', name: 'Dr. William Chen', email: 'chen@hospital.org', hospitalId: 'HOSP-A', assignedPatients: 0 },
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'patients' | 'doctors'>('patients');

    // Modals state
    const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
    const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);

    // Stats
    const activeAssignmentsCount = mockPatients.reduce((sum, p) => sum + p.assignedDoctors.length, 0);

    const patientColumns: Column<PatientRow>[] = [
        { key: 'name', header: 'Name', render: (row) => <span className="font-bold text-text-primary">{row.name}</span> },
        { key: 'email', header: 'Email' },
        {
            key: 'assignedDoctors', header: 'Assigned Doctors', render: (row) => (
                <span className="text-text-muted">
                    {row.assignedDoctors.length > 0 ? row.assignedDoctors.join(', ') : 'None'}
                </span>
            )
        },
        {
            key: 'actions', header: 'Actions', render: () => (
                <div className="flex gap-2">
                    <button className="text-text-muted hover:text-accent p-1"><Edit2 className="h-4 w-4" /></button>
                    <button className="text-text-muted hover:text-status-high p-1"><Trash2 className="h-4 w-4" /></button>
                </div>
            )
        },
    ];

    const doctorColumns: Column<DoctorRow>[] = [
        { key: 'name', header: 'Name', render: (row) => <span className="font-bold text-text-primary">{row.name}</span> },
        { key: 'email', header: 'Email' },
        { key: 'hospitalId', header: 'Hospital ID', render: (row) => <span className="font-mono text-text-muted">{row.hospitalId}</span> },
        { key: 'assignedPatients', header: 'Assigned Patients' },
        {
            key: 'actions', header: 'Actions', render: () => (
                <div className="flex gap-2">
                    <button className="text-text-muted hover:text-accent p-1"><Edit2 className="h-4 w-4" /></button>
                    <button className="text-text-muted hover:text-status-high p-1"><Trash2 className="h-4 w-4" /></button>
                </div>
            )
        },
    ];

    const FormModal = ({ open, onOpenChange, title, fields, buttonLabel }: any) => (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 flex w-full max-w-[400px] translate-x-[-50%] translate-y-[-50%] flex-col rounded-[8px] bg-bg-base border border-border shadow-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <Dialog.Title className="font-sora text-[18px] font-bold text-text-primary">{title}</Dialog.Title>
                        <Dialog.Close asChild><button className="text-text-muted hover:text-text-primary p-1"><X className="h-5 w-5" /></button></Dialog.Close>
                    </div>
                    <div className="flex flex-col gap-4">
                        {fields.map((f: any, i: number) => (
                            <div key={i} className="flex flex-col gap-1">
                                <label className="text-[12px] font-medium uppercase tracking-wider text-text-muted">{f.label}</label>
                                {f.type === 'select' ? (
                                    <select className="h-[44px] rounded-[6px] border border-border bg-bg-surface px-[16px] text-[15px] font-sans text-text-primary outline-none focus:border-accent">
                                        {f.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <input type={f.type || 'text'} placeholder={f.placeholder} className="h-[44px] rounded-[6px] border border-border bg-bg-surface px-[16px] text-[15px] font-sans text-text-primary outline-none focus:border-accent" />
                                )}
                            </div>
                        ))}
                        <button className="mt-4 w-full h-[44px] rounded-[4px] bg-accent font-bold text-bg-base hover:brightness-110">{buttonLabel}</button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );

    return (
        <div className="min-h-screen bg-bg-base text-text-body flex flex-col">

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-30 flex h-[64px] w-full items-center justify-between border-b border-border bg-bg-surface px-[20px] lg:px-[48px]">
                <div className="flex items-center gap-2">
                    <span className="font-sora text-[20px] font-bold text-text-primary tracking-tight">MedScan</span>
                    <span className="text-[12px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full ml-2">ADMIN</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-text-primary">Hospital Admin</span>
                    <button className="text-sm text-text-muted hover:text-status-high transition-colors">
                        Logout
                    </button>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1280px] px-[20px] lg:px-[48px] py-[48px] flex flex-col gap-[32px] flex-1">

                {/* Header Row */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                    <div>
                        <h1 className="font-sora text-[28px] font-bold text-text-primary mb-1">Hospital Admin Dashboard</h1>
                        <p className="text-text-muted">Manage patient and doctor assignments</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <MetricChip label="Total Patients" value={mockPatients.length} />
                        <MetricChip label="Total Doctors" value={mockDoctors.length} />
                        <MetricChip label="Active Assignments" value={activeAssignmentsCount} />
                    </div>
                </div>

                {/* Tab Nav & Actions */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('patients')}
                            className={`font-sora text-[15px] font-bold pb-[18px] -mb-[18px] border-b-[2px] transition-colors ${activeTab === 'patients' ? 'text-accent border-accent' : 'text-text-muted border-transparent hover:text-text-primary'}`}
                        >
                            Patients
                        </button>
                        <button
                            onClick={() => setActiveTab('doctors')}
                            className={`font-sora text-[15px] font-bold pb-[18px] -mb-[18px] border-b-[2px] transition-colors ${activeTab === 'doctors' ? 'text-accent border-accent' : 'text-text-muted border-transparent hover:text-text-primary'}`}
                        >
                            Doctors
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsAssignOpen(true)} className="flex items-center gap-2 bg-bg-elevated border border-border text-text-primary hover:bg-white/[0.05] rounded-[4px] px-4 py-2 text-[13px] font-bold transition-all">
                            <LinkIcon className="h-4 w-4" /> Assign Doctor
                        </button>
                        <button
                            onClick={() => activeTab === 'patients' ? setIsAddPatientOpen(true) : setIsAddDoctorOpen(true)}
                            className="flex items-center gap-2 bg-accent text-bg-base hover:brightness-110 rounded-[4px] px-4 py-2 text-[13px] font-bold transition-all"
                        >
                            <UserPlus className="h-4 w-4" />
                            Add {activeTab === 'patients' ? 'Patient' : 'Doctor'}
                        </button>
                    </div>
                </div>

                {/* Data Tables */}
                <div>
                    {activeTab === 'patients' ? (
                        <DataTable columns={patientColumns} rows={mockPatients} getRowKey={(r) => r.id} />
                    ) : (
                        <DataTable columns={doctorColumns} rows={mockDoctors} getRowKey={(r) => r.id} />
                    )}
                </div>

                {/* Modals */}
                <FormModal
                    open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen} title="Add Patient" buttonLabel="Create Patient"
                    fields={[
                        { label: 'Full Name', placeholder: 'Jane Doe' },
                        { label: 'Email', type: 'email', placeholder: 'jane@example.com' },
                        { label: 'Hospital ID', placeholder: 'HOSP-A' }
                    ]}
                />
                <FormModal
                    open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen} title="Add Doctor" buttonLabel="Create Doctor"
                    fields={[
                        { label: 'Full Name', placeholder: 'Dr. John Smith' },
                        { label: 'Email', type: 'email', placeholder: 'smith@hospital.org' },
                        { label: 'Specialty', placeholder: 'General Pathology' }
                    ]}
                />
                <FormModal
                    open={isAssignOpen} onOpenChange={setIsAssignOpen} title="Assign Doctor to Patient" buttonLabel="Create Assignment"
                    fields={[
                        { label: 'Select Patient', type: 'select', options: ['Select a patient...', ...mockPatients.map(p => p.name)] },
                        { label: 'Select Doctor', type: 'select', options: ['Select a doctor...', ...mockDoctors.map(d => d.name)] }
                    ]}
                />

            </main>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Link as LinkIcon, Edit2, Trash2 } from 'lucide-react';
import { MetricChip } from '@/components/ui/MetricChip';
import { DataTable, Column } from '@/components/ui/DataTable';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { ThemeToggle } from '@/components/features/ThemeToggle';
import { fetchApi } from '@/lib/api';

interface PatientRow { id: string; name: string; email: string; assignedDoctors: string[]; }
interface DoctorRow { id: string; name: string; email: string; hospitalId: string; assignedPatients: number; }

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'patients' | 'doctors'>('patients');

    // Data state
    const [patients, setPatients] = useState<PatientRow[]>([]);
    const [doctors, setDoctors] = useState<DoctorRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modals state
    const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
    const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);

    // Form states
    const [patientForm, setPatientForm] = useState({ name: '', email: '', hospitalId: '' });
    const [doctorForm, setDoctorForm] = useState({ name: '', email: '', specialty: '' });
    const [assignForm, setAssignForm] = useState({ patientId: '', doctorId: '' });

    // Load data
    const loadData = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('medscan-token') : null;
        if (!token) {
            window.location.href = '/login';
            return;
        }

        try {
            setIsLoading(true);
            const [patientsData, doctorsData] = await Promise.all([
                fetchApi('/admin/patients'),
                fetchApi('/admin/doctors')
            ]);

            const mappedPatients: PatientRow[] = patientsData.map((p: any) => ({
                id: p.id,
                name: p.full_name,
                email: p.email,
                assignedDoctors: [] // TODO: fetch assignments
            }));

            const mappedDoctors: DoctorRow[] = doctorsData.map((d: any) => ({
                id: d.id,
                name: d.full_name,
                email: d.email,
                hospitalId: 'HOSP-A', // TODO: add hospital ID to model
                assignedPatients: 0 // TODO: fetch assignments
            }));

            setPatients(mappedPatients);
            setDoctors(mappedDoctors);
        } catch (error: any) {
            console.error('Error loading data:', error);
            if (error.message === 'Not authenticated' || error.message.includes('valid')) {
                window.location.href = '/login';
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Submit handlers
    const handleAddPatient = async () => {
        try {
            await fetchApi('/admin/patients', {
                method: 'POST',
                body: JSON.stringify({ email: patientForm.email })
            });
            setIsAddPatientOpen(false);
            setPatientForm({ name: '', email: '', hospitalId: '' });
            loadData();
        } catch (error: any) {
            alert(error.message || 'Failed to link patient');
            console.error('Error adding patient:', error);
        }
    };

    const handleAddDoctor = async () => {
        try {
            await fetchApi('/admin/doctors', {
                method: 'POST',
                body: JSON.stringify({ email: doctorForm.email })
            });
            setIsAddDoctorOpen(false);
            setDoctorForm({ name: '', email: '', specialty: '' });
            loadData();
        } catch (error: any) {
            alert(error.message || 'Failed to link doctor');
            console.error('Error adding doctor:', error);
        }
    };

    const handleAssign = async () => {
        try {
            await fetchApi('/admin/assign', {
                method: 'POST',
                body: JSON.stringify({
                    patient_id: assignForm.patientId,
                    doctor_id: assignForm.doctorId
                })
            });
            setIsAssignOpen(false);
            setAssignForm({ patientId: '', doctorId: '' });
            loadData();
        } catch (error) {
            console.error('Error assigning:', error);
        }
    };

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

    const FormModal = ({ open, onOpenChange, title, fields, buttonLabel, onSubmit }: any) => (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 flex w-full max-w-[400px] translate-x-[-50%] translate-y-[-50%] flex-col rounded-[8px] bg-bg-base border border-border shadow-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <Dialog.Title className="font-sora text-[18px] font-bold text-text-primary">{title}</Dialog.Title>
                        <Dialog.Close asChild><button className="text-text-muted hover:text-text-primary p-1"><X className="h-5 w-5" /></button></Dialog.Close>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
                        <div className="flex flex-col gap-4">
                            {fields.map((f: any, i: number) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <label className="text-[12px] font-medium uppercase tracking-wider text-text-muted">{f.label}</label>
                                    {f.type === 'select' ? (
                                        <select
                                            value={f.value || ''}
                                            onChange={(e) => f.onChange && f.onChange(e.target.value)}
                                            className="h-[44px] rounded-[6px] border border-border bg-bg-surface px-[16px] text-[15px] font-sans text-text-primary outline-none focus:border-accent"
                                        >
                                            {f.optionLabels ? (
                                                f.options.map((opt: string) => {
                                                    const isPlaceholder = opt.startsWith('Select a');
                                                    const val = isPlaceholder ? '' : opt;
                                                    const label = f.optionLabels[val] || opt;
                                                    return <option key={opt} value={val}>{label}</option>;
                                                })
                                            ) : (
                                                f.options.map((opt: string) => <option key={opt} value={opt.startsWith('Select a') ? '' : opt}>{opt}</option>)
                                            )}
                                        </select>
                                    ) : (
                                        <input
                                            type={f.type || 'text'}
                                            placeholder={f.placeholder}
                                            value={f.value || ''}
                                            onChange={(e) => f.onChange && f.onChange(e.target.value)}
                                            className="h-[44px] rounded-[6px] border border-border bg-bg-surface px-[16px] text-[15px] font-sans text-text-primary outline-none focus:border-accent"
                                        />
                                    )}
                                </div>
                            ))}
                            <button type="submit" className="mt-4 w-full h-[44px] rounded-[4px] bg-accent font-bold text-bg-base hover:brightness-110">{buttonLabel}</button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );

    const activeAssignmentsCount = doctors.reduce((sum, doc) => sum + doc.assignedPatients, 0);

    return (
        <div className="min-h-screen bg-bg-base text-text-body flex flex-col">

            {/* Top Navigation Bar */}
            <header className="dashboard-nav sticky top-0 z-30 flex h-[64px] w-full items-center justify-between border-b border-border bg-bg-surface px-[20px] lg:px-[48px]">
                <div className="flex items-center gap-2">
                    <span className="font-sora text-[20px] font-bold text-text-primary tracking-tight">MedScan</span>
                    <span className="text-[12px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full ml-2">ADMIN</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-text-primary">Hospital Admin</span>
                    <ThemeToggle />
                    <button onClick={() => { localStorage.removeItem('medscan-token'); router.push('/login'); }} className="text-sm text-text-muted hover:text-status-high transition-colors">
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
                        <MetricChip label="Total Patients" value={patients.length} />
                        <MetricChip label="Total Doctors" value={doctors.length} />
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
                        <DataTable columns={patientColumns} rows={patients} getRowKey={(r) => r.id} />
                    ) : (
                        <DataTable columns={doctorColumns} rows={doctors} getRowKey={(r) => r.id} />
                    )}
                </div>

                {/* Modals */}
                <FormModal
                    open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen} title="Link Patient" buttonLabel="Link Patient" onSubmit={handleAddPatient}
                    fields={[
                        { label: 'Email', type: 'email', placeholder: 'patient@example.com', value: patientForm.email, onChange: (v: string) => setPatientForm(prev => ({ ...prev, email: v })) }
                    ]}
                />
                <FormModal
                    open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen} title="Link Doctor" buttonLabel="Link Doctor" onSubmit={handleAddDoctor}
                    fields={[
                        { label: 'Email', type: 'email', placeholder: 'doctor@hospital.org', value: doctorForm.email, onChange: (v: string) => setDoctorForm(prev => ({ ...prev, email: v })) }
                    ]}
                />
                <FormModal
                    open={isAssignOpen} onOpenChange={setIsAssignOpen} title="Assign Doctor to Patient" buttonLabel="Create Assignment" onSubmit={handleAssign}
                    fields={[
                        { label: 'Select Patient', type: 'select', options: ['Select a patient...', ...patients.map(p => p.id)], value: assignForm.patientId, onChange: (v: string) => setAssignForm(prev => ({ ...prev, patientId: v })), optionLabels: { '': 'Select a patient...', ...Object.fromEntries(patients.map(p => [p.id, `${p.name} (${p.email})`])) } },
                        { label: 'Select Doctor', type: 'select', options: ['Select a doctor...', ...doctors.map(d => d.id)], value: assignForm.doctorId, onChange: (v: string) => setAssignForm(prev => ({ ...prev, doctorId: v })), optionLabels: { '': 'Select a doctor...', ...Object.fromEntries(doctors.map(d => [d.id, `${d.name} (${d.email})`])) } }
                    ]}
                />

            </main>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, FileText, Activity, Link as LinkIcon, Edit2, Trash2, X } from 'lucide-react';
import { fetchApi } from '@/lib/api';

import { DashboardHeader } from '@/components/DashboardHeader';
import { MetricCard } from '@/components/MetricCard';
import { Badge } from '@/components/ui/badge';
import * as Dialog from '@radix-ui/react-dialog';

interface PatientRow { id: string; name: string; email: string; assignedDoctors: string[]; }
interface DoctorRow { id: string; name: string; email: string; hospitalId: string; assignedPatients: number; }

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'patients' | 'doctors'>('patients');

    const [patients, setPatients] = useState<PatientRow[]>([]);
    const [doctors, setDoctors] = useState<DoctorRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
    const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);

    const [patientForm, setPatientForm] = useState({ name: '', email: '', hospitalId: '' });
    const [doctorForm, setDoctorForm] = useState({ name: '', email: '', specialty: '' });
    const [assignForm, setAssignForm] = useState({ patientId: '', doctorId: '' });

    const loadData = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('medscan-token') : null;
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            setIsLoading(true);
            const [patientsData, doctorsData, assignmentsData] = await Promise.all([
                fetchApi('/admin/patients'),
                fetchApi('/admin/doctors'),
                fetchApi('/admin/assignments')
            ]);

            const mappedPatients: PatientRow[] = patientsData.map((p: any) => {
                const patientAssignments = assignmentsData.filter((a: any) => a.patient_id === p.id);
                return {
                    id: p.id,
                    name: p.full_name,
                    email: p.email,
                    assignedDoctors: patientAssignments.map((a: any) => a.doctor_name)
                };
            });

            const mappedDoctors: DoctorRow[] = doctorsData.map((d: any) => {
                const doctorAssignments = assignmentsData.filter((a: any) => a.doctor_id === d.id);
                return {
                    id: d.id,
                    name: d.full_name,
                    email: d.email,
                    hospitalId: 'HOSP-A',
                    assignedPatients: doctorAssignments.length
                };
            });

            setPatients(mappedPatients);
            setDoctors(mappedDoctors);
        } catch (error: any) {
            console.error('Error loading data:', error);
            if (error.message === 'Not authenticated' || error.message?.includes('valid')) {
                router.push('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddPatient = async () => {
        try {
            await fetchApi('/admin/patients', { method: 'POST', body: JSON.stringify({ email: patientForm.email }) });
            setIsAddPatientOpen(false);
            setPatientForm({ name: '', email: '', hospitalId: '' });
            loadData();
        } catch (error: any) {
            alert(error.message || 'Failed to link patient');
        }
    };

    const handleAddDoctor = async () => {
        try {
            await fetchApi('/admin/doctors', { method: 'POST', body: JSON.stringify({ email: doctorForm.email }) });
            setIsAddDoctorOpen(false);
            setDoctorForm({ name: '', email: '', specialty: '' });
            loadData();
        } catch (error: any) {
            alert(error.message || 'Failed to link doctor');
        }
    };

    const handleAssign = async () => {
        try {
            await fetchApi('/admin/assign', {
                method: 'POST',
                body: JSON.stringify({ patient_id: assignForm.patientId, doctor_id: assignForm.doctorId })
            });
            setIsAssignOpen(false);
            setAssignForm({ patientId: '', doctorId: '' });
            loadData();
        } catch (error) {
            console.error('Error assigning:', error);
        }
    };

    const totalSystemUsers = patients.length + doctors.length;
    const activeAssignments = patients.reduce((acc, p) => acc + p.assignedDoctors.length, 0);

    const FormModal = ({ open, onOpenChange, title, fields, onSubmit }: any) => (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <AnimatePresence>
                {open && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" asChild>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                        </Dialog.Overlay>
                        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 flex w-full max-w-md translate-x-[-50%] translate-y-[-50%] flex-col rounded-xl border bg-card p-6 shadow-elevated" asChild>
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title className="text-xl font-bold text-card-foreground">{title}</Dialog.Title>
                                    <Dialog.Close asChild>
                                        <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><X size={20} /></button>
                                    </Dialog.Close>
                                </div>
                                <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
                                    {fields.map((f: any, i: number) => (
                                        <div key={i}>
                                            <label className="mb-1.5 block text-sm font-medium text-foreground">{f.label}</label>
                                            {f.type === 'select' ? (
                                                <select
                                                    value={f.value}
                                                    onChange={e => f.onChange(e.target.value)}
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                >
                                                    {f.options.map((opt: any) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={f.type || 'text'}
                                                    placeholder={f.placeholder}
                                                    value={f.value}
                                                    onChange={e => f.onChange(e.target.value)}
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                    required
                                                />
                                            )}
                                        </div>
                                    ))}
                                    <div className="mt-6 flex justify-end gap-2">
                                        <Dialog.Close asChild>
                                            <button type="button" className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">Cancel</button>
                                        </Dialog.Close>
                                        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Save</button>
                                    </div>
                                </form>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <DashboardHeader userName="Admin User" roleOverride="Admin" />

            <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 p-6 lg:p-10">
                {/* 1. Header & Actions Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Hospital Management</h1>
                        <p className="text-sm text-muted-foreground mt-1">Manage users and relationship mappings</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setIsAddPatientOpen(true)} className="flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors">
                            <UserPlus size={16} /> New Patient
                        </button>
                        <button onClick={() => setIsAddDoctorOpen(true)} className="flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors">
                            <UserPlus size={16} /> New Doctor
                        </button>
                        <button onClick={() => setIsAssignOpen(true)} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow transition-colors">
                            <LinkIcon size={16} /> Assign Patient
                        </button>
                    </div>
                </div>

                {/* 2. Metric Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <MetricCard title="Total Doctors" value={doctors.length} icon={Activity} accent="primary" delay={0.1} />
                    <MetricCard title="Total Patients" value={patients.length} icon={Users} accent="info" delay={0.2} />
                    <MetricCard title="Active Assignments" value={activeAssignments} icon={LinkIcon} accent="success" delay={0.3} />
                    <MetricCard title="System Users" value={totalSystemUsers} icon={FileText} accent="warning" delay={0.4} />
                </div>

                {/* 3. Tabs Row */}
                <div className="flex justify-center sm:justify-start">
                    <div className="flex rounded-md bg-muted p-1">
                        <button
                            onClick={() => setActiveTab('patients')}
                            className={`rounded-sm px-4 py-2 text-sm font-medium transition-all ${activeTab === 'patients'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            Enrolled Patients
                        </button>
                        <button
                            onClick={() => setActiveTab('doctors')}
                            className={`rounded-sm px-4 py-2 text-sm font-medium transition-all ${activeTab === 'doctors'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            Registered Doctors
                        </button>
                    </div>
                </div>

                {/* 4. Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-xl border bg-card shadow-soft overflow-hidden"
                    >
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/30">
                                <tr>
                                    <th className="px-5 py-4 text-left font-medium text-muted-foreground">Name</th>
                                    <th className="px-5 py-4 text-left font-medium text-muted-foreground">Email</th>
                                    {activeTab === 'patients' ? (
                                        <th className="px-5 py-4 text-left font-medium text-muted-foreground">Assigned Doctors</th>
                                    ) : (
                                        <>
                                            <th className="px-5 py-4 text-left font-medium text-muted-foreground">Hospital ID</th>
                                            <th className="px-5 py-4 text-left font-medium text-muted-foreground">Assigned Patients</th>
                                        </>
                                    )}
                                    <th className="px-5 py-4 text-left font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(activeTab === 'patients' ? patients : doctors).length === 0 && !isLoading ? (
                                    <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No records found.</td></tr>
                                ) : (
                                    (activeTab === 'patients' ? patients : doctors).map((row: any, i) => (
                                        <motion.tr key={row.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b last:border-0 hover:bg-muted/20">
                                            <td className="px-5 py-4 font-semibold text-foreground">{row.name}</td>
                                            <td className="px-5 py-4 text-muted-foreground">{row.email}</td>
                                            {activeTab === 'patients' ? (
                                                <td className="px-5 py-4">
                                                    {row.assignedDoctors.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {row.assignedDoctors.map((d: string) => (
                                                                <Badge key={d} variant="secondary">{d}</Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">None</span>
                                                    )}
                                                </td>
                                            ) : (
                                                <>
                                                    <td className="px-5 py-4 font-mono text-muted-foreground">{row.hospitalId}</td>
                                                    <td className="px-5 py-4 font-mono text-muted-foreground">{row.assignedPatients}</td>
                                                </>
                                            )}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button className="rounded p-1.5 text-muted-foreground hover:bg-muted transition-colors"><Edit2 size={16} /></button>
                                                    <button className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </motion.div>
                </AnimatePresence>
            </main>

            <FormModal
                open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen} title="Link New Patient"
                onSubmit={handleAddPatient}
                fields={[
                    { label: 'Patient Email', type: 'email', value: patientForm.email, onChange: (v: string) => setPatientForm({ ...patientForm, email: v }), placeholder: 'patient@example.com' }
                ]}
            />

            <FormModal
                open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen} title="Link New Doctor"
                onSubmit={handleAddDoctor}
                fields={[
                    { label: 'Doctor Email', type: 'email', value: doctorForm.email, onChange: (v: string) => setDoctorForm({ ...doctorForm, email: v }), placeholder: 'dr.smith@example.com' }
                ]}
            />

            <FormModal
                open={isAssignOpen} onOpenChange={setIsAssignOpen} title="Assign Patient to Doctor"
                onSubmit={handleAssign}
                fields={[
                    {
                        label: 'Patient', type: 'select', value: assignForm.patientId, onChange: (v: string) => setAssignForm({ ...assignForm, patientId: v }),
                        options: [{ label: 'Select Patient...', value: '' }, ...patients.map(p => ({ label: `${p.name} (${p.email})`, value: p.id }))]
                    },
                    {
                        label: 'Doctor', type: 'select', value: assignForm.doctorId, onChange: (v: string) => setAssignForm({ ...assignForm, doctorId: v }),
                        options: [{ label: 'Select Doctor...', value: '' }, ...doctors.map(d => ({ label: `${d.name} (${d.email})`, value: d.id }))]
                    }
                ]}
            />
        </div>
    );
}

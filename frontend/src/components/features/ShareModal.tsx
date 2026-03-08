'use client';

import React, { useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, CheckCircle, Loader2, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchApi } from '@/lib/api';

interface ShareModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reportId?: string;
}

interface DoctorInfo {
    doctor_id: string;
    doctor_name: string;
    doctor_email: string;
}

export function ShareModal({ open, onOpenChange, reportId }: ShareModalProps) {
    const [doctorEmail, setDoctorEmail] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLooking, setIsLooking] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);

    // Debounced doctor lookup
    const lookupDoctor = useCallback(async (email: string) => {
        if (!email.trim() || !email.includes('@')) {
            setDoctorInfo(null);
            return;
        }

        setIsLooking(true);
        setError(null);
        try {
            const data = await fetchApi(`/reports/doctor-lookup?email=${encodeURIComponent(email)}`);
            setDoctorInfo(data);
            setError(null);
        } catch (err: any) {
            setDoctorInfo(null);
            if (err.message?.includes('not found')) {
                setError('No doctor found with this email');
            } else if (err.message?.includes('not a doctor')) {
                setError('This user is not registered as a doctor');
            } else {
                setError(err.message || 'Could not verify doctor');
            }
        } finally {
            setIsLooking(false);
        }
    }, []);

    const handleEmailChange = (email: string) => {
        setDoctorEmail(email);
        setDoctorInfo(null);
        setError(null);
    };

    const handleLookup = () => {
        lookupDoctor(doctorEmail);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!doctorEmail.trim() || !reportId) return;

        setIsSharing(true);
        setError(null);
        try {
            await fetchApi('/reports/share', {
                method: 'POST',
                body: JSON.stringify({
                    report_id: reportId,
                    doctor_email: doctorEmail
                })
            });
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to share report');
        } finally {
            setIsSharing(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange(newOpen);
        if (!newOpen) {
            setTimeout(() => {
                setDoctorEmail('');
                setIsSuccess(false);
                setError(null);
                setDoctorInfo(null);
                setIsLooking(false);
                setIsSharing(false);
            }, 200);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/60 transition-opacity duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-[90] flex w-full max-w-[420px] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-[8px] bg-bg-surface shadow-2xl border border-border duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] focus:outline-none">

                    <div className="flex items-center justify-between border-b border-border bg-bg-elevated px-[24px] py-[16px] shrink-0">
                        <Dialog.Title className="font-sora text-[18px] font-bold text-text-primary m-0">
                            Share with a Doctor
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-text-muted hover:text-text-primary rounded-full p-2 transition-colors focus:ring-accent focus:outline-none focus:ring-2">
                                <X className="h-5 w-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <div className="p-[24px]">
                        {isSuccess ? (
                            <div className="flex flex-col items-center justify-center py-6">
                                <CheckCircle className="h-16 w-16 text-status-normal mb-6 animate-in zoom-in spin-in-180 duration-500" />
                                <h3 className="font-sora text-[20px] font-bold text-text-primary mb-2">
                                    Report shared successfully
                                </h3>
                                <p className="text-[14px] text-text-muted text-center mb-2">
                                    Shared with <span className="font-bold text-text-primary">{doctorInfo?.doctor_name || doctorEmail}</span>
                                </p>
                                <p className="text-[13px] text-text-muted text-center mb-8">
                                    The doctor can now review your report and its AI analysis.
                                </p>
                                <Dialog.Close asChild>
                                    <button className="w-full bg-bg-elevated border border-border text-text-primary hover:bg-white/[0.02] rounded-[4px] py-[10px] text-[15px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-accent flex items-center justify-center">
                                        Close
                                    </button>
                                </Dialog.Close>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <div className="flex flex-col gap-[8px]">
                                    <label className="font-sans text-[12px] font-medium tracking-[0.08em] uppercase text-text-muted">
                                        Doctor&apos;s Email
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            value={doctorEmail}
                                            onChange={(e) => handleEmailChange(e.target.value)}
                                            placeholder="doctor@hospital.org"
                                            className={cn(
                                                'h-[44px] flex-1 rounded-[6px] border bg-bg-base px-[16px] text-[15px] font-sans text-text-primary transition-all duration-200 outline-none placeholder:text-text-muted',
                                                error
                                                    ? 'border-status-high focus:border-status-high focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
                                                    : doctorInfo
                                                        ? 'border-status-normal focus:border-status-normal focus:shadow-[0_0_0_3px_rgba(34,197,94,0.15)]'
                                                        : 'border-border focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,201,167,0.15)]'
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleLookup}
                                            disabled={!doctorEmail.trim() || !doctorEmail.includes('@') || isLooking}
                                            className="h-[44px] px-4 rounded-[6px] border border-border bg-bg-elevated text-text-primary hover:bg-white/[0.05] disabled:opacity-40 text-[13px] font-bold transition-all flex items-center gap-2"
                                        >
                                            {isLooking ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                'Verify'
                                            )}
                                        </button>
                                    </div>

                                    {/* Doctor info card */}
                                    {doctorInfo && (
                                        <div className="flex items-center gap-3 p-3 rounded-[6px] bg-status-normal/10 border border-status-normal/30 mt-1">
                                            <UserCheck className="h-5 w-5 text-status-normal shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-bold text-text-primary">{doctorInfo.doctor_name}</span>
                                                <span className="text-[12px] text-text-muted">{doctorInfo.doctor_email}</span>
                                            </div>
                                        </div>
                                    )}

                                    {error && <span className="text-[12px] text-status-high">{error}</span>}

                                    <p className="text-[12px] text-text-muted mt-1 leading-[1.5]">
                                        Enter the doctor&apos;s email and click Verify to confirm. The doctor will have read-only access to this report and its AI analysis.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!doctorInfo || isSharing}
                                    className="w-full bg-accent text-bg-base hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 rounded-[4px] py-[10px] text-[15px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-surface flex items-center justify-center gap-2"
                                >
                                    {isSharing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Sharing...
                                        </>
                                    ) : (
                                        'Share Report'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

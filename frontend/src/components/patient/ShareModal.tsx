'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserCheck, X, Trash2 } from 'lucide-react';

export interface ShareModalProps {
    open: boolean;
    onClose: () => void;
    filename: string;
}

export function ShareModal({ open, onClose, filename }: ShareModalProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const doctors = [
        { id: 1, name: 'Dr. Sarah Collins', hospital: 'HSP-001' },
        { id: 2, name: 'Dr. Raj Patel', hospital: 'HSP-002' },
        { id: 3, name: 'Dr. Emily Chen', hospital: 'HSP-001' },
    ];

    const sharedWith = [
        { id: 1, name: 'Dr. Sarah Collins', date: 'Oct 12, 2025' }
    ];

    const filteredDoctors = doctors.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-elevated flex flex-col"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-card-foreground">Share Report</h2>
                                <p className="text-sm text-muted-foreground">{filename}</p>
                            </div>
                            <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Find Doctor</label>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search by name or hospital ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>

                        {searchQuery && (
                            <div className="mb-6 max-h-32 overflow-y-auto rounded-lg border">
                                {filteredDoctors.length > 0 ? (
                                    filteredDoctors.map(doc => (
                                        <button key={doc.id} className="w-full flex items-center gap-3 border-b border-border/50 p-3 text-left hover:bg-muted last:border-0 transition-colors">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                {doc.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-foreground">{doc.name}</div>
                                                <div className="text-xs text-muted-foreground">{doc.hospital}</div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-3 text-center text-sm text-muted-foreground">No doctors found.</div>
                                )}
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="mb-3 text-sm font-medium text-foreground">Currently Shared With</h3>
                            <div className="space-y-2">
                                {sharedWith.map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center rounded-full bg-success/15 p-1.5 text-success">
                                                <UserCheck size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{doc.name}</p>
                                                <p className="text-xs text-muted-foreground">Shared {doc.date}</p>
                                            </div>
                                        </div>
                                        <button className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" title="Revoke Access">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-auto">
                            <button
                                onClick={onClose}
                                className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onClose}
                                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                Share Report
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

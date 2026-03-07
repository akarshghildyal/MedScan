'use client';

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, X, FileText, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadStripProps {
    onFileSelect: (file: File) => void;
    onClear: () => void;
    state?: 'idle' | 'uploading' | 'success';
    progress?: number;
    className?: string;
    selectedFile: File | null;
}

export function UploadStrip({
    onFileSelect,
    onClear,
    state = 'idle',
    progress = 0,
    className,
    selectedFile,
}: UploadStripProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [errorPattern, setErrorPattern] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const validateAndSelect = (file: File) => {
        setErrorPattern(null);
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setErrorPattern('Please upload a valid PDF file.');
            return;
        }
        onFileSelect(file);
    };

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) validateAndSelect(file);
        },
        [onFileSelect]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) validateAndSelect(file);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div
            className={cn(
                'group relative flex w-full flex-col gap-4 rounded-[6px] bg-bg-surface p-[24px] transition-all duration-200',
                isDragOver
                    ? 'border-accent border-solid bg-accent/5'
                    : 'border-border border-dashed border-[1px] hover:border-accent hover:border-[1.5px]',
                className
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,application/pdf"
                onChange={handleChange}
            />

            {errorPattern && (
                <div className="absolute top-[-24px] left-0 text-[11px] font-medium text-status-high">
                    {errorPattern}
                </div>
            )}

            {selectedFile ? (
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="rounded-md bg-bg-elevated p-3">
                            <FileText className="text-accent h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-sans text-[15px] font-medium text-text-primary">
                                {selectedFile.name}
                            </span>
                            <span className="text-[13px] text-text-muted">
                                {formatSize(selectedFile.size)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {state === 'uploading' && (
                            <div className="flex w-32 items-center gap-2">
                                <div className="h-2 w-full overflow-hidden rounded-full bg-bg-elevated">
                                    <div
                                        className="bg-accent h-full transition-all duration-200 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="font-mono text-[11px] text-text-muted">
                                    {progress}%
                                </span>
                            </div>
                        )}
                        {state === 'success' && (
                            <div className="flex items-center gap-2 text-status-normal">
                                <CheckCircle className="h-5 w-5" />
                                <span className="text-[13px] font-medium">Uploaded</span>
                            </div>
                        )}
                        {state !== 'uploading' && (
                            <button
                                type="button"
                                onClick={onClear}
                                className="text-text-muted hover:text-status-high rounded-full p-2 transition-colors focus:ring-accent focus:outline-none focus:ring-2"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex w-full items-center justify-between sm:flex-row flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="rounded-md bg-bg-elevated p-3 transition-colors group-hover:bg-accent/10">
                            <UploadCloud className="text-accent h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="font-sans text-[20px] font-semibold text-text-primary">
                                Upload Pathology Report
                            </h2>
                            <p className="font-sans text-[15px] text-text-muted">
                                PDF format only · AI analysis in ~15 seconds
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-accent text-bg-base hover:brightness-110 focus:ring-accent rounded-[4px] px-6 py-[10px] text-[15px] font-bold transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-base focus:outline-none"
                    >
                        Upload PDF
                    </button>
                </div>
            )}
        </div>
    );
}

'use client';

import React from 'react';
import { Sparkles, TriangleAlert, Download, Share2, ChevronDown } from 'lucide-react';
import { RightDrawer } from '@/components/ui/RightDrawer';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import * as Accordion from '@radix-ui/react-accordion';
import { cn } from '@/lib/utils';

export interface MarkerValue {
    name: string;
    value: string;
    unit: string;
    range: string;
    status: StatusType;
}

interface ReportAnalysisDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filename: string;
    type: string;
    onShareClick?: () => void;
    onTrendClick: (markerName: string) => void;
    isDoctorView?: boolean;
    onReviewClick?: () => void;
}

const mockValues: MarkerValue[] = [
    { name: 'White Blood Cell', value: '11.8', unit: 'x10^9/L', range: '4.0 - 11.0', status: 'HIGH' },
    { name: 'Red Blood Cell', value: '4.8', unit: 'x10^12/L', range: '4.5 - 5.5', status: 'NORMAL' },
    { name: 'Hemoglobin', value: '135', unit: 'g/L', range: '130 - 170', status: 'NORMAL' },
    { name: 'Platelets', value: '250', unit: 'x10^9/L', range: '150 - 400', status: 'NORMAL' },
];

export function ReportAnalysisDrawer({
    open,
    onOpenChange,
    filename,
    type,
    onShareClick,
    onTrendClick,
    isDoctorView = false,
    onReviewClick,
}: ReportAnalysisDrawerProps) {

    const headerBadge = (
        <span className="inline-flex items-center rounded-md bg-bg-surface border border-border px-2 py-1 text-[11px] font-medium text-text-body">
            {type}
        </span>
    );

    const footer = (
        <div className="flex flex-col gap-3">
            {isDoctorView ? (
                <button
                    onClick={onReviewClick}
                    className="w-full bg-transparent border border-status-normal text-status-normal hover:bg-status-normal/10 rounded-[4px] py-[10px] text-[15px] font-bold transition-all focus:outline-none flex items-center justify-center gap-2"
                >
                    Mark as Reviewed
                </button>
            ) : (
                <button
                    onClick={onShareClick}
                    className="w-full bg-accent text-bg-base hover:brightness-110 rounded-[4px] py-[10px] text-[15px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-elevated flex items-center justify-center gap-2"
                >
                    <Share2 className="h-4 w-4" />
                    Share with Doctor
                </button>
            )}
            <button className="w-full bg-transparent border border-border text-text-primary hover:bg-white/[0.02] rounded-[4px] py-[10px] text-[15px] font-bold transition-all focus:outline-none flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                Download PDF
            </button>
        </div>
    );

    return (
        <RightDrawer
            open={open}
            onOpenChange={onOpenChange}
            title={filename}
            badge={headerBadge}
            footer={footer}
        >
            <div className="flex flex-col gap-[32px]">

                {/* Section 1 - AI Summary */}
                <div className="rounded-[6px] bg-bg-elevated p-[20px] pb-[24px]">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-accent" />
                        <h3 className="font-sora text-[15px] font-bold text-text-primary m-0">AI Summary</h3>
                    </div>
                    <p className="font-sans text-[15px] text-text-body leading-[1.6]">
                        The report indicates an elevated White Blood Cell (WBC) count at 11.8 x10^9/L, which slightly exceeds the normal upper limit of 11.0. This suggests a potential mild inflammatory response or recent mild infection. All other major markers, including Hemoglobin and Platelets, are well within their healthy reference ranges.
                    </p>
                </div>

                {/* Section 2 - Key Insights */}
                <div className="rounded-[6px] bg-bg-surface border-l-[4px] border-l-status-low p-[20px]">
                    <h3 className="font-sora text-[15px] font-bold text-text-primary mb-4">Key Insights</h3>
                    <ul className="flex flex-col gap-3">
                        <li className="flex items-start gap-3">
                            <TriangleAlert className="h-4 w-4 text-status-low shrink-0 mt-[2px]" />
                            <span className="font-sans text-[14px] text-text-body">
                                WBC is elevated by 7% above the maximum reference range.
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <TriangleAlert className="h-4 w-4 text-status-low shrink-0 mt-[2px]" />
                            <span className="font-sans text-[14px] text-text-body">
                                No indicators of anemia; Hemoglobin and RBC counts are stable.
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Section 3 - Extracted Values */}
                <div>
                    <h3 className="font-sora text-[18px] font-bold text-text-primary mb-4">Extracted Values</h3>
                    <div className="w-full overflow-hidden rounded-[6px] border border-border bg-bg-surface">
                        <table className="w-full border-collapse text-left">
                            <thead className="bg-bg-elevated">
                                <tr>
                                    <th className="px-4 py-3 text-[10px] font-medium tracking-[0.08em] uppercase text-text-muted border-b border-border">Marker Name</th>
                                    <th className="px-4 py-3 text-[10px] font-medium tracking-[0.08em] uppercase text-text-muted border-b border-border">Value</th>
                                    <th className="px-4 py-3 text-[10px] font-medium tracking-[0.08em] uppercase text-text-muted border-b border-border">Unit</th>
                                    <th className="px-4 py-3 text-[10px] font-medium tracking-[0.08em] uppercase text-text-muted border-b border-border">Ref. Range</th>
                                    <th className="px-4 py-3 text-[10px] font-medium tracking-[0.08em] uppercase text-text-muted border-b border-border">Status</th>
                                    <th className="px-4 py-3 text-[10px] font-medium tracking-[0.08em] uppercase text-text-muted border-b border-border text-center">Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockValues.map((row, i) => (
                                    <tr key={i} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
                                        <td className="px-4 py-3 text-[13px] font-medium text-text-primary">{row.name}</td>
                                        <td className="px-4 py-3 text-[13px] font-mono text-text-primary font-bold">{row.value}</td>
                                        <td className="px-4 py-3 text-[13px] text-text-muted">{row.unit}</td>
                                        <td className="px-4 py-3 text-[13px] font-mono text-text-muted">{row.range}</td>
                                        <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => onTrendClick(row.name)}
                                                className="group flex justify-center hover:bg-bg-elevated p-1 rounded transition-colors"
                                                title={`View ${row.name} trend`}
                                            >
                                                {/* Tiny 40px sparkline SVG mock */}
                                                <svg width="40" height="16" viewBox="0 0 40 16" className="overflow-visible">
                                                    <path
                                                        d="M 0 12 L 15 8 L 25 14 L 40 4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        className="text-text-muted group-hover:text-accent transition-colors"
                                                    />
                                                    <circle cx="40" cy="4" r="2" fill="currentColor" className="text-status-high" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section 4 - Detailed Explanation (Accordion) */}
                <div>
                    <Accordion.Root type="single" collapsible className="w-full">
                        <Accordion.Item value="explanation" className="overflow-hidden rounded-[6px] border border-border bg-bg-surface">
                            <Accordion.Header className="flex">
                                <Accordion.Trigger className={cn(
                                    'flex flex-1 items-center justify-between px-[20px] py-[16px] font-sans text-[14px] font-semibold text-text-primary transition-colors hover:bg-white/[0.02] [&[data-state=open]>svg]:rotate-180'
                                )}>
                                    Read full clinical explanation
                                    <ChevronDown className="h-4 w-4 text-text-muted transition-transform duration-200" />
                                </Accordion.Trigger>
                            </Accordion.Header>
                            <Accordion.Content className="overflow-hidden text-[14px] text-text-body data-[state=closed]:animate-[accordion-up_0.2s_ease-out] data-[state=open]:animate-[accordion-down_0.2s_ease-out]">
                                <div className="px-[20px] pb-[20px] pt-0 leading-[1.6]">
                                    A complete blood count (CBC) measures several components and features of your blood, including red blood cells, which carry oxygen; white blood cells, which fight infection; and platelets, which help with blood clotting. An elevated white blood cell count typically indicates your body is actively fighting an infection, or experiencing inflammation. Given that your RBC and Hemoglobin levels remain stable, severe or chronic underlying conditions are less likely. However, we advise monitoring this over the next cycle to ensure the WBC count normalizes.
                                </div>
                            </Accordion.Content>
                        </Accordion.Item>
                    </Accordion.Root>
                </div>

            </div>
        </RightDrawer>
    );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    accent?: 'primary' | 'warning' | 'critical' | 'success' | 'info' | 'destructive';
    trend?: string;
    delay?: number;
}

export function MetricCard({ title, value, icon: Icon, accent = 'primary', trend, delay = 0 }: MetricCardProps) {

    // Map the requested accent string to Tailwind class configurations
    const accentMap = {
        primary: 'bg-primary/10 text-primary',
        warning: 'bg-warning/10 text-warning',
        critical: 'bg-critical/10 text-critical',
        success: 'bg-success/10 text-success',
        info: 'bg-info/10 text-info',
        destructive: 'bg-destructive/10 text-destructive',
    };

    const iconClasses = accentMap[accent] || accentMap.primary;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <div className="rounded-xl border bg-card p-5 shadow-soft">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-sm text-muted-foreground">{title}</h3>
                        <div className="mt-1 text-2xl font-bold text-card-foreground">
                            {value}
                        </div>
                        {trend && (
                            <div className="mt-1 text-xs text-muted-foreground">
                                {trend}
                            </div>
                        )}
                    </div>
                    <div className={`rounded-lg p-2.5 ${iconClasses}`}>
                        <Icon size={20} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

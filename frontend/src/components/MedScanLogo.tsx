import React from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MedScanLogoProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function MedScanLogo({ size = 'md', className }: MedScanLogoProps) {
    const sizeMap = {
        sm: { icon: 18, text: 'text-lg' },
        md: { icon: 24, text: 'text-xl' },
        lg: { icon: 32, text: 'text-3xl' }
    };

    const s = sizeMap[size];

    return (
        <div className={cn("flex flex-row items-center gap-2 font-bold tracking-tight", className)}>
            <div className="gradient-primary rounded-lg p-1.5 flex items-center justify-center">
                <Activity size={s.icon} className="text-primary-foreground" />
            </div>
            <div className={s.text}>
                <span className="text-foreground">Med</span>
                <span className="text-primary">Scan</span>
            </div>
        </div>
    );
}

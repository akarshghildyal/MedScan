'use client';

import React from 'react';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MedScanLogo } from './MedScanLogo';

interface DashboardHeaderProps {
    roleOverride?: string;
    userName?: string;
}

export function DashboardHeader({ roleOverride, userName }: DashboardHeaderProps) {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('medscan-token');
        window.location.href = '/login';
    };

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
    };

    return (
        <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-6">
                <MedScanLogo size="sm" />

                <div className="flex items-center gap-4">
                    {roleOverride && (
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                            {roleOverride}
                        </span>
                    )}

                    {userName && (
                        <span className="text-sm font-medium text-foreground">
                            {userName}
                        </span>
                    )}

                    <button
                        onClick={toggleTheme}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Toggle Theme"
                    >
                        <Moon size={18} className="hidden dark:block" />
                        <Sun size={18} className="block dark:hidden" />
                    </button>

                    <button
                        onClick={handleLogout}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
}

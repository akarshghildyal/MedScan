'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedTheme = localStorage.getItem('medscan-theme') as 'dark' | 'light' | null;
        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.setAttribute('data-theme', storedTheme);
        } else {
            const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
            const defaultTheme = prefersLight ? 'light' : 'dark';
            setTheme(defaultTheme);
            document.documentElement.setAttribute('data-theme', defaultTheme);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('medscan-theme', newTheme);
    };

    if (!mounted) {
        // Render a placeholder with the precise dimensions to prevent layout shift
        return <div className={`w-[44px] h-[24px] ${className}`} />;
    }

    const isLight = theme === 'light';

    return (
        <button
            onClick={toggleTheme}
            className={`relative flex h-[24px] w-[44px] items-center rounded-full bg-bg-elevated border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${className}`}
            aria-label="Toggle theme"
        >
            {/* Icons background layer */}
            <div className="flex w-full justify-between px-1">
                <Moon className="h-[14px] w-[14px] text-text-muted" />
                <Sun className="h-[14px] w-[14px] text-text-muted" />
            </div>

            {/* Sliding Thumb */}
            <div
                className={`absolute top-[1px] left-[1px] flex h-[20px] w-[20px] items-center justify-center rounded-full shadow-sm transition-all duration-150 ease-out`}
                style={{
                    transform: isLight ? 'translateX(20px)' : 'translateX(0)',
                    backgroundColor: isLight ? '#00A88A' : '#00C9A7',
                }}
            >
                {isLight ? (
                    <Sun className="h-[12px] w-[12px] text-white" />
                ) : (
                    <Moon className="h-[12px] w-[12px] text-[#0D1117]" />
                )}
            </div>
        </button>
    );
}

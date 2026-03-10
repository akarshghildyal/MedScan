'use client';

import { useEffect, useState } from 'react';
import { useDemoData } from '@/hooks/useDemoData';

export function DemoIndicator() {
    const demoData = useDemoData();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted || !demoData) return null;

    return (
        <div className="fixed top-0 left-0 right-0 h-[4px] bg-[#00C9A7] z-[9999]" />
    );
}

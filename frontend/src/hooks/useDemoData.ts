import { useState } from 'react';
import { DEMO_DATA, isDemoUser } from '@/data/demoData';

export function useDemoData() {
    const [demoData] = useState(() => {
        if (typeof window === 'undefined') return null;
        try {
            const token = localStorage.getItem('medscan-token');
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload?.sub && isDemoUser(payload.sub)) {
                return DEMO_DATA[payload.sub.toLowerCase().trim()] || null;
            }
        } catch (e) {
            return null;
        }
        return null;
    });

    return demoData;
}

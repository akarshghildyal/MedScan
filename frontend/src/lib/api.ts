export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medscan-token') : null;
    const headers: Record<string, string> = {
        ...((options.headers as Record<string, string>) || {}),
    };

    // Only add Content-Type if it's not FormData (which sets it automatically)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Handle No Content
    if (response.status === 204) {
        return null;
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = 'API request failed';
        if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
                errorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail)) {
                errorMessage = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
            } else {
                errorMessage = JSON.stringify(errorData.detail);
            }
        }
        throw new Error(errorMessage);
    }

    return response.json();
};

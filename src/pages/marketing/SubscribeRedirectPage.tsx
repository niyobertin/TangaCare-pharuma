import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

export function SubscribeRedirectPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            navigate({ to: '/app/billing' as any, search: {} as any, replace: true } as any);
        } else {
            navigate({ to: '/auth/register' as any, search: {} as any, replace: true } as any);
        }
    }, [navigate]);

    return <div className="p-6 text-sm text-slate-500">Redirecting to subscription...</div>;
}


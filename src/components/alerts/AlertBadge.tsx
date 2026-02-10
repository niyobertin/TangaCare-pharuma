import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { pharmacyService } from '../../services/pharmacy.service';

interface AlertSummary {
    low_stock: number;
    expiry_soon: number;
    expired: number;
    total: number;
}

export function AlertBadge() {
    const [summary, setSummary] = useState<AlertSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlertSummary();
        // Refresh every 5 minutes
        const interval = setInterval(fetchAlertSummary, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlertSummary = async () => {
        try {
            const response = await pharmacyService.getAlertSummary();
            setSummary(response.data);
        } catch (error) {
            console.error('Failed to fetch alert summary:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !summary || summary.total === 0) {
        return (
            <button className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                <Bell className="h-6 w-6" />
            </button>
        );
    }

    return (
        <button className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {summary.total > 99 ? '99+' : summary.total}
            </span>
        </button>
    );
}

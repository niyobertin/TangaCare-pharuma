import { AlertTriangle, Clock, XCircle, Package, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { pharmacyService } from '../../services/pharmacy.service';
import { Link } from '@tanstack/react-router';

interface AlertSummary {
    low_stock: number;
    expiry_soon: number;
    expired: number;
    total: number;
}

interface DashboardMetricsProps {
    facilityId?: number;
}

export function DashboardMetrics({ facilityId }: DashboardMetricsProps) {
    const [summary, setSummary] = useState<AlertSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, [facilityId]);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            const response = await pharmacyService.getAlertSummary();
            setSummary(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!summary) return null;

    const metrics = [
        {
            label: 'Expired Items',
            value: summary.expired,
            icon: XCircle,
            color: 'text-red-600',
            bg: 'bg-red-50 dark:bg-red-900/20',
            borderColor: 'border-red-200 dark:border-red-800',
            link: '/app/alerts?type=expired',
        },
        {
            label: 'Expiring Soon',
            value: summary.expiry_soon,
            icon: Clock,
            color: 'text-orange-600',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            borderColor: 'border-orange-200 dark:border-orange-800',
            link: '/app/alerts?type=expiry_soon',
        },
        {
            label: 'Low Stock Items',
            value: summary.low_stock,
            icon: Package,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            borderColor: 'border-yellow-200 dark:border-yellow-800',
            link: '/app/alerts?type=low_stock',
        },
        {
            label: 'Total Active Alerts',
            value: summary.total,
            icon: AlertTriangle,
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            borderColor: 'border-blue-200 dark:border-blue-800',
            link: '/app/alerts',
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Inventory Alerts
                </h2>
                <Link
                    to="/app/alerts"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                    View All →
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric) => (
                    <Link
                        key={metric.label}
                        to={metric.link}
                        className={`block bg-white dark:bg-gray-800 rounded-lg p-6 border-2 ${metric.borderColor} hover:shadow-lg transition-all duration-200 hover:scale-105`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-3 rounded-lg ${metric.bg}`}>
                                <metric.icon className={`h-6 w-6 ${metric.color}`} />
                            </div>
                            {metric.value > 0 && (
                                <span
                                    className={`text-xs font-bold ${metric.color} flex items-center gap-1`}
                                >
                                    <TrendingDown className="h-3 w-3" />
                                    Action Needed
                                </span>
                            )}
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {metric.label}
                        </h3>
                        <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

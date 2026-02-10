import { AlertTriangle, Clock, XCircle, Package, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { pharmacyService } from '../../services/pharmacy.service';
import { Link } from '@tanstack/react-router';
import type { Alert } from '../../types/pharmacy';

interface AlertPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AlertPanel({ isOpen, onClose }: AlertPanelProps) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchAlerts();
        }
    }, [isOpen]);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const response = await pharmacyService.getAlerts({ status: 'active', limit: 10 });
            setAlerts(response.data || []);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'expired':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'expiry_soon':
                return <Clock className="h-5 w-5 text-orange-500" />;
            case 'low_stock':
                return <Package className="h-5 w-5 text-yellow-500" />;
            default:
                return <AlertTriangle className="h-5 w-5 text-blue-500" />;
        }
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'expired':
                return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
            case 'expiry_soon':
                return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10';
            case 'low_stock':
                return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
            default:
                return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
        }
    };

    const handleAcknowledge = async (alertId: number) => {
        try {
            await pharmacyService.acknowledgeAlert(alertId);
            fetchAlerts(); // Refresh list
        } catch (error) {
            console.error('Failed to acknowledge alert:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

            {/* Panel */}
            <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alerts</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading alerts...</div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                            <p className="text-gray-500 dark:text-gray-400">No active alerts</p>
                        </div>
                    ) : (
                        alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`border-l-4 p-3 rounded-r-lg ${getAlertColor(alert.type)}`}
                            >
                                <div className="flex items-start gap-3">
                                    {getAlertIcon(alert.type)}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                            {alert.title}
                                        </h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                            {alert.message}
                                        </p>
                                        {alert.medicine && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Medicine: {alert.medicine.name}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                onClick={() => handleAcknowledge(alert.id)}
                                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                Acknowledge
                                            </button>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(alert.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {alerts.length > 0 && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <Link
                            to="/app/alerts"
                            className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            onClick={onClose}
                        >
                            View All Alerts
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}

import { useQuery } from '@tanstack/react-query';
import { pharmacyService } from '../../services/pharmacy.service';
import { AlertCircle, Package, Clock, AlertTriangle } from 'lucide-react';
import type { CriticalMedicine } from '../../types/pharmacy';

const statusConfig = {
    adequate: {
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: Package,
        label: 'Adequate',
    },
    low_stock: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: AlertCircle,
        label: 'Low Stock',
    },
    critical: {
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: AlertTriangle,
        label: 'Critical',
    },
};

const expiryRiskConfig = {
    safe: { color: 'text-green-600', label: 'Safe' },
    warning: { color: 'text-yellow-600', label: 'Expiring Soon' },
    critical: { color: 'text-red-600', label: 'Critical Expiry' },
};

interface CriticalMedicineItemProps {
    medicine: CriticalMedicine;
}

const CriticalMedicineItem = ({ medicine }: CriticalMedicineItemProps) => {
    const statusInfo = statusConfig[medicine.status];
    const StatusIcon = statusInfo.icon;
    const expiryInfo = expiryRiskConfig[medicine.expiry_risk];

    return (
        <div className="p-4 bg-white dark:bg-slate-800/50 border dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{medicine.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                        >
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                        </span>
                        {medicine.expiry_risk !== 'safe' && (
                            <span className={`text-xs font-medium ${expiryInfo.color}`}>
                                <Clock className="inline w-3 h-3 mr-1" />
                                {expiryInfo.label}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Current Stock</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                        {medicine.current_quantity}
                    </p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Min Threshold</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                        {medicine.min_threshold}
                    </p>
                </div>
            </div>

            {medicine.last_dispensed && (
                <div className="mt-2 text-xs text-gray-500">
                    Last dispensed:{' '}
                    {new Date(medicine.last_dispensed).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </div>
            )}
        </div>
    );
};

export const CriticalMedicinesPanel = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['critical-medicines'],
        queryFn: () => pharmacyService.getCriticalMedicines(),
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    if (isLoading) {
        return (
            <div className="glass-card rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Critical Medicines
                </h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-24 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Critical Medicines
                </h3>
                <p className="text-red-600 text-sm">Failed to load critical medicines</p>
            </div>
        );
    }

    const medicines = data?.medicines || [];
    const criticalCount = medicines.filter((m) => m.status === 'critical').length;
    const lowStockCount = medicines.filter((m) => m.status === 'low_stock').length;

    return (
        <div className="glass-card rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-healthcare-dark dark:text-white">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Critical Medicines
                </h3>
                <div className="flex gap-2 text-xs">
                    {criticalCount > 0 && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">
                            {criticalCount} Critical
                        </span>
                    )}
                    {lowStockCount > 0 && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                            {lowStockCount} Low
                        </span>
                    )}
                </div>
            </div>

            {medicines.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No critical medicines configured</p>
                    <p className="text-xs mt-1">
                        Mark essential medicines as critical in the medicine settings
                    </p>
                </div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {medicines.map((medicine) => (
                        <CriticalMedicineItem key={medicine.id} medicine={medicine} />
                    ))}
                </div>
            )}
        </div>
    );
};

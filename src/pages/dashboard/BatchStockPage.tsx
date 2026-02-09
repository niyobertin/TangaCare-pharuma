import { useState, useEffect } from 'react';
import {
    Search,
    Database,
    Calendar,
    AlertTriangle,
    XCircle,
    MoreVertical,
    History,
    ArrowDownWideNarrow,
    AlertCircle,
} from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { pharmacyService } from '../../services/pharmacy.service';
import type { Batch } from '../../types/pharmacy';
import { TableSkeleton, StatsSkeleton } from '../../components/shared/Skeleton';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import { StockAdjustmentModal } from '../../components/inventory/StockAdjustmentModal';

export function BatchStockPage() {
    const { user } = useAuth();
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBatchForAdjustment, setSelectedBatchForAdjustment] = useState<Batch | null>(
        null,
    );

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const response = await pharmacyService.getBatches({
                ...(user?.facility_id ? { facility_id: user.facility_id } : {}),
            });
            setBatches(response);
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, []);

    const stats = [
        {
            label: 'Total Batches',
            value: batches.length,
            icon: Database,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
        },
        {
            label: 'Expiring Soon',
            value: batches.filter((b) => {
                const expiry = new Date(b.expiry_date);
                const now = new Date();
                const threeMonthsFromNow = new Date();
                threeMonthsFromNow.setMonth(now.getMonth() + 3);
                return expiry > now && expiry <= threeMonthsFromNow;
            }).length,
            icon: AlertTriangle,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
        },
        {
            label: 'Expired Items',
            value: batches.filter((b) => new Date(b.expiry_date) <= new Date()).length,
            icon: XCircle,
            color: 'text-rose-500',
            bg: 'bg-rose-50',
        },
        {
            label: 'Total Units',
            value: batches.reduce((acc, b) => acc + (b.current_quantity || 0), 0).toLocaleString(),
            icon: History,
            color: 'text-teal-500',
            bg: 'bg-teal-50',
        },
    ];

    const filteredBatches = batches.filter((b) =>
        b.batch_number.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <ProtectedRoute
            allowedRoles={[
                'super_admin',
                'facility_admin',
                'store_manager',
                'pharmacist',
                'auditor',
                'admin',
            ]}
            requireFacility
        >
            <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                {}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-healthcare-dark dark:text-white tracking-tight">
                            Stock & Batch Tracking
                        </h2>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                            FEFO Enforcement & Expiry Monitoring
                        </p>
                    </div>
                </div>

                {}
                {loading ? (
                    <StatsSkeleton />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <div
                                key={i}
                                className="glass-card p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm"
                            >
                                <div
                                    className={cn(
                                        'w-12 h-12 rounded-xl flex items-center justify-center',
                                        stat.bg,
                                        stat.color,
                                    )}
                                >
                                    <stat.icon size={22} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        {stat.label}
                                    </p>
                                    <p className="text-xl font-black text-healthcare-dark dark:text-white">
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {}
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-lg">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search by batch number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-healthcare-primary transition-all text-sm font-bold text-slate-900 dark:text-white shadow-sm"
                        />
                    </div>
                </div>

                {}
                <div className="glass-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        Medicine & Batch
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">
                                        Remaining Stock
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        Expiry Date
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8">
                                            <TableSkeleton rows={5} columns={5} />
                                        </td>
                                    </tr>
                                ) : filteredBatches.length > 0 ? (
                                    filteredBatches.map((batch) => (
                                        <tr
                                            key={batch.id}
                                            className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                #{batch.id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-healthcare-dark dark:text-white text-sm leading-tight">
                                                        Med ID: {batch.medicine_id}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                                        Batch: {batch.batch_number}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-black text-healthcare-dark dark:text-white">
                                                        {(
                                                            batch.current_quantity || 0
                                                        ).toLocaleString()}{' '}
                                                        Units
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div
                                                    className={cn(
                                                        'w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5',
                                                        new Date(batch.expiry_date) < new Date()
                                                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                                            : 'bg-teal-50 text-teal-600 border border-teal-100',
                                                    )}
                                                >
                                                    <Calendar size={12} />
                                                    {new Date(
                                                        batch.expiry_date,
                                                    ).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {user?.role?.toString().toLowerCase() !==
                                                        'auditor' && (
                                                        <button
                                                            onClick={() =>
                                                                setSelectedBatchForAdjustment(batch)
                                                            }
                                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                                                            title="Adjust Stock"
                                                        >
                                                            <ArrowDownWideNarrow size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                                                        title="View History"
                                                    >
                                                        <History size={16} />
                                                    </button>
                                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertCircle size={32} className="text-slate-300" />
                                                <span className="text-slate-500 font-bold italic">
                                                    No batches found
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {}
            {selectedBatchForAdjustment && (
                <StockAdjustmentModal
                    batch={selectedBatchForAdjustment}
                    onClose={() => setSelectedBatchForAdjustment(null)}
                    onSuccess={() => {
                        fetchBatches();
                    }}
                />
            )}
        </ProtectedRoute>
    );
}

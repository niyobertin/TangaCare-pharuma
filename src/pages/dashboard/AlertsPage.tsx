import { useState, useEffect } from 'react';
import {
    AlertTriangle,
    Bell,
    CheckCircle2,
    Clock,
    AlertCircle,
    Database,
    Search
} from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { pharmacyService } from '../../services/pharmacy.service';
import type { Alert } from '../../types/pharmacy';
import { TableSkeleton } from '../../components/shared/Skeleton';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const response = await pharmacyService.getAlerts();
            setAlerts(response.data);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const filteredAlerts = alerts.filter(alert =>
        alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['Super Admin', 'SUPER_ADMIN', 'Facility Admin', 'FACILITY_ADMIN', 'Pharmacist', 'PHARMACIST', 'Store Manager', 'STORE_MANAGER', 'Auditor', 'AUDITOR', 'ADMIN']}>
            <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-healthcare-dark tracking-tight flex items-center gap-3">
                            <Bell className="text-rose-500" />
                            System Alerts & Notifications
                        </h2>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Critical Stock & Expiry Monitoring</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search alerts by message or type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-healthcare-primary transition-all text-sm font-bold shadow-sm"
                        />
                    </div>
                </div>

                {/* Alerts List */}
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="space-y-4">
                            <TableSkeleton rows={4} columns={1} />
                        </div>
                    ) : filteredAlerts.length > 0 ? (
                        filteredAlerts.map((alert) => (
                            <div key={alert.id} className={cn(
                                "glass-card p-5 rounded-2xl border flex flex-col md:flex-row gap-4 md:items-center transition-all hover:shadow-md group",
                                alert.status === 'active' ? "bg-white dark:bg-slate-900 border-rose-100 dark:border-rose-900/30" : "bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 opacity-80"
                            )}>
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                                    alert.type === 'expiry' ? "bg-rose-50 text-rose-500" :
                                        alert.type === 'low_stock' ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"
                                )}>
                                    {alert.type === 'expiry' ? <AlertTriangle size={24} /> :
                                        alert.type === 'low_stock' ? <Database size={24} /> : <Bell size={24} />}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-black text-healthcare-dark text-sm uppercase italic tracking-tight">{alert.type.replace('_', ' ')}</h4>
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Clock size={12} />
                                            <span className="text-[10px] font-bold uppercase">{new Date(alert.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed">{alert.message}</p>
                                </div>
                                <div className="flex items-center gap-2 self-end md:self-center">
                                    {alert.status === 'active' && (
                                        <button className="px-4 py-2 bg-healthcare-primary/10 text-healthcare-primary hover:bg-healthcare-primary hover:text-white rounded-lg text-[10px] font-black uppercase transition-all">
                                            Acknowledge
                                        </button>
                                    )}
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                                        <AlertCircle size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-500">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="font-black text-healthcare-dark">All Systems Clear</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase">No active alerts or critical notifications at this time.</p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}

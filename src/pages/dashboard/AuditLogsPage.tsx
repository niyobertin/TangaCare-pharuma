import { useState } from 'react';
import {
    ShieldCheck,
    Clock,
    User,
    Zap,
    ShoppingCart,
    Building2,
    Database,
    Download,
    Eye,
    Search
} from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AuditLog {
    id: string;
    user: string;
    role: string;
    action: string;
    module: string;
    timestamp: string;
    details: string;
    impact: 'Low' | 'Medium' | 'High';
}

const DUMMY_LOGS: AuditLog[] = [
    { id: 'LOG-001', user: 'Niyobertin', role: 'Super Admin', action: 'CREATE_FACILITY', module: 'Facilities', timestamp: '2026-01-17 14:20:05', details: 'Created "Kigali King Faisal Hospital"', impact: 'High' },
    { id: 'LOG-002', user: 'Marie Claire', role: 'Pharmacist', action: 'DISPENSE_MEDICINE', module: 'Dispensing', timestamp: '2026-01-17 15:10:42', details: 'Dispensed 2x Amoxicillin 500mg', impact: 'Low' },
    { id: 'LOG-003', user: 'Eric Karemera', role: 'Store Manager', action: 'ADJUST_STOCK', module: 'Stock', timestamp: '2026-01-17 15:45:12', details: 'Adjusted stock for Paracetamol - Corrected count', impact: 'Medium' },
    { id: 'LOG-004', user: 'Dr. Alphonse', role: 'Facility Admin', action: 'APPROVE_PO', module: 'Procurement', timestamp: '2026-01-17 16:05:33', details: 'Approved PO-2026-003 for Biotech Rwanda', impact: 'High' },
    { id: 'LOG-005', user: 'System', role: 'Automated', action: 'ALERT_GENERATED', module: 'Alerts', timestamp: '2026-01-17 17:00:00', details: 'Low stock alert for Insulin Glargine', impact: 'Medium' },
];

export function AuditLogsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLogs = DUMMY_LOGS.filter(log => {
        const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.details.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <ProtectedRoute allowedRoles={['Super Admin', 'SUPER_ADMIN', 'Facility Admin', 'FACILITY_ADMIN', 'Auditor', 'AUDITOR', 'ADMIN']}>
            <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-healthcare-dark tracking-tight">Audit Trails & Activity Logs</h2>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Immutable Governance & Compliance History</p>
                    </div>
                    <button className="px-5 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-healthcare-primary rounded-xl font-black text-xs transition-all shadow-sm active:scale-[0.98] flex items-center gap-2">
                        <Download size={16} /> Export CSV Report
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by user, action or details..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-healthcare-primary transition-all text-sm font-bold shadow-sm"
                        />
                    </div>
                </div>

                {/* Logs List */}
                <div className="space-y-4">
                    {filteredLogs.map((log) => (
                        <div key={log.id} className="glass-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md transition-all group">
                            <div className="flex flex-col md:flex-row gap-4 md:items-center">
                                {/* Icon & Module */}
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 animate-in zoom-in duration-500",
                                    log.module === 'Facilities' ? "bg-blue-50 text-blue-500" :
                                        log.module === 'Dispensing' ? "bg-teal-50 text-teal-500" :
                                            log.module === 'Stock' ? "bg-indigo-50 text-indigo-500" :
                                                log.module === 'Procurement' ? "bg-amber-50 text-amber-500" :
                                                    "bg-rose-50 text-rose-500"
                                )}>
                                    {log.module === 'Facilities' ? <Building2 size={22} /> :
                                        log.module === 'Dispensing' ? <Zap size={22} /> :
                                            log.module === 'Stock' ? <Database size={22} /> :
                                                log.module === 'Procurement' ? <ShoppingCart size={22} /> :
                                                    <ShieldCheck size={22} />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-black text-healthcare-dark text-sm">{log.action}</h4>
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Clock size={12} />
                                            <span className="text-[10px] font-bold uppercase">{log.timestamp}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">{log.details}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1">
                                            <User size={10} className="text-healthcare-primary" />
                                            <span className="text-[10px] font-black uppercase text-healthcare-primary">{log.user}</span>
                                            <span className="text-[10px] text-slate-300 ml-1">({log.role})</span>
                                        </div>
                                        <span className="text-slate-200">|</span>
                                        <div className="flex items-center gap-1">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                log.impact === 'High' ? "bg-rose-500" : log.impact === 'Medium' ? "bg-amber-500" : "bg-teal-500"
                                            )}></div>
                                            <span className="text-[10px] font-bold uppercase text-slate-400">{log.impact} Impact</span>
                                        </div>
                                    </div>
                                </div>

                                {/* View Detail Button */}
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors self-start md:self-center">
                                    <Eye size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ProtectedRoute>
    );
}

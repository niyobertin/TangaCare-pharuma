import { useEffect, useState } from 'react';
import {
    AlertCircle,
    Clock,
    AlertTriangle,
    CheckCircle,
    Search,
    FileText,
    History,
    RotateCcw,
} from 'lucide-react';
import { pharmacyService } from '../../../services/pharmacy.service';
import { TableSkeleton } from '../../shared/Skeleton';
import { cn } from '../../../lib/utils';

interface ExpiryItem {
    batch_id: number;
    batch_number: string;
    medicine_name: string;
    expiry_date: string;
    days_until_expiry: number;
    quantity: number;
}

interface ExpiryData {
    expiring_soon: ExpiryItem[];
    expired: ExpiryItem[];
}

export function ExpiryReport({ facilityId }: { facilityId?: number }) {
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ExpiryData | null>(null);
    const [search, setSearch] = useState('');
    const [showTraceability, setShowTraceability] = useState(false);
    const [traceBatchId, setTraceBatchId] = useState('');
    const [traceResult, setTraceResult] = useState<any | null>(null);
    const [traceLoading, setTraceLoading] = useState(false);

    useEffect(() => {
        if (!facilityId) return;
        const load = async () => {
            console.log(
                '[ExpiryReport] Load triggered. facilityId:',
                facilityId,
                'typeof:',
                typeof facilityId,
                'days:',
                days,
            );

            if (facilityId === undefined || facilityId === null) {
                console.warn('[ExpiryReport] facilityId is null or undefined, skipping API call');
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const fId = Number(facilityId);
                if (isNaN(fId)) throw new Error(`Invalid Facility ID: ${facilityId}`);

                const res = await pharmacyService.getExpiryReport(fId, { days });
                console.log('[ExpiryReport] API Response:', res);
                if (!res || typeof res !== 'object') {
                    throw new Error('Invalid response format from server');
                }
                setData(res);
            } catch (err: any) {
                console.error('[ExpiryReport] API Error:', err);
                setError(err.message || 'Failed to connect to reporting service');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [facilityId, days]);

    const handleTrace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!traceBatchId) return;
        setTraceLoading(true);
        try {
            const res = await pharmacyService.getBatchTraceability(Number(traceBatchId));
            setTraceResult(res);
        } catch (error) {
            console.error('Trace error:', error);
        } finally {
            setTraceLoading(false);
        }
    };

    const expiringSoon = data?.expiring_soon || [];
    const expiredCount = data?.expired?.length || 0;
    const criticalCount = expiringSoon.filter((i) => (i.days_until_expiry || 0) <= 30).length;

    const filteredItems = expiringSoon.filter(
        (item) =>
            (item.medicine_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (item.batch_number || '').toLowerCase().includes(search.toLowerCase()),
    );

    if (facilityId === undefined || facilityId === null) {
        return (
            <div className="p-12 text-center bg-amber-50 dark:bg-amber-900/10 rounded-[32px] border border-amber-100 dark:border-amber-900/20">
                <AlertTriangle className="mx-auto text-amber-500 mb-4" size={32} />
                <h3 className="text-lg font-black text-amber-900 dark:text-amber-100 uppercase tracking-tight">
                    Detecting Facility...
                </h3>
                <p className="text-amber-700 dark:text-amber-400 text-xs font-bold mt-2 uppercase tracking-widest">
                    We are waiting for your facility authorization. If this persists, please
                    re-select your facility.
                </p>
                <div className="mt-8 pt-6 border-t border-amber-100/50">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20"
                    >
                        Refresh Session
                    </button>
                </div>
            </div>
        );
    }

    if (loading && !data)
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                    <div className="space-y-2">
                        <div className="h-6 w-48 bg-slate-200 animate-pulse rounded"></div>
                        <div className="h-3 w-32 bg-slate-100 animate-pulse rounded"></div>
                    </div>
                    <div className="h-10 w-64 bg-slate-200 animate-pulse rounded-xl"></div>
                </div>
                <TableSkeleton rows={10} columns={4} />
            </div>
        );

    if (error) {
        return (
            <div className="p-12 text-center bg-rose-50 dark:bg-rose-900/10 rounded-[32px] border border-rose-100 dark:border-rose-900/20">
                <AlertCircle className="mx-auto text-rose-500 mb-4" size={32} />
                <h3 className="text-lg font-black text-rose-900 dark:text-rose-100 uppercase tracking-tight">
                    Report Load Failed
                </h3>
                <p className="text-rose-700 dark:text-rose-400 text-xs font-bold mt-2 uppercase">
                    {error}
                </p>
                <button
                    onClick={() => setDays(days)} // Trigger reload
                    className="mt-6 px-6 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-xl font-black text-healthcare-dark dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Clock className="text-rose-500" />
                        Expiry Risk Analysis
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                        Predictive shelf-life tracking
                    </p>
                </div>

                <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    {[30, 60, 90].map((d) => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={cn(
                                'px-4 py-1.5 rounded-lg text-xs font-black transition-all uppercase tracking-tight',
                                days === d
                                    ? 'bg-white dark:bg-slate-700 text-healthcare-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200',
                            )}
                        >
                            {d} Days
                        </button>
                    ))}
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-3.5 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertCircle size={60} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-1.5">
                            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
                                <AlertCircle size={16} />
                            </div>
                            <span className="text-[9px] font-black text-rose-600 bg-rose-50 dark:bg-rose-900/50 px-2 py-0.5 rounded-full border border-rose-100 dark:border-rose-800">
                                COMPLIANCE
                            </span>
                        </div>
                        <p className="text-rose-900/60 dark:text-rose-400 text-[9px] font-black uppercase tracking-widest leading-none">
                            Already Expired
                        </p>
                        <h3 className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1.5 tracking-tighter leading-none">
                            {expiredCount}
                        </h3>
                        <p className="text-rose-900/40 dark:text-rose-500 text-[8px] font-bold uppercase mt-1.5 italic tracking-tight">
                            Remove from shelves
                        </p>
                    </div>
                </div>

                <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-3.5 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertTriangle size={60} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-1.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <AlertTriangle size={16} />
                            </div>
                            <span className="text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/50 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-800">
                                URGENT
                            </span>
                        </div>
                        <p className="text-amber-900/60 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest leading-none">
                            Critical (&lt;30d)
                        </p>
                        <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1.5 tracking-tighter leading-none">
                            {criticalCount}
                        </h3>
                        <p className="text-amber-900/40 dark:text-amber-500 text-[8px] font-bold uppercase mt-1.5 italic tracking-tight">
                            Dispose or prioritize
                        </p>
                    </div>
                </div>

                <div className="bg-healthcare-primary/5 dark:bg-teal-900/10 border border-healthcare-primary/10 dark:border-teal-900/30 rounded-2xl p-3.5 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <History size={60} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-1.5">
                            <div className="w-8 h-8 rounded-xl bg-healthcare-primary text-white flex items-center justify-center shadow-lg shadow-healthcare-primary/20">
                                <History size={16} />
                            </div>
                            <span className="text-[9px] font-black text-healthcare-primary bg-healthcare-primary/5 dark:bg-teal-900/50 px-2 py-0.5 rounded-full border border-healthcare-primary/20">
                                WATCHLIST
                            </span>
                        </div>
                        <p className="text-healthcare-primary/60 dark:text-teal-400 text-[9px] font-black uppercase tracking-widest leading-none">
                            Upcoming (&lt;{days}d)
                        </p>
                        <h3 className="text-xl font-black text-healthcare-primary mt-1.5 tracking-tighter leading-none">
                            {filteredItems.length}
                        </h3>
                        <p className="text-healthcare-primary/40 dark:text-teal-500 text-[8px] font-bold uppercase mt-1.5 italic tracking-tight">
                            Active monitoring
                        </p>
                    </div>
                </div>
            </div>

            {/* Utility Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                    />
                    <input
                        type="text"
                        placeholder="SEARCH BATCH OR MEDICINE..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black tracking-widest uppercase outline-none focus:ring-2 focus:ring-healthcare-primary/20 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setShowTraceability(!showTraceability)}
                    className={cn(
                        'px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-2',
                        showTraceability
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            : 'bg-healthcare-dark dark:bg-slate-800 text-white hover:bg-black',
                    )}
                >
                    <RotateCcw size={14} />{' '}
                    {showTraceability ? 'Hide Traceability' : 'Batch Traceability'}
                </button>
            </div>

            {/* Traceability Panel */}
            {showTraceability && (
                <div className="bg-rose-50 dark:bg-rose-900/20 p-8 rounded-[32px] border border-rose-100 dark:border-rose-800/50 animate-in zoom-in-95 duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div>
                            <h4 className="text-rose-900 dark:text-rose-100 font-black uppercase text-xs tracking-widest flex items-center gap-2">
                                <FileText size={18} /> Recall & Trace Mode
                            </h4>
                            <p className="text-rose-700 dark:text-rose-300 text-[10px] font-bold mt-1 max-w-sm">
                                Enter a Batch ID to retrieve a full list of transactions and
                                dispensed units for patient notifications.
                            </p>
                        </div>
                        <form onSubmit={handleTrace} className="flex gap-2 w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="BATCH SYSTEM ID"
                                className="flex-1 md:w-64 px-5 py-3 rounded-2xl border border-rose-200 dark:border-rose-700 bg-white dark:bg-slate-800 text-[10px] font-black tracking-widest uppercase outline-none focus:ring-2 focus:ring-rose-500/20"
                                value={traceBatchId}
                                onChange={(e) => setTraceBatchId(e.target.value)}
                            />
                            <button className="px-8 py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-700 transition-all">
                                START TRACE
                            </button>
                        </form>
                    </div>

                    {traceLoading ? (
                        <TableSkeleton rows={3} columns={4} />
                    ) : (
                        traceResult && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/20 shadow-sm">
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                                        Target Medicine
                                    </p>
                                    <p className="font-black text-sm text-rose-900 dark:text-rose-100 mt-1">
                                        {traceResult.medicine_name}
                                    </p>
                                </div>
                                <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/20 shadow-sm">
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                                        Batch Reference
                                    </p>
                                    <p className="font-black text-sm text-healthcare-primary mt-1">
                                        #{traceResult.batch_number}
                                    </p>
                                </div>
                                <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/20 shadow-sm">
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                                        Expiration Date
                                    </p>
                                    <p className="font-black text-sm text-rose-600 mt-1">
                                        {new Date(traceResult.expiry_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/20 shadow-sm">
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                                        Units to Recall
                                    </p>
                                    <p className="font-black text-sm text-slate-800 dark:text-white mt-1">
                                        {traceResult.total_dispensed} Units
                                    </p>
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Main Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-8 py-5">Medicine & Batch</th>
                                <th className="px-8 py-5">Expiry Status</th>
                                <th className="px-8 py-5 text-right">Available Stock</th>
                                <th className="px-8 py-5 text-right">Risk Level</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => {
                                    const isCritical = item.days_until_expiry <= 30;
                                    const isWarning = item.days_until_expiry <= 60;

                                    return (
                                        <tr
                                            key={item.batch_id}
                                            className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-healthcare-dark dark:text-white group-hover:text-healthcare-primary transition-colors">
                                                        {item.medicine_name}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                                                        BATCH: #{item.batch_number}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span
                                                        className={cn(
                                                            'text-xs font-black',
                                                            isCritical
                                                                ? 'text-rose-600'
                                                                : isWarning
                                                                  ? 'text-amber-600'
                                                                  : 'text-healthcare-primary',
                                                        )}
                                                    >
                                                        {new Date(
                                                            item.expiry_date,
                                                        ).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">
                                                        {item.days_until_expiry} days remaining
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                                                    {item.quantity.toLocaleString()}
                                                </span>
                                                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                    UNITS
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end">
                                                    <span
                                                        className={cn(
                                                            'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border',
                                                            isCritical
                                                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                                : isWarning
                                                                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                                                                  : 'bg-teal-50 text-healthcare-primary border-teal-100',
                                                        )}
                                                    >
                                                        {isCritical
                                                            ? 'Critical'
                                                            : isWarning
                                                              ? 'Warning'
                                                              : 'Low Risk'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => {
                                                        setTraceBatchId(item.batch_id.toString());
                                                        setShowTraceability(true);
                                                        window.scrollTo({
                                                            top: 300,
                                                            behavior: 'smooth',
                                                        });
                                                    }}
                                                    className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:border-rose-200"
                                                >
                                                    <Search size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6 opacity-40">
                                                <CheckCircle
                                                    size={32}
                                                    className="text-healthcare-primary"
                                                />
                                            </div>
                                            <h4 className="text-lg font-black text-healthcare-dark dark:text-white uppercase tracking-tight">
                                                Zero Risk Batches
                                            </h4>
                                            <p className="text-slate-400 text-xs font-bold mt-2 uppercase">
                                                No expiring items found within the selected {days}{' '}
                                                day window.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

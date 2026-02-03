import { useState, useEffect } from 'react';
import { pharmacyService } from '../../services/pharmacy.service';
import type { FEFOComplianceData } from '../../types/pharmacy';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function FEFOComplianceVisual() {
    const [data, setData] = useState<FEFOComplianceData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await pharmacyService.getFEFOCompliance();
                setData(res);
            } catch (error) {
                console.error('Failed to load FEFO compliance:', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="glass-card p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-[400px] flex items-center justify-center">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">
                    Auditing Safety...
                </p>
            </div>
        );
    }

    const complianceRate = data?.compliance_rate || 0;

    return (
        <div className="glass-card p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-base font-black text-healthcare-dark flex items-center gap-2">
                        <ShieldCheck size={18} className="text-healthcare-primary" />
                        FEFO Compliance Audit
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                        First-Expiry-First-Out dispensing safety
                    </p>
                </div>
                <div
                    className={cn(
                        'px-3 py-1 rounded-full text-[12px] font-black flex items-center gap-2 shadow-sm border',
                        complianceRate >= 95
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                            : complianceRate >= 80
                              ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                              : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
                    )}
                >
                    {complianceRate >= 95 ? (
                        <CheckCircle2 size={14} />
                    ) : (
                        <AlertTriangle size={14} />
                    )}
                    {complianceRate.toFixed(1)}% Compliance
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                            Compliant Tx
                        </p>
                        <p className="text-2xl font-black text-healthcare-dark">
                            {data?.compliant_transactions}
                        </p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                            Total Audited
                        </p>
                        <p className="text-2xl font-black text-healthcare-dark">
                            {data?.total_transactions}
                        </p>
                    </div>
                </div>

                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FileText size={14} /> Recent Safety Violations
                </h4>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                    {data?.violations && data.violations.length > 0 ? (
                        data.violations.map((v) => (
                            <div
                                key={v.transaction_id}
                                className="p-3 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100/50 dark:border-red-900/30"
                            >
                                <div className="flex justify-between items-start">
                                    <p className="text-[11px] font-black text-healthcare-dark truncate">
                                        {v.medicine_name}
                                    </p>
                                    <span className="text-[9px] font-black text-red-500 uppercase">
                                        Conflict
                                    </span>
                                </div>
                                <div className="mt-1 flex flex-col gap-0.5">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">
                                        Used: {v.batch_used} (Exp:{' '}
                                        {new Date(v.batch_expiry).toLocaleDateString()})
                                    </p>
                                    <p className="text-[9px] font-black text-red-600 dark:text-red-400 uppercase">
                                        Skipped: {v.earlier_batch_available} (Exp:{' '}
                                        {new Date(v.earlier_expiry).toLocaleDateString()})
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center opacity-40">
                            <p className="text-[10px] font-black uppercase">
                                No violations recorded
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

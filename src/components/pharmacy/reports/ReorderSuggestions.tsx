import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { pharmacyService } from '../../../services/pharmacy.service';
import { SkeletonTable } from '../../ui/SkeletonTable';
import { AlertCircle, RefreshCcw, CheckCircle, Activity, Package } from 'lucide-react';
import { CreatePurchaseOrderModal } from '../../inventory/CreatePurchaseOrderModal';
import type { ReorderSuggestion } from '../../../types/pharmacy';

const getRecommendedAction = (item: ReorderSuggestion): string => {
    if (item.recommended_action) return item.recommended_action;

    const daysRemaining = Number(item.days_of_cover ?? item.days_remaining ?? 0);
    if (item.current_quantity === 0 || daysRemaining <= 1) {
        return 'Immediate urgent PO and transfer check required.';
    }
    if (item.urgency === 'high') {
        return 'Urgent reorder within 24 hours.';
    }
    if (item.urgency === 'medium') {
        return 'Reorder within 24-48 hours to avoid stockout.';
    }
    return 'Monitor and place in next replenishment cycle.';
};

export function ReorderSuggestions() {
    const { user, facilityId } = useAuth();
    const effectiveFacilityId = facilityId ?? user?.facility_id;
    const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [isPOModalOpen, setIsPOModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{
        medicine_id: number;
        medicine_name: string;
        quantity: number;
    } | null>(null);

    useEffect(() => {
        if (effectiveFacilityId) {
            loadSuggestions();
        }
    }, [effectiveFacilityId]);

    const loadSuggestions = async () => {
        if (!effectiveFacilityId) return;
        setLoading(true);
        try {
            const data = await pharmacyService.getReorderSuggestions(effectiveFacilityId);
            setSuggestions(data);
        } catch (error) {
            console.error('Failed to load reorder suggestions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOrder = (item: ReorderSuggestion) => {
        setSelectedItem({
            medicine_id: item.medicine_id,
            medicine_name: item.medicine_name,
            quantity: item.suggested_quantity,
        });
        setIsPOModalOpen(true);
    };

    const criticalCount = suggestions.filter(
        (s) => Number(s.days_remaining) < 3 || s.current_quantity === 0,
    ).length;
    const warningCount = suggestions.filter(
        (s) => Number(s.days_remaining) >= 3 && Number(s.days_remaining) < 7,
    ).length;
    const optimalCount = suggestions.length - criticalCount - warningCount;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between transition-all duration-500">
                <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <AlertCircle className="text-amber-500" size={24} />
                        Inventory Optimization
                    </h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                        Smart reorder recommendations
                    </p>
                </div>
                <button
                    onClick={loadSuggestions}
                    disabled={loading}
                    className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 rounded-xl transition-all text-slate-400 disabled:opacity-50 shadow-sm"
                >
                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {!loading && suggestions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-xl p-3 flex items-center gap-3 group hover:shadow-md transition-all">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center transition-transform group-hover:scale-110">
                            <AlertCircle size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest leading-none">
                                Critical
                            </p>
                            <h4 className="text-xl font-black text-rose-700 dark:text-rose-400 mt-1 leading-none">
                                {criticalCount}
                            </h4>
                        </div>
                    </div>
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl p-3 flex items-center gap-3 group hover:shadow-md transition-all">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110">
                            <Activity size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none">
                                Warning
                            </p>
                            <h4 className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1 leading-none">
                                {warningCount}
                            </h4>
                        </div>
                    </div>
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl p-3 flex items-center gap-3 group hover:shadow-md transition-all">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110">
                            <Package size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none">
                                Recommended
                            </p>
                            <h4 className="text-xl font-black text-blue-700 dark:text-blue-400 mt-1 leading-none">
                                {optimalCount}
                            </h4>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <SkeletonTable
                    rows={5}
                    columns={6}
                    headers={[
                        'Medicine & ID',
                        'Stock Status',
                        'Daily Run-rate',
                        'Coverage',
                        'Recommended Action',
                    ]}
                    columnAligns={['left', 'right', 'right', 'right', 'left']}
                    actions
                    className="border-none shadow-none"
                />
            ) : suggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-slate-50/50 dark:bg-slate-900/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-700">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-full mb-6">
                        <CheckCircle className="text-emerald-500" size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                        Inventory Levels Optimal
                    </h3>
                    <p className="text-slate-500 mt-2 max-w-sm text-sm font-medium">
                        All monitored medicines are currently above their reorder points. No
                        replenishment action is required at this time.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                                        Medicine & ID
                                    </th>
                                    <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right">
                                        Stock Status
                                    </th>
                                    <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right">
                                        Daily Run-rate
                                    </th>
                                    <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right">
                                        Coverage
                                    </th>
                                    <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                                        Recommended Action
                                    </th>
                                    <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {suggestions.map((item) => {
                                    const daysRemaining = Number(item.days_of_cover ?? item.days_remaining ?? 0);
                                    const averageDailyUsage = Number(
                                        item.average_daily_usage ?? item.avg_daily_consumption ?? 0,
                                    );
                                    const deficitQty = Number(item.deficit_quantity ?? 0);
                                    const isCritical = daysRemaining < 3 || item.current_quantity === 0;
                                    const isWarning = daysRemaining >= 3 && daysRemaining < 7;

                                    return (
                                        <tr
                                            key={item.medicine_id}
                                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                                        >
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="font-black text-slate-800 dark:text-white text-base tracking-tight group-hover:text-healthcare-primary transition-colors">
                                                    {item.medicine_name}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                    SKU: {item.medicine_id}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right whitespace-nowrap">
                                                <div className="flex flex-col items-end">
                                                    <span
                                                        className={`text-lg font-black tracking-tighter ${
                                                            isCritical
                                                                ? 'text-rose-600'
                                                                : isWarning
                                                                  ? 'text-amber-600'
                                                                  : 'text-slate-700 dark:text-slate-300'
                                                        }`}
                                                    >
                                                        {item.current_quantity}
                                                    </span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        Point: {item.reorder_point}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right text-slate-500 whitespace-nowrap">
                                                <span className="font-bold text-sm tracking-tight bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                                    {averageDailyUsage.toFixed(1)} / day
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right whitespace-nowrap">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full border ${
                                                            isCritical
                                                                ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30'
                                                                : isWarning
                                                                  ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30'
                                                                  : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30'
                                                        }`}
                                                    >
                                                        {daysRemaining.toFixed(1)} days
                                                    </span>
                                                    {deficitQty > 0 && (
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            Deficit: {deficitQty}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
                                                    {getRecommendedAction(item)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => handleOrder(item)}
                                                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                                                        isCritical
                                                            ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200 dark:shadow-rose-900/20'
                                                            : 'bg-healthcare-primary text-white hover:bg-teal-700 shadow-lg shadow-teal-200 dark:shadow-teal-900/20'
                                                    }`}
                                                >
                                                    Order Now
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <CreatePurchaseOrderModal
                isOpen={isPOModalOpen}
                onClose={() => setIsPOModalOpen(false)}
                onSuccess={() => {
                    setIsPOModalOpen(false);
                    loadSuggestions();
                }}
                initialItem={selectedItem}
            />
        </div>
    );
}

import { useState, useEffect } from 'react';
import { pharmacyService } from '../../services/pharmacy.service';
import type { ReorderSuggestion } from '../../types/pharmacy';
import { ShoppingCart, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export function DemandPlanningPanel() {
    const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await pharmacyService.getReorderSuggestions();
                setSuggestions(data.suggestions || []);
            } catch (error) {
                console.error('Failed to load reorder suggestions:', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="glass-card p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm h-[400px] flex items-center justify-center">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">
                    Calculating Demand...
                </p>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-base font-black text-healthcare-dark dark:text-white flex items-center gap-2">
                        <TrendingUp size={18} className="text-healthcare-primary" />
                        Demand Planning & Reordering
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Stock optimization suggestions
                    </p>
                </div>
                <span className="px-2 py-1 bg-teal-50 dark:bg-teal-900/30 text-healthcare-primary text-[10px] font-black rounded-lg border border-teal-100 dark:border-teal-800">
                    {suggestions.length} Suggestions
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {suggestions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-60">
                        <Clock size={32} className="text-slate-300" />
                        <p className="text-xs font-bold text-slate-500 uppercase">
                            Stock levels are optimal
                        </p>
                    </div>
                ) : (
                    suggestions.map((item) => (
                        <div
                            key={item.medicine_id}
                            className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group hover:border-healthcare-primary/30 transition-all"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="text-[13px] font-black text-healthcare-dark dark:text-white leading-tight line-clamp-1">
                                        {item.medicine_name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className={cn(
                                                'text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter',
                                                item.urgency === 'high'
                                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                                    : item.urgency === 'medium'
                                                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                                      : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                                            )}
                                        >
                                            {item.urgency} Priority
                                        </span>
                                        <span className="text-[9px] text-slate-500 font-bold uppercase">
                                            Stock: {item.current_quantity} / {item.reorder_point}{' '}
                                            (Min)
                                        </span>
                                    </div>
                                </div>
                                <button className="p-2 bg-white dark:bg-slate-700 text-healthcare-primary rounded-lg shadow-sm border border-slate-100 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-healthcare-primary hover:text-white">
                                    <ShoppingCart size={14} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-500 flex items-center gap-1">
                                    <ArrowRight size={12} className="text-healthcare-primary" />
                                    Suggested Order:
                                </span>
                                <span className="text-healthcare-dark dark:text-white font-black px-2 py-0.5 bg-white dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600">
                                    {item.suggested_quantity} Units
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button className="w-full mt-4 py-3 bg-healthcare-primary text-white text-xs font-black rounded-xl hover:bg-teal-700 transition-all shadow-md shadow-teal-500/10 flex items-center justify-center gap-2">
                Generate Purchase Orders <ArrowRight size={14} />
            </button>
        </div>
    );
}

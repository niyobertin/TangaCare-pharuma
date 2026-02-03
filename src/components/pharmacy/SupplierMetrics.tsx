import { useState, useEffect } from 'react';
import { pharmacyService } from '../../services/pharmacy.service';
import type { SupplierPerformanceItem } from '../../types/pharmacy';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Truck, Clock, CheckCircle } from 'lucide-react';

export function SupplierMetrics() {
    const [performance, setPerformance] = useState<SupplierPerformanceItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await pharmacyService.getSupplierPerformance();
                setPerformance(data || []);
            } catch (error) {
                console.error('Failed to load supplier performance:', error);
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
                    Analyzing Suppliers...
                </p>
            </div>
        );
    }

    const COLORS = ['#0f766e', '#0d9488', '#2dd4bf', '#99f6e4'];

    return (
        <div className="glass-card p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-base font-black text-healthcare-dark dark:text-white flex items-center gap-2">
                        <Truck size={18} className="text-healthcare-primary" />
                        Supplier Performance
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Lead time & Fulfillment accuracy
                    </p>
                </div>
            </div>

            {performance.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                    <Clock size={32} className="text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-500 uppercase">
                        No performance data available
                    </p>
                </div>
            ) : (
                <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Lead Time (Days)
                        </p>
                        <div className="flex-1 min-h-[150px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performance}>
                                    <XAxis dataKey="supplier_name" hide />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        }}
                                    />
                                    <Bar
                                        dataKey="avg_lead_time_days"
                                        fill="#0d9488"
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {performance.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="space-y-3 overflow-y-auto pr-2">
                        {performance.slice(0, 4).map((item) => (
                            <div
                                key={item.supplier_id}
                                className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                            >
                                <h4 className="text-[11px] font-black text-healthcare-dark dark:text-white uppercase truncate">
                                    {item.supplier_name}
                                </h4>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle
                                            size={10}
                                            className="text-healthcare-primary"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-slate-400 font-bold uppercase leading-none">
                                                Fulfillment
                                            </span>
                                            <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                                                {item.fulfillment_rate.toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={10} className="text-amber-500" />
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-slate-400 font-bold uppercase leading-none">
                                                On-Time
                                            </span>
                                            <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                                                {item.on_time_delivery_rate.toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

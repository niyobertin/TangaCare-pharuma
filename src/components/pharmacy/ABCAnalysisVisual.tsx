import { useState, useEffect } from 'react';
import { pharmacyService } from '../../services/pharmacy.service';
import type { ABCAnalysisData } from '../../types/pharmacy';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Layers, Info } from 'lucide-react';

export function ABCAnalysisVisual() {
    const [data, setData] = useState<ABCAnalysisData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await pharmacyService.getABCAnalysis();
                setData(res);
            } catch (error) {
                console.error('Failed to load ABC analysis:', error);
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
                    Classifying Inventory...
                </p>
            </div>
        );
    }

    const chartData = [
        {
            name: `Class A (${data?.summary.classes.A.percentage.toFixed(1)}% Value)`,
            value: data?.summary.classes.A.totalValue || 0,
            color: '#0f766e',
        },
        {
            name: `Class B (${data?.summary.classes.B.percentage.toFixed(1)}% Value)`,
            value: data?.summary.classes.B.totalValue || 0,
            color: '#0d9488',
        },
        {
            name: `Class C (${data?.summary.classes.C.percentage.toFixed(1)}% Value)`,
            value: data?.summary.classes.C.totalValue || 0,
            color: '#2dd4bf',
        },
    ];

    return (
        <div className="glass-card p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[450px]">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-base font-black text-healthcare-dark dark:text-white flex items-center gap-2">
                        <Layers size={18} className="text-healthcare-primary" />
                        ABC Inventory Analysis
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Stock value distribution
                    </p>
                </div>
            </div>

            {/* Description on top */}
            <div className="mb-4 p-4 bg-teal-50/50 dark:bg-teal-900/10 rounded-2xl border border-teal-100 dark:border-teal-800/50">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <Info size={16} className="text-healthcare-primary" />
                    </div>
                    <p className="text-xs font-bold text-healthcare-dark dark:text-white italic leading-relaxed">
                        <span className="text-healthcare-primary font-black not-italic">
                            Class A items
                        </span>{' '}
                        contribute {data?.summary.classes.A.percentage.toFixed(1)}% of your total
                        consumption value. Focus on tight control and frequent cycle counting for
                        these items.
                    </p>
                </div>
            </div>

            {/* Numbers horizontal under description */}
            <div className="flex justify-center gap-12 mb-4">
                <div className="text-center">
                    <p className="text-[24px] font-black text-healthcare-dark dark:text-white leading-none">
                        {data?.class_a.length}
                    </p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Items A
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-[24px] font-black text-healthcare-dark dark:text-white leading-none">
                        {data?.class_b.length}
                    </p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Items B
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-[24px] font-black text-healthcare-dark dark:text-white leading-none">
                        {data?.class_c.length}
                    </p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Items C
                    </p>
                </div>
            </div>

            <div className="flex-1 min-h-0 relative">
                {/* Vertical Percentages in the corner */}
                <div className="absolute left-0 bottom-0 z-10 hidden md:flex flex-col gap-2">
                    {chartData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-[3px]"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-[10px] font-black text-healthcare-dark dark:text-white uppercase tracking-tight">
                                {item.name.split(' (')[0]}
                                <span className="text-slate-400 ml-1">
                                    ({item.name.split(' (')[1].replace(')', '')})
                                </span>
                            </span>
                        </div>
                    ))}
                </div>

                {/* Graph Centered */}
                <div className="w-full h-full min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

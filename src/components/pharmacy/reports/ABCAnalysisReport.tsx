import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { pharmacyService } from '../../../services/pharmacy.service';
import { TableSkeleton } from '../../shared/Skeleton';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function ABCAnalysisReport() {
    const { user, facilityId } = useAuth();
    const effectiveFacilityId = facilityId ?? user?.facility_id;
    const [data, setData] = useState<import('../../../types/pharmacy').ABCAnalysisData | null>(
        null,
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (effectiveFacilityId) {
            loadAnalysis();
        }
    }, [effectiveFacilityId]);

    const loadAnalysis = async () => {
        if (!effectiveFacilityId) return;
        setLoading(true);
        try {
            const res = await pharmacyService.getABCAnalysis();
            setData(res);
        } catch (error) {
            console.error('Failed to load ABC analysis', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <TableSkeleton rows={5} columns={2} />;
    if (!data) return null;

    const summary = data.summary;
    const chartData = [
        { name: 'Class A (High Value)', value: summary.classes.A.totalValue, color: '#059669' }, // Emerald-600
        { name: 'Class B (Moderate)', value: summary.classes.B.totalValue, color: '#d97706' }, // Amber-600
        { name: 'Class C (Low Value)', value: summary.classes.C.totalValue, color: '#ef4444' }, // Rose-500
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 text-center">
                        Value Concentration (ABC)
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => [
                                        new Intl.NumberFormat('sw-TZ', {
                                            style: 'currency',
                                            currency: 'TZS',
                                        }).format(value),
                                        'Value',
                                    ]}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <div className="font-bold text-emerald-700 dark:text-emerald-400">
                                Class A
                            </div>
                            <div>{summary.classes.A.percentage.toFixed(2)}% Value</div>
                            <div className="text-slate-400">
                                {summary.classes.A.itemCount} Items
                            </div>
                        </div>
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <div className="font-bold text-amber-700 dark:text-amber-400">
                                Class B
                            </div>
                            <div>{summary.classes.B.percentage.toFixed(2)}% Value</div>
                            <div className="text-slate-400">
                                {summary.classes.B.itemCount} Items
                            </div>
                        </div>
                        <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                            <div className="font-bold text-rose-700 dark:text-rose-400">
                                Class C
                            </div>
                            <div>{summary.classes.C.percentage.toFixed(2)}% Value</div>
                            <div className="text-slate-400">
                                {summary.classes.C.itemCount} Items
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                        <h4 className="font-bold text-slate-700 dark:text-slate-200">
                            Top Class A Items
                        </h4>
                        <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            Vital Few (80% Value)
                        </span>
                    </div>
                    <div className="overflow-x-auto max-h-[400px]">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-slate-500">
                                        Medicine
                                    </th>
                                    <th className="px-6 py-3 font-semibold text-slate-500 text-right">
                                        Consumption Value
                                    </th>
                                    <th className="px-6 py-3 font-semibold text-slate-500 text-right">
                                        % Contribution
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {data.class_a.slice(0, 10).map((item) => (
                                    <tr
                                        key={item.medicine_id}
                                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                                    >
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                            {item.medicine_name}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-600 font-mono whitespace-nowrap">
                                            {new Intl.NumberFormat('sw-TZ', {
                                                style: 'currency',
                                                currency: 'TZS',
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(item.consumption_value)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-500 whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                                                    <div
                                                        className="bg-emerald-500 h-full rounded-full"
                                                        style={{
                                                            width: `${(item.consumption_value / summary.totalValue) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs">
                                                    {(
                                                        (item.consumption_value /
                                                            summary.totalValue) *
                                                        100
                                                    ).toFixed(2)}
                                                    %
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

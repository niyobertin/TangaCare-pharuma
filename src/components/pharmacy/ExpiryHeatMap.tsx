import { useQuery } from '@tanstack/react-query';
import { pharmacyService } from '../../services/pharmacy.service';
import { Calendar, Info } from 'lucide-react';
import { useState } from 'react';

export const ExpiryHeatMap = () => {
    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + 90);

    const [startDate] = useState(today.toISOString().split('T')[0]);
    const [endDate] = useState(end.toISOString().split('T')[0]);

    const { data, isLoading } = useQuery({
        queryKey: ['expiry-heatmap', startDate, endDate],
        queryFn: () => pharmacyService.getExpiryHeatMap({ start: startDate, end: endDate }),
    });

    if (isLoading) {
        return <div className="h-64 bg-gray-50 animate-pulse rounded-xl" />;
    }

    const dates = data?.dates || [];

    // Simple heat map visualization
    return (
        <div className="glass-card p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-base font-black text-healthcare-dark flex items-center gap-2">
                        <Calendar size={18} className="text-healthcare-primary" />
                        Expiry Heat Map (90 Days)
                    </h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                        Upcoming batch expirations
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Info size={14} />
                    <span>Intensity shows relative stock value</span>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {/* Simplified weekly grid logic would go here */}
                {/* For now, a simple list of upcoming expiry dates if any */}
                {dates.length === 0 ? (
                    <div className="col-span-12 py-12 text-center text-slate-400 text-sm italic">
                        No batches expiring in the next 90 days.
                    </div>
                ) : (
                    <div className="col-span-12 space-y-4">
                        {dates.slice(0, 5).map((d) => (
                            <div
                                key={d.date}
                                className="flex items-center gap-4 p-3 bg-red-50 rounded-lg border border-red-100"
                            >
                                <div className="text-center min-w-[60px]">
                                    <p className="text-[10px] font-black uppercase text-red-400">
                                        {new Date(d.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                        })}
                                    </p>
                                    <p className="text-lg font-black text-red-600 leading-none">
                                        {new Date(d.date).getDate()}
                                    </p>
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-2">
                                        {d.batches.map((b, i) => (
                                            <span
                                                key={i}
                                                className="text-xs font-bold text-slate-700"
                                            >
                                                {b.medicine_name} ({b.quantity} units)
                                                {i < d.batches.length - 1 ? ',' : ''}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mt-1">
                                        Value at Risk: RWF {d.total_value.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {dates.length > 5 && (
                            <p className="text-center text-xs font-bold text-healthcare-primary uppercase tracking-widest cursor-pointer hover:underline">
                                + {dates.length - 5} more dates with expirations
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

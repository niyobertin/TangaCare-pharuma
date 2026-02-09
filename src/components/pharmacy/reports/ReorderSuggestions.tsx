import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { pharmacyService } from '../../../services/pharmacy.service';
import { TableSkeleton } from '../../shared/Skeleton';
import { AlertCircle, ArrowRight, RefreshCcw, CheckCircle } from 'lucide-react';
import { CreatePurchaseOrderModal } from '../../inventory/CreatePurchaseOrderModal';

export function ReorderSuggestions() {
    const { user, facilityId } = useAuth();
    const effectiveFacilityId = facilityId ?? user?.facility_id;
    const [suggestions, setSuggestions] = useState<
        import('../../../types/pharmacy').ReorderSuggestion[]
    >([]);
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
            const data = await pharmacyService.getReorderSuggestions();
            setSuggestions(data.suggestions);
        } catch (error) {
            console.error('Failed to load reorder suggestions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOrder = (item: import('../../../types/pharmacy').ReorderSuggestion) => {
        setSelectedItem({
            medicine_id: item.medicine_id,
            medicine_name: item.medicine_name,
            quantity: item.suggested_quantity,
        });
        setIsPOModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertCircle className="text-amber-500" size={20} />
                    Reorder Recommendations
                    {!loading && (
                        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs px-2 py-0.5 rounded-full">
                            {suggestions.length} Items
                        </span>
                    )}
                </h3>
                <button
                    onClick={loadSuggestions}
                    disabled={loading}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 disabled:opacity-50"
                >
                    <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {loading ? (
                <TableSkeleton rows={5} columns={6} />
            ) : suggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 text-center">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-full mb-4">
                        <CheckCircle className="text-emerald-500" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Stock Levels Optimal
                    </h3>
                    <p className="text-slate-500 mt-1 max-w-sm">
                        No medicines are currently below their reorder points. Great job maintaining
                        inventory!
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-500">Medicine</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">
                                    Current Stock
                                </th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">
                                    Reorder Point
                                </th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">
                                    Avg Daily Usage
                                </th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">
                                    Days Remaining
                                </th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {suggestions.map((item) => (
                                <tr
                                    key={item.medicine_id}
                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-bold text-slate-900 dark:text-white">
                                            {item.medicine_name}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            ID: {item.medicine_id}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-rose-600 whitespace-nowrap">
                                        {item.current_quantity}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                                        {item.reorder_point}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                        {(item.average_daily_usage || 0).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div
                                            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                                                Number(item.days_remaining) < 3
                                                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
                                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                                            }`}
                                        >
                                            {(item.days_remaining || 0).toFixed(2)} Days
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <button
                                            onClick={() => handleOrder(item)}
                                            className="text-healthcare-primary hover:text-teal-700 font-bold text-xs inline-flex items-center gap-1"
                                        >
                                            Order <ArrowRight size={12} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <CreatePurchaseOrderModal
                isOpen={isPOModalOpen}
                onClose={() => setIsPOModalOpen(false)}
                onSuccess={() => {
                    setIsPOModalOpen(false);
                    loadSuggestions(); // Refetch suggestions
                }}
                initialItem={selectedItem}
            />
        </div>
    );
}

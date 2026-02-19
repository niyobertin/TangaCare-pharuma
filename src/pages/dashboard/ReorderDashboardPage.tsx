import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pharmacyService } from '../../services/pharmacy.service';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { SkeletonTable } from '../../components/ui/SkeletonTable';
import type { ReorderSuggestion } from '../../types/pharmacy';
import {
    ShoppingCart,
    Zap,
    AlertCircle,
    Package,
    ArrowRight,
    Loader2,
    CheckCircle2,
    FilePlus,
} from 'lucide-react';

export function ReorderDashboardPage() {
    const { user, facilityId } = useAuth();
    const effectiveFacilityId = facilityId ?? user?.facility_id;
    const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [creatingPO, setCreatingPO] = useState(false);
    const [poCreated, setPoCreated] = useState<string | null>(null);

    const loadSuggestions = async () => {
        if (!effectiveFacilityId) return;
        setLoading(true);
        try {
            const data = await pharmacyService.getReorderSuggestions(effectiveFacilityId);
            setSuggestions(data);
        } catch (error) {
            console.error('Failed to load suggestions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSuggestions();
    }, [effectiveFacilityId]);

    const handleCreateDraftPOs = async () => {
        if (!effectiveFacilityId) return;
        setCreatingPO(true);
        try {
            const response =
                await pharmacyService.createDraftPOsFromSuggestions(effectiveFacilityId);
            setPoCreated(
                `Successfully created ${(response as any).count || 'new'} draft Purchase Orders.`,
            );
            loadSuggestions();
        } catch (error) {
            console.error('Failed to create POs', error);
            alert('Error creating draft purchase orders.');
        } finally {
            setCreatingPO(false);
        }
    };

    const highUrgency = suggestions.filter((s) => s.urgency === 'high');
    const mediumUrgency = suggestions.filter((s) => s.urgency === 'medium');

    return (
        <ProtectedRoute
            allowedRoles={['ADMIN', 'SUPER_ADMIN', 'FACILITY_ADMIN', 'PHARMACIST', 'STORE_MANAGER', 'OWNER']}
            requireFacility
        >
            <div className="p-6 space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-healthcare-dark dark:text-white flex items-center gap-2">
                            <Zap className="text-amber-500" fill="currentColor" /> Predictive
                            Reordering
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Intelligent procurement suggestions based on consumption patterns and
                            stock levels.
                        </p>
                    </div>

                    <button
                        onClick={handleCreateDraftPOs}
                        disabled={creatingPO || highUrgency.length === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-healthcare-primary text-white rounded-xl text-sm font-black hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/20 disabled:opacity-50"
                    >
                        {creatingPO ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <FilePlus size={18} />
                        )}
                        Auto-Generate Draft POs
                    </button>
                </div>

                {poCreated && (
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 text-emerald-800 animate-in slide-in-from-top duration-300">
                        <CheckCircle2 size={20} />
                        <span className="text-sm font-black">{poCreated}</span>
                        <button
                            onClick={() => setPoCreated(null)}
                            className="ml-auto text-emerald-400 hover:text-emerald-600"
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Critical Reorders"
                        value={highUrgency.length}
                        color="text-rose-500"
                        icon={<AlertCircle size={24} />}
                        subtitle="Below min threshold"
                    />
                    <StatCard
                        title="Pending Orders"
                        value={mediumUrgency.length}
                        color="text-amber-500"
                        icon={<ShoppingCart size={24} />}
                        subtitle="Optimized stock targets"
                    />
                    <StatCard
                        title="Draft POs Today"
                        value={0} // Mocked until we track this
                        color="text-healthcare-primary"
                        icon={<Package size={24} />}
                        subtitle="Created automatically"
                    />
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50">
                        <h2 className="font-black text-slate-800 dark:text-white flex items-center gap-2 italic">
                            <ShoppingCart className="text-healthcare-primary" size={20} /> Suggested
                            Reorder List
                        </h2>
                    </div>

                    {loading ? (
                        <SkeletonTable
                            rows={8}
                            columns={6}
                            headers={[
                                'Medicine',
                                'Current Stock',
                                'Target Level',
                                'Order Suggestion',
                                'Urgency',
                            ]}
                            columnAligns={['left', 'right', 'right', 'right', 'left', 'right']}
                            actions
                            className="border-none shadow-none"
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/80">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                                            Medicine
                                        </th>
                                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px] text-right">
                                            Current Stock
                                        </th>
                                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px] text-right">
                                            Target Level
                                        </th>
                                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px] text-right">
                                            Order Suggestion
                                        </th>
                                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                                            Urgency
                                        </th>
                                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px] text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {suggestions.length > 0 ? (
                                        suggestions.map((s, idx) => (
                                            <tr
                                                key={idx}
                                                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900 dark:text-white">
                                                        {s.medicine_name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-mono">
                                                        ID: {s.medicine_id}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium">
                                                    <span
                                                        className={
                                                            s.current_quantity <= s.reorder_point
                                                                ? 'text-rose-500 font-black'
                                                                : 'text-slate-700'
                                                        }
                                                    >
                                                        {s.current_quantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-500">
                                                    {s.reorder_point}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-lg font-black italic">
                                                        +{s.suggested_quantity}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${s.urgency === 'high'
                                                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                                            : s.urgency === 'medium'
                                                                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                            }`}
                                                    >
                                                        {s.urgency}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 text-slate-400 hover:text-healthcare-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                                                        <ArrowRight size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-24 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
                                                        <Package
                                                            size={48}
                                                            className="text-slate-300"
                                                        />
                                                    </div>
                                                    <div className="text-slate-400 font-medium">
                                                        No reorder suggestions found. Your inventory
                                                        is optimal!
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}

function StatCard({
    title,
    value,
    color,
    icon,
    subtitle,
}: {
    title: string;
    value: number;
    color: string;
    icon: React.ReactNode;
    subtitle: string;
}) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {title}
                </span>
                <div className={`${color} bg-opacity-10 p-2 rounded-xl`}>{icon}</div>
            </div>
            <div className={`text-3xl font-black ${color}`}>{value}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">{subtitle}</div>
        </div>
    );
}

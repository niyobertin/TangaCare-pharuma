import React, { useEffect, useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Package,
    AlertTriangle,
    Clock,
    DollarSign,
    Filter,
    ArrowRight,
    Building2,
    Snowflake,
    ShieldCheck,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../context/AuthContext';
import { pharmacyService } from '../../services/pharmacy.service';
import type {
    DashboardSummary,
    ReorderSuggestion,
    Alert,
    ColdChainOverview,
    ColdChainExcursion,
} from '../../types/pharmacy';
import {
    ConsumptionTrendChart,
    ExpiryRiskChart,
    InventoryStatusChart,
    ColdChainTelemetryChart,
} from './DashboardCharts';
import { ChartSkeleton, StatCardSkeleton } from './DashboardSkeletons';
import { SkeletonTable } from '../ui/SkeletonTable';
import { cn } from '../../lib/utils';
import { format, subDays, startOfToday, endOfToday } from 'date-fns';
import toast from 'react-hot-toast';

interface DashboardOwnerProps {
    facilityId: number | null;
}

export const DashboardOwner: React.FC<DashboardOwnerProps> = ({ facilityId }) => {
    const navigate = useNavigate();
    const { setFacility, facilities } = useAuth();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [lowStock, setLowStock] = useState<ReorderSuggestion[]>([]);
    const [nearExpiry, setNearExpiry] = useState<Alert[]>([]);
    const [coldChainOverview, setColdChainOverview] = useState<ColdChainOverview | null>(null);
    const [excursionActionLoading, setExcursionActionLoading] = useState<number | null>(null);

    const [facilityComparison, setFacilityComparison] = useState<import('../../types/pharmacy').MultiLocationData | null>(null);

    // Filters
    const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'custom'>('7days');
    const [startDate, setStartDate] = useState<string>(format(startOfToday(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState<string>(format(endOfToday(), 'yyyy-MM-dd'));

    const loadColdChainOverview = async () => {
        if (facilityId === null) {
            setColdChainOverview(null);
            return;
        }

        try {
            const data = await pharmacyService.getColdChainOverview();
            setColdChainOverview(data);
        } catch (error) {
            console.error('Failed to load cold-chain overview:', error);
            setColdChainOverview(null);
        }
    };

    const handleAcknowledgeExcursion = async (excursionId: number) => {
        setExcursionActionLoading(excursionId);
        try {
            await pharmacyService.acknowledgeColdChainExcursion(
                excursionId,
                'Acknowledged from executive dashboard',
            );
            toast.success('Excursion acknowledged');
            await loadColdChainOverview();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to acknowledge excursion');
        } finally {
            setExcursionActionLoading(null);
        }
    };

    const handleResolveExcursion = async (excursionId: number) => {
        setExcursionActionLoading(excursionId);
        try {
            await pharmacyService.resolveColdChainExcursion(excursionId, {
                action_taken: 'Temperature stabilized and stock integrity verified',
                notes: 'Resolved from executive dashboard',
            });
            toast.success('Excursion resolved');
            await loadColdChainOverview();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to resolve excursion');
        } finally {
            setExcursionActionLoading(null);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Fetch real-time low stock suggestions
                const reorderData = await pharmacyService.getReorderSuggestions(facilityId as any);
                setLowStock(reorderData.slice(0, 5));

                // Fetch real-time expiry alerts
                const alertsData = await pharmacyService.getAlerts({
                    facility_id: facilityId || undefined,
                    status: 'active',
                });
                setNearExpiry(
                    alertsData.data
                        .filter((a) => a.type === 'expiry_soon' || a.type === 'expiry')
                        .slice(0, 5),
                );

                // Fetch facility comparison if in global view
                if (facilityId === null) {
                    const comparison = await pharmacyService.getMultiLocationComparison('revenue');
                    setFacilityComparison(comparison);
                    setColdChainOverview(null);
                } else {
                    setFacilityComparison(null);
                    const coldChainData = await pharmacyService.getColdChainOverview();
                    setColdChainOverview(coldChainData);
                }
            } catch (error) {
                console.error('Failed to load initial dashboard data:', error);
            }
        };

        loadInitialData();
    }, [facilityId]);

    // Handle data refresh when date range changes
    useEffect(() => {
        const updateDashboardData = async () => {
            let start = format(startOfToday(), 'yyyy-MM-dd');
            let end = format(endOfToday(), 'yyyy-MM-dd');

            if (dateRange === '7days') {
                start = format(subDays(new Date(), 7), 'yyyy-MM-dd');
            } else if (dateRange === '30days') {
                start = format(subDays(new Date(), 30), 'yyyy-MM-dd');
            } else if (dateRange === 'custom') {
                start = startDate;
                end = endDate;
            }

            setLoading(true);
            try {
                // Fetch both KPIs for chosen period and a global summary for trends/categories
                const [kpis, summaryData] = await Promise.all([
                    pharmacyService.getComprehensiveKPIs(facilityId as any, {
                        start_date: start,
                        end_date: end,
                    }),
                    pharmacyService.getDashboardSummary(facilityId as any),
                ]);

                setSummary({
                    ...summaryData,
                    today: kpis, // Uses the selected period data for the KPI cards
                });
            } catch (error) {
                console.error('Error updating dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        updateDashboardData();
    }, [dateRange, startDate, endDate, facilityId]);

    const kpis = summary?.today;

    return (
        <div className="space-y-6 p-4 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
            {/* TOP BAR / FILTERS */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-healthcare-primary/10 rounded-xl">
                        <Filter className="text-healthcare-primary" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-healthcare-dark dark:text-white leading-tight">
                            Dashboard Overview
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                            Quick insights & actions
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        {(['today', '7days', '30days', 'custom'] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setDateRange(r)}
                                className={cn(
                                    'px-4 py-2 text-xs font-black rounded-lg transition-all uppercase tracking-tight',
                                    dateRange === r
                                        ? 'bg-white dark:bg-slate-700 text-healthcare-primary shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
                                )}
                            >
                                {r === '7days' ? '7 Days' : r === '30days' ? '30 Days' : r}
                            </button>
                        ))}
                    </div>

                    {dateRange === 'custom' && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                            />
                            <span className="text-slate-400 font-black">→</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <QuickActionCard
                    title="Create Purchase Order"
                    subtitle="Restock critical products quickly"
                    icon={<Package size={16} />}
                    onClick={() => navigate({ to: '/app/procurement' as any, search: {} as any })}
                />
                <QuickActionCard
                    title="Review Low Stock"
                    subtitle="Prioritize products nearing shortage"
                    icon={<AlertTriangle size={16} />}
                    onClick={() => navigate({ to: '/app/analytics/low-stock' as any, search: {} as any })}
                />
                <QuickActionCard
                    title="Inspect Expiry Risk"
                    subtitle="Protect margins and patient safety"
                    icon={<Clock size={16} />}
                    onClick={() => navigate({ to: '/app/analytics/recall' as any, search: {} as any })}
                />
                <QuickActionCard
                    title="Cold-Chain Status"
                    subtitle="Track active excursions live"
                    icon={<Snowflake size={16} />}
                    onClick={() => navigate({ to: '/app/settings' as any, search: {} as any })}
                />
            </div>

            {/* SECTION 1: TOP KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {loading ? (
                    Array(5)
                        .fill(0)
                        .map((_, i) => <StatCardSkeleton key={i} />)
                ) : (
                    <>
                        <KPICard
                            title="Total Sales"
                            value={kpis?.financial.total_revenue || 0}
                            isCurrency
                            icon={<DollarSign size={16} />}
                            color="bg-emerald-500"
                            trend={summary?.month.operational.sales_growth_rate}
                            onClick={() => navigate({ to: '/app/analytics/sales' as any, search: {} as any })}
                        />
                        <KPICard
                            title="Total Profit"
                            value={kpis?.financial.net_profit || 0}
                            isCurrency
                            icon={<TrendingUp size={16} />}
                            color="bg-blue-500"
                            onClick={() => navigate({ to: '/app/analytics/sales' as any, search: {} as any })}
                        />
                        <KPICard
                            title="Low Stock"
                            value={kpis?.inventory.low_stock_items || 0}
                            icon={<Package size={16} />}
                            color="bg-amber-500"
                            status={kpis?.inventory.low_stock_items! > 10 ? 'warning' : 'healthy'}
                            onClick={() => navigate({ to: '/app/analytics/low-stock' as any, search: {} as any })}
                        />
                        <KPICard
                            title="Near-Expiry"
                            value={kpis?.inventory.expiring_soon_items || 0}
                            icon={<Clock size={16} />}
                            color="bg-rose-500"
                            status={kpis?.inventory.expiring_soon_items! > 0 ? 'risk' : 'healthy'}
                            onClick={() => navigate({ to: '/app/analytics/recall' as any, search: {} as any })}
                        />
                        <KPICard
                            title="Stock Value"
                            value={kpis?.inventory.total_inventory_value || 0}
                            isCurrency
                            icon={<DollarSign size={16} />}
                            color="bg-teal-600"
                            onClick={() => navigate({ to: '/app/analytics/inventory' as any, search: {} as any })}
                        />
                    </>
                )}
            </div>

            {/* SECTION 2: CORE GRAPHS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-healthcare-dark dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp size={16} className="text-healthcare-primary" />
                            Sales Performance
                        </h3>
                        <button
                            onClick={() => navigate({ to: '/app/analytics/sales' as any, search: {} as any })}
                            className="text-[10px] font-black text-slate-400 hover:text-healthcare-primary flex items-center gap-1 uppercase"
                        >
                            Details <ArrowRight size={10} />
                        </button>
                    </div>
                    {loading ? (
                        <ChartSkeleton />
                    ) : (
                        <div className="h-[180px]">
                            <ConsumptionTrendChart
                                data={
                                    summary?.sales_trend?.map((d) => ({
                                        date: d.date,
                                        dispensed: d.sales,
                                        received: 0,
                                    })) || []
                                }
                            />
                        </div>
                    )}
                </div>

                <div className="glass-card p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-healthcare-dark dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <Package size={16} className="text-teal-500" />
                            Stock Health
                        </h3>
                        <button
                            onClick={() => navigate({ to: '/app/analytics/movement' as any, search: {} as any })}
                            className="text-[10px] font-black text-slate-400 hover:text-healthcare-primary flex items-center gap-1 uppercase"
                        >
                            Details <ArrowRight size={10} />
                        </button>
                    </div>
                    {loading ? (
                        <ChartSkeleton />
                    ) : (
                        <div className="h-[180px]">
                            <InventoryStatusChart
                                data={
                                    summary?.categories?.map((c) => ({
                                        category: c.category_name,
                                        count: c.quantity_sold,
                                        value: c.revenue,
                                    })) || []
                                }
                            />
                        </div>
                    )}
                </div>

                <div className="glass-card p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-healthcare-dark dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <AlertTriangle size={16} className="text-rose-500" />
                            Expiry Risk Analysis
                        </h3>
                        <button
                            onClick={() => navigate({ to: '/app/analytics/recall' as any, search: {} as any })}
                            className="text-[10px] font-black text-slate-400 hover:text-healthcare-primary flex items-center gap-1 uppercase"
                        >
                            Details <ArrowRight size={10} />
                        </button>
                    </div>
                    {loading ? (
                        <ChartSkeleton />
                    ) : (
                        <div className="h-[180px]">
                            <ExpiryRiskChart
                                data={{
                                    days_30: summary?.expiry_risk?.under_30_days?.count || 0,
                                    days_60: summary?.expiry_risk?.under_60_days?.count || 0,
                                    days_90: summary?.expiry_risk?.under_90_days?.count || 0,
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="glass-card p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-healthcare-dark dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <Snowflake size={16} className="text-cyan-600" />
                            Cold-Chain Integrity
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-black uppercase">
                                {coldChainOverview?.compliance_rate_24h ?? 0}% compliant
                            </span>
                            <span
                                className={cn(
                                    'text-[10px] px-2 py-1 rounded-full font-black uppercase',
                                    (coldChainOverview?.active_excursions || 0) > 0
                                        ? 'bg-rose-50 text-rose-700'
                                        : 'bg-slate-100 text-slate-600',
                                )}
                            >
                                {coldChainOverview?.active_excursions || 0} active
                            </span>
                        </div>
                    </div>
                    {loading ? (
                        <ChartSkeleton />
                    ) : (
                        <div className="h-[180px]">
                            <ColdChainTelemetryChart data={coldChainOverview?.temperature_trend || []} />
                        </div>
                    )}
                </div>
            </div>

            {/* SECTION: FACILITY OVERVIEW (Global View Only) */}
            {facilityId === null && (
                <div className="glass-card p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-healthcare-dark dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <Building2 size={16} className="text-healthcare-primary" />
                            Branch Performance
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(facilityComparison?.facilities && facilityComparison.facilities.length > 0
                            ? facilityComparison.facilities
                            : (facilities || [])
                        ).map((f: any) => {
                            const id = f.facility_id || f.id;
                            const name = f.facility_name || f.name;
                            const revenue = f.metric_value || 0;
                            const rank = f.rank || '-';

                            return (
                                <div
                                    key={id}
                                    onClick={() => {
                                        setFacility(id);
                                        navigate({ to: '/app' as any, search: {} as any });
                                    }}
                                    className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-healthcare-primary transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-black text-healthcare-dark dark:text-white truncate">
                                            {name}
                                        </span>
                                        <ArrowRight
                                            size={14}
                                            className="text-slate-300 group-hover:text-healthcare-primary transition-colors"
                                        />
                                    </div>
                                    <div className="text-lg font-bold text-healthcare-primary">
                                        {revenue > 0
                                            ? `RWF ${revenue.toLocaleString()}`
                                            : 'No recent sales'}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                                        {rank !== '-' ? `Rank #${rank}` : 'New Branch'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* SECTION 3: ACTION TABLES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ActionTable
                    title="Low Stock Items"
                    subtitle="Items below reorder level"
                    data={lowStock.map((i) => ({
                        id: i.medicine_id,
                        name: i.medicine_name,
                        qty: i.current_quantity,
                        meta: `${i.reorder_point} needed`,
                        action: 'order',
                    }))}
                    loading={loading}
                    onAction={(id) =>
                        navigate({ to: '/app/procurement' as any, search: { medicineId: id } as any })
                    }
                    onView={() => navigate({ to: '/app/analytics/low-stock' as any, search: {} as any })}
                />

                <ActionTable
                    title="Expiring Items"
                    subtitle="Upcoming stock expiration"
                    data={nearExpiry.map((a) => ({
                        id: a.medicine_id!,
                        name: a.medicine?.name || a.title,
                        qty: a.current_value || 0,
                        meta: formatRelativeDate(a.created_at),
                        action: 'view',
                    }))}
                    loading={loading}
                    onAction={(id) =>
                        navigate({ to: '/app/inventory' as any, search: { medicineId: id } as any })
                    }
                    onView={() => navigate({ to: '/app/analytics/recall' as any, search: {} as any })}
                />

                <ExcursionTable
                    title="Cold-Chain Excursions"
                    subtitle="Immediate containment workflow"
                    data={coldChainOverview?.active_excursions_list || []}
                    loading={loading}
                    onAcknowledge={handleAcknowledgeExcursion}
                    onResolve={handleResolveExcursion}
                    loadingId={excursionActionLoading}
                />
            </div>
        </div>
    );
};

// --- Sub-components ---

interface KPICardProps {
    title: string;
    value: number;
    isCurrency?: boolean;
    trend?: number;
    icon: React.ReactNode;
    color: string;
    status?: 'healthy' | 'warning' | 'risk';
    onClick: () => void;
}

const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    isCurrency,
    trend,
    icon,
    color,
    status,
    onClick,
}) => {
    return (
        <div
            onClick={onClick}
            className="group relative bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden min-h-[100px]"
        >
            <div
                className={cn(
                    'absolute top-0 right-0 w-16 h-16 -mr-4 -mt-4 rounded-full opacity-5 transition-transform group-hover:scale-125',
                    color,
                )}
            />

            <div className="flex justify-between items-start mb-2">
                <div className={cn('p-1.5 rounded-xl text-white shadow-md', color)}>{icon}</div>
                {status && (
                    <div
                        className={cn(
                            'px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter',
                            status === 'healthy'
                                ? 'bg-emerald-100 text-emerald-600'
                                : status === 'warning'
                                    ? 'bg-amber-100 text-amber-600'
                                    : 'bg-rose-100 text-rose-600',
                        )}
                    >
                        {status}
                    </div>
                )}
            </div>

            <h3 className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5">
                {title}
            </h3>
            <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-healthcare-dark dark:text-white tracking-tight">
                    {isCurrency ? `RWF ${value.toLocaleString()}` : value.toLocaleString()}
                </span>
                {trend !== undefined && (
                    <span
                        className={cn(
                            'text-[10px] font-black flex items-center',
                            trend >= 0 ? 'text-emerald-500' : 'text-rose-500',
                        )}
                    >
                        {trend >= 0 ? (
                            <TrendingUp size={10} className="mr-0.5" />
                        ) : (
                            <TrendingDown size={10} className="mr-0.5" />
                        )}
                        {Math.abs(trend).toFixed(1)}%
                    </span>
                )}
            </div>
        </div>
    );
};

const QuickActionCard: React.FC<{
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    onClick: () => void;
}> = ({ title, subtitle, icon, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="group text-left p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-healthcare-primary hover:-translate-y-0.5 transition-all shadow-sm"
        >
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-healthcare-primary/10 text-healthcare-primary rounded-xl">{icon}</div>
                <span className="text-xs font-black text-healthcare-dark dark:text-white">{title}</span>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{subtitle}</p>
        </button>
    );
};

interface ActionTableProps {
    title: string;
    subtitle: string;
    data: Array<{
        id: number;
        name: string;
        qty: number;
        meta: string;
        action: 'order' | 'view';
    }>;
    loading?: boolean;
    onAction: (id: number) => void;
    onView: () => void;
}

const ActionTable: React.FC<ActionTableProps> = ({
    title,
    subtitle,
    data,
    loading,
    onAction,
    onView,
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                    <h3 className="text-xs font-bold text-healthcare-dark dark:text-white uppercase tracking-wider">
                        {title}
                    </h3>
                    <p className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">
                        {subtitle}
                    </p>
                </div>
                <button
                    onClick={onView}
                    className="text-[10px] font-black text-healthcare-primary hover:underline uppercase"
                >
                    View Report
                </button>
            </div>

            <div className="flex-1">
                {loading ? (
                    <div className="p-0">
                        <SkeletonTable
                            rows={5}
                            columns={2}
                            headers={null}
                            className="border-none shadow-none"
                        />
                    </div>
                ) : data.length > 0 ? (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                        {data.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center font-black text-[10px] text-slate-500">
                                        {item.qty}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-healthcare-dark dark:text-white line-clamp-1">
                                            {item.name}
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                            {item.meta}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onAction(item.id)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all opacity-0 group-hover:opacity-100',
                                        item.action === 'order'
                                            ? 'bg-healthcare-primary text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600',
                                    )}
                                >
                                    {item.action === 'order' ? 'Reorder' : 'View'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-300">
                        <Package size={24} className="mb-2 opacity-20" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">
                            No critical items
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

const ExcursionTable: React.FC<{
    title: string;
    subtitle: string;
    data: ColdChainExcursion[];
    loading?: boolean;
    loadingId: number | null;
    onAcknowledge: (id: number) => void;
    onResolve: (id: number) => void;
}> = ({ title, subtitle, data, loading, loadingId, onAcknowledge, onResolve }) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-healthcare-dark dark:text-white uppercase tracking-wider">
                    {title}
                </h3>
                <p className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">{subtitle}</p>
            </div>
            <div className="flex-1">
                {loading ? (
                    <div className="p-0">
                        <SkeletonTable rows={5} columns={2} headers={null} className="border-none shadow-none" />
                    </div>
                ) : data.length > 0 ? (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                        {data.slice(0, 5).map((item) => (
                            <div key={item.id} className="p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-black text-healthcare-dark dark:text-white">
                                        {item.location?.name || `Location #${item.storage_location_id}`}
                                    </p>
                                    <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                                        {item.status}
                                    </span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-semibold uppercase">
                                    Temp: {item.last_temperature_c.toFixed(1)}°C
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onAcknowledge(item.id)}
                                        disabled={loadingId === item.id}
                                        className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-amber-50 text-amber-700 disabled:opacity-50"
                                    >
                                        {loadingId === item.id ? 'Working...' : 'Acknowledge'}
                                    </button>
                                    <button
                                        onClick={() => onResolve(item.id)}
                                        disabled={loadingId === item.id}
                                        className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 disabled:opacity-50"
                                    >
                                        Resolve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-300">
                        <ShieldCheck size={24} className="mb-2 opacity-25" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">No active excursions</span>
                    </div>
                )}
            </div>
        </div>
    );
};

function formatRelativeDate(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
        return dateStr;
    }
}

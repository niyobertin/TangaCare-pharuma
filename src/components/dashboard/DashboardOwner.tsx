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
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { pharmacyService } from '../../services/pharmacy.service';
import type { DashboardSummary, ReorderSuggestion, Alert } from '../../types/pharmacy';
import { ConsumptionTrendChart, ExpiryRiskChart, InventoryStatusChart } from './DashboardCharts';
import { ChartSkeleton, StatCardSkeleton } from './DashboardSkeletons';
import { cn } from '../../lib/utils';
import { format, subDays, startOfToday, endOfToday } from 'date-fns';

interface DashboardOwnerProps {
    facilityId: number;
}

export const DashboardOwner: React.FC<DashboardOwnerProps> = ({ facilityId }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [lowStock, setLowStock] = useState<ReorderSuggestion[]>([]);
    const [nearExpiry, setNearExpiry] = useState<Alert[]>([]);

    // Filters
    const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'custom'>('today');
    const [startDate, setStartDate] = useState<string>(format(startOfToday(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState<string>(format(endOfToday(), 'yyyy-MM-dd'));

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            try {
                // Fetch summary (default today)
                const data = await pharmacyService.getDashboardSummary(facilityId);
                setSummary(data);

                // Fetch real-time low stock suggestions
                const reorderData = await pharmacyService.getReorderSuggestions(facilityId);
                setLowStock(reorderData.slice(0, 5));

                // Fetch real-time expiry alerts
                const alertsData = await pharmacyService.getAlerts({
                    facility_id: facilityId,
                    status: 'active',
                });
                setNearExpiry(
                    alertsData.data
                        .filter((a) => a.type === 'expiry_soon' || a.type === 'expiry')
                        .slice(0, 5),
                );
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (facilityId) loadDashboard();
    }, [facilityId]);

    // Handle data refresh when date range changes
    useEffect(() => {
        const updateKPIs = async () => {
            if (!facilityId) return;
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

            try {
                const kpis = await pharmacyService.getComprehensiveKPIs(facilityId, {
                    start_date: start,
                    end_date: end,
                });
                if (summary) {
                    setSummary({
                        ...summary,
                        today: kpis, // Mapping as requested for period selection
                    });
                }
            } catch (error) {
                console.error('Error updating KPIs:', error);
            }
        };

        if (dateRange !== 'today') updateKPIs();
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
                            onClick={() => navigate({ to: '/app/analytics/sales' })}
                        />
                        <KPICard
                            title="Total Profit"
                            value={kpis?.financial.gross_profit || 0}
                            isCurrency
                            icon={<TrendingUp size={16} />}
                            color="bg-blue-500"
                            onClick={() => navigate({ to: '/app/analytics/profit' })}
                        />
                        <KPICard
                            title="Low Stock"
                            value={kpis?.inventory.low_stock_items || 0}
                            icon={<Package size={16} />}
                            color="bg-amber-500"
                            status={kpis?.inventory.low_stock_items! > 10 ? 'warning' : 'healthy'}
                            onClick={() => navigate({ to: '/app/analytics/low-stock' })}
                        />
                        <KPICard
                            title="Near-Expiry"
                            value={kpis?.inventory.expiring_soon_items || 0}
                            icon={<Clock size={16} />}
                            color="bg-rose-500"
                            status={kpis?.inventory.expiring_soon_items! > 0 ? 'risk' : 'healthy'}
                            onClick={() => navigate({ to: '/app/analytics/recall' })}
                        />
                        <KPICard
                            title="Stock Value"
                            value={kpis?.inventory.total_inventory_value || 0}
                            isCurrency
                            icon={<DollarSign size={16} />}
                            color="bg-teal-600"
                            onClick={() => navigate({ to: '/app/analytics/inventory' })}
                        />
                    </>
                )}
            </div>

            {/* SECTION 2: CORE GRAPHS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-healthcare-dark dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp size={16} className="text-healthcare-primary" />
                            Sales Performance
                        </h3>
                        <button
                            onClick={() => navigate({ to: '/app/analytics/sales' })}
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
                            onClick={() => navigate({ to: '/app/analytics/movement' })}
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
                                    summary?.categories.map((c) => ({
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
                            onClick={() => navigate({ to: '/app/analytics/recall' })}
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
                                    days_30: summary?.expiry_risk.under_30_days.count || 0,
                                    days_60: summary?.expiry_risk.under_60_days.count || 0,
                                    days_90: summary?.expiry_risk.under_90_days.count || 0,
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* SECTION 3: ACTION TABLES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    onAction={(id) =>
                        navigate({ to: '/app/procurement', search: { medicineId: id } })
                    }
                    onView={() => navigate({ to: '/app/analytics/low-stock' })}
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
                    onAction={(id) =>
                        navigate({ to: '/app/inventory', search: { medicineId: id } })
                    }
                    onView={() => navigate({ to: '/app/analytics/recall' })}
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
    onAction: (id: number) => void;
    onView: () => void;
}

const ActionTable: React.FC<ActionTableProps> = ({ title, subtitle, data, onAction, onView }) => {
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
                {data.length > 0 ? (
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

function formatRelativeDate(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
        return dateStr;
    }
}

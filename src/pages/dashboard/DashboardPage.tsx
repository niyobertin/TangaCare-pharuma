import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { pharmacyService } from '../../services/pharmacy.service';
import { useAuth } from '../../context/AuthContext';
import type { DashboardStats, Transaction, Alert } from '../../types/pharmacy';
import {
    Package,
    TrendingUp,
    AlertTriangle,
    Clock,
    Zap,
    Stethoscope,
    ShieldCheck,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical,
    Download,
    Filter,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useNavigate } from '@tanstack/react-router';
import { InventoryStatusChart, ConsumptionTrendChart, ExpiryRiskChart, InventoryValuePieChart } from '../../components/dashboard/DashboardCharts';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function formatRelativeTime(isoDate: string): string {
    const d = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffM = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMs / 3600000);
    const diffD = Math.floor(diffMs / 86400000);
    if (diffM < 1) return 'Just now';
    if (diffM < 60) return `${diffM}m ago`;
    if (diffH < 24) return `${diffH}h ago`;
    if (diffD < 7) return `${diffD}d ago`;
    return d.toLocaleDateString();
}

export function DashboardPage() {
    const { user, facilityId, facilities } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [topMedicines, setTopMedicines] = useState<{ name: string; value: number }[]>([]);
    const [medicinesSortOrder, setMedicinesSortOrder] = useState<'ASC' | 'DESC'>('DESC');

    // New Data States
    const [inventoryStatus, setInventoryStatus] = useState<any>(null);
    const [consumptionTrends, setConsumptionTrends] = useState<any>(null);
    const [expiryRisk, setExpiryRisk] = useState<any>(null);
    const navigate = useNavigate();

    const fetchTopMedicines = async (order: 'ASC' | 'DESC') => {
        try {
            const data = await pharmacyService.getTopSellingMedicines(order);
            setTopMedicines(data);
        } catch (error) {
            console.error('Failed to fetch medicines ranking:', error);
        }
    };

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoadingStats(true);
            try {
                const data = await pharmacyService.getDashboardStats();
                if (mounted) setStats(data);

                // Initial fetch for medicines
                await fetchTopMedicines(medicinesSortOrder);
            } catch (e) {
                if (mounted) setStats(null);
            } finally {
                if (mounted) setLoadingStats(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [facilityId]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoadingTransactions(true);
            try {
                const list = await pharmacyService.getRecentSales();
                if (mounted) setTransactions(Array.isArray(list) ? list : []);
            } catch {
                if (mounted) setTransactions([]);
            } finally {
                if (mounted) setLoadingTransactions(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [facilityId]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const res = await pharmacyService.getAlerts({ status: 'active' });
                if (mounted) setAlerts(res?.data ?? []);
            } catch {
                if (mounted) setAlerts([]);
            }
        };
        load();

        const loadTopMedicines = async () => {
            try {
                const res = await pharmacyService.getTopSellingMedicines();
                if (mounted) setTopMedicines(res);
            } catch {
                if (mounted) setTopMedicines([]);
            }
        };
        loadTopMedicines();

        const loadAdvancedStats = async () => {
            try {
                const [invStatus, trends, risk] = await Promise.all([
                    pharmacyService.getInventoryStatus(),
                    pharmacyService.getConsumptionTrends(30),
                    pharmacyService.getExpiryRisk(90)
                ]);
                if (mounted) {
                    setInventoryStatus(invStatus);
                    setConsumptionTrends(trends);
                    setExpiryRisk(risk);
                }
            } catch (e) {
                console.error("Failed to load advanced dashboard stats", e);
            }
        };
        loadAdvancedStats();

        return () => {
            mounted = false;
        };
    }, [facilityId]);

    const medicinesInStock = stats?.medicinesInStock ?? '0';
    const lowStockWarning = stats?.lowStockWarning ?? 0;
    const expiringSoon = stats?.expiringSoon ?? 0;
    const dailySalesVal = Number(stats?.dailySales);
    const dailySales = !isNaN(dailySalesVal)
        ? `RWF ${dailySalesVal.toLocaleString()}`
        : 'RWF 0';

    const scopeLabel =
        facilityId == null && facilities.length > 0
            ? 'All facilities'
            : facilityId != null
                ? (facilities.find((f) => f.id === facilityId)?.name ?? `Facility #${facilityId}`)
                : `Facility #${user?.facility_id ?? '—'}`;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <ProtectedRoute
            allowedRoles={[
                'Admin',
                'Pharmacist',
                'Super Admin',
                'ADMIN',
                'PHARMACIST',
                'SUPER_ADMIN',
                'OWNER',
                'FACILITY_ADMIN',
                'FACILITY ADMIN',
                'CASHIER',
                'STORE_MANAGER',
                'STORE MANAGER',
                'AUDITOR',
            ]}
        >
            <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-black text-healthcare-dark tracking-tight">
                            Pharmacy Management
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2 mt-0.5 text-xs uppercase tracking-wider">
                            <span className="flex h-2 w-2 rounded-full bg-healthcare-accent animate-pulse"></span>
                            Live Pharmacy Status • {scopeLabel}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                            <Filter size={14} /> Filter View
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-healthcare-primary text-white rounded-lg text-sm font-black hover:bg-teal-700 transition-all shadow-md shadow-teal-500/10">
                            <Download size={14} /> Export Report
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    <StatCard
                        title="Medicines in Stock"
                        value={
                            loadingStats
                                ? '—'
                                : medicinesInStock.toLocaleString?.() || medicinesInStock
                        }
                        trend={stats?.trends?.medicines ?? '0%'}
                        isPositive={stats?.isPositive?.medicines ?? true}
                        color="bg-healthcare-primary"
                        icon={<Package size={20} />}
                        onClick={() => navigate({ to: '/app/inventory' })}
                    />
                    <StatCard
                        title="Low Stock Warning"
                        value={loadingStats ? '—' : String(lowStockWarning)}
                        trend={stats?.trends?.lowStock ?? '0%'}
                        isPositive={stats?.isPositive?.lowStock ?? true}
                        color="bg-amber-500"
                        icon={<AlertTriangle size={20} />}
                        onClick={() => navigate({ to: '/app/alerts' })}
                    />
                    <StatCard
                        title="Expiring Soon"
                        value={loadingStats ? '—' : String(expiringSoon)}
                        trend={stats?.trends?.expiring ?? '0%'}
                        isPositive={stats?.isPositive?.expiring ?? false}
                        color="bg-red-500"
                        icon={<Clock size={20} />}
                        onClick={() => navigate({ to: '/app/alerts' })}
                    />
                    <StatCard
                        title="Total Daily Sales"
                        value={loadingStats ? '—' : dailySales}
                        trend={stats?.trends?.sales ?? '0%'}
                        isPositive={stats?.isPositive?.sales ?? true}
                        color="bg-healthcare-secondary"
                        icon={<TrendingUp size={20} />}
                        onClick={() => navigate({ to: '/app/analytics' })}
                    />
                    <StatCard
                        title="Total Inventory Value"
                        value={
                            loadingStats
                                ? '—'
                                : `RWF ${stats?.totalInventoryValue?.toLocaleString() || '0'}`
                        }
                        trend="0%"
                        isPositive={true}
                        color="bg-emerald-600"
                        icon={<ShieldCheck size={20} />}
                        onClick={() => navigate({ to: '/app/inventory' })}
                    />
                </div>

                {/* Row 2: Full Width Consumption Trends */}
                <div className="glass-card p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative overflow-hidden shadow-sm w-full">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-base font-black text-healthcare-dark">
                                Consumption Trends (30 Days)
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                                Daily dispensing patterns
                            </p>
                        </div>
                    </div>
                    <div className="w-full h-[350px]">
                        {consumptionTrends?.daily_trends && consumptionTrends.daily_trends.length > 0 ? (
                            <ConsumptionTrendChart data={consumptionTrends.daily_trends} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                                No trend data available for this period.
                            </div>
                        )}
                    </div>
                </div>

                {/* Row 3: Alerts & Compliance Features */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card p-5 rounded-2xl border-2 border-red-100 dark:border-red-900 bg-white dark:bg-slate-900 shadow-sm cursor-pointer hover:border-red-300 transition-colors"
                        onClick={() => navigate({ to: '/app/alerts' })}
                    >
                        <h3 className="font-black text-sm text-healthcare-dark mb-5">
                            Critical Alerts
                        </h3>
                        <div className="space-y-4">
                            {alerts.length === 0 ? (
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    No active alerts.
                                </p>
                            ) : (
                                alerts
                                    .slice(0, 5)
                                    .map((alert) => (
                                        <AlertItem
                                            key={alert.id}
                                            type={
                                                alert.type === 'expiry'
                                                    ? 'expiry'
                                                    : alert.type === 'low_stock'
                                                        ? 'stock'
                                                        : 'audit'
                                            }
                                            title={
                                                alert.message.slice(0, 40) +
                                                (alert.message.length > 40 ? '…' : '')
                                            }
                                            info={new Date(alert.created_at).toLocaleString()}
                                            isUrgent={alert.status === 'active'}
                                        />
                                    ))
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                        <SummaryFeature
                            icon={<Stethoscope size={18} className="text-blue-600" />}
                            title="Pharmacy Staff"
                            value={
                                loadingStats
                                    ? '—'
                                    : typeof stats?.staffCount === 'number'
                                        ? `${stats.staffCount} staff in scope`
                                        : '—'
                            }
                            description="Users in facility or organization"
                            color="bg-blue-50 dark:bg-blue-900"
                            onClick={() => navigate({ to: '/app/users' })}
                        />
                        <SummaryFeature
                            icon={<ShieldCheck size={18} className="text-healthcare-accent" />}
                            title="System Compliance"
                            value={
                                loadingStats
                                    ? '—'
                                    : (stats?.activeAlertsCount ?? 0) === 0
                                        ? '100% Optimized'
                                        : `${Math.max(0, 100 - (stats?.activeAlertsCount ?? 0) * 2)}% attention`
                            }
                            description={
                                (stats?.activeAlertsCount ?? 0) === 0
                                    ? 'All regulatory checks passed'
                                    : `${stats?.activeAlertsCount} active alert(s)`
                            }
                            color={
                                (stats?.activeAlertsCount ?? 0) === 0
                                    ? 'bg-emerald-50 dark:bg-emerald-900'
                                    : 'bg-amber-50 dark:bg-amber-900'
                            }
                            onClick={() => navigate({ to: '/app/audit-logs' })}
                        />
                    </div>
                </div>

                {/* Advanced Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <h3 className="text-base font-black text-healthcare-dark mb-4">Inventory Status</h3>
                        {inventoryStatus ? (
                            <InventoryStatusChart data={inventoryStatus.by_category} />
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-slate-400">Loading Inventory...</div>
                        )}
                    </div>

                    <div className="glass-card p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <h3 className="text-base font-black text-healthcare-dark mb-4">Expiry Risk Overview</h3>
                        {expiryRisk ? (
                            <ExpiryRiskChart data={expiryRisk} />
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-slate-400">Loading Risk Data...</div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div
                        className="glass-card p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm min-h-[400px] flex flex-col cursor-pointer hover:border-healthcare-primary/30 transition-colors"
                        onClick={() => navigate({ to: '/app/analytics' })}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-black text-sm text-healthcare-dark flex items-center gap-2">
                                <Zap size={16} className={`text-${medicinesSortOrder === 'DESC' ? 'amber' : 'red'}-500 fill-${medicinesSortOrder === 'DESC' ? 'amber' : 'red'}-500`} />
                                {medicinesSortOrder === 'DESC' ? 'Most' : 'Least'} Sold Medicines
                            </h3>
                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => {
                                        setMedicinesSortOrder('DESC');
                                        fetchTopMedicines('DESC');
                                    }}
                                    className={cn(
                                        "px-2 py-1 text-xs font-semibold rounded-md transition-all",
                                        medicinesSortOrder === 'DESC'
                                            ? "bg-white dark:bg-slate-700 text-healthcare-primary shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    )}
                                >
                                    Most
                                </button>
                                <button
                                    onClick={() => {
                                        setMedicinesSortOrder('ASC');
                                        fetchTopMedicines('ASC');
                                    }}
                                    className={cn(
                                        "px-2 py-1 text-xs font-semibold rounded-md transition-all",
                                        medicinesSortOrder === 'ASC'
                                            ? "bg-white dark:bg-slate-700 text-healthcare-primary shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    )}
                                >
                                    Least
                                </button>
                            </div>
                        </div>
                        {topMedicines.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                                No data available
                            </div>
                        ) : (
                            <div className="relative flex-1 w-full min-h-[300px] flex flex-col items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={topMedicines}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                            label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {topMedicines.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                    className="hover:opacity-80 transition-opacity cursor-pointer"
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    const total = topMedicines.reduce((sum, item) => sum + item.value, 0);
                                                    const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';

                                                    return (
                                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-700 z-50">
                                                            <p className="font-bold text-healthcare-dark mb-1">{data.name}</p>
                                                            <div className="flex items-center gap-3 text-sm">
                                                                <span className="font-black text-healthcare-primary">{data.value} Units</span>
                                                                <span className="text-slate-400 font-medium">|</span>
                                                                <span className="font-bold text-slate-500">{percent}%</span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    <div className="glass-card p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col min-h-[400px]">
                        <h3 className="text-base font-black text-healthcare-dark mb-4">Inventory Value Distribution</h3>
                        {inventoryStatus ? (
                            <InventoryValuePieChart data={inventoryStatus.by_category} />
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-slate-400">Loading Value Data...</div>
                        )}
                    </div>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="text-base font-black text-healthcare-dark">
                                Recent Medicine Sales
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                                Real-time dispensing activity
                            </p>
                        </div>
                        <button
                            onClick={() => navigate({ to: '/app/stock-movements' })}
                            className="text-xs font-bold text-healthcare-primary hover:text-healthcare-dark transition-colors"
                        >
                            View All Transactions &rarr;
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-black uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-6 py-4">Transaction ID</th>
                                    <th className="px-6 py-4">Medicine Item</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4 text-center">Quantity</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px] font-medium">
                                {loadingTransactions ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-sm"
                                        >
                                            Loading…
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-sm"
                                        >
                                            No recent sales.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((t) => (
                                        <TableRow
                                            key={t.id}
                                            id={t.id}
                                            name={t.name}
                                            category={t.category}
                                            qty={
                                                t.qty.startsWith('+')
                                                    ? t.qty
                                                    : `-${t.qty.replace(/^-/, '')}`
                                            }
                                            status={t.status}
                                            date={formatRelativeTime(t.date)}
                                            sku={t.sku || '—'}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div >
        </ProtectedRoute >
    );
}

function StatCard({ title, value, trend, isPositive, color, icon, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className="glass-card p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group transition-all duration-300 shadow-sm relative overflow-hidden cursor-pointer border-2 hover:border-healthcare-primary/30 hover:scale-[1.02]"
        >
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div
                        className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-all duration-300 group:scale-110',
                            color,
                        )}
                    >
                        {icon}
                    </div>
                    <div
                        className={cn(
                            'flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-lg',
                            isPositive
                                ? 'bg-emerald-50 dark:bg-emerald-900 text-healthcare-accent'
                                : 'bg-red-50 dark:bg-red-900 text-red-500',
                        )}
                    >
                        {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {trend}
                    </div>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 truncate">
                    {title}
                </h3>
                <p className="text-xl font-black text-healthcare-dark leading-none tracking-tight">
                    {value}
                </p>
            </div>
        </div>
    );
}

function SummaryFeature({ icon, title, value, description, color, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className="flex items-center gap-4 p-4 glass-card rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all shadow-sm cursor-pointer hover:border-blue-200"
        >
            <div className={cn('p-3 rounded-xl shadow-inner', color)}>{icon}</div>
            <div>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                    {title}
                </p>
                <p className="text-lg font-black text-healthcare-dark leading-none mb-1">{value}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">
                    {description}
                </p>
            </div>
        </div>
    );
}

function AlertItem({ type, title, info, isUrgent = false }: any) {
    return (
        <div
            className={cn(
                'p-3.5 rounded-2xl border-2 flex items-center gap-4 group cursor-pointer transition-all',
                isUrgent
                    ? 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-900 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm',
            )}
        >
            <div
                className={cn(
                    'w-2 h-2 rounded-full',
                    isUrgent
                        ? 'bg-red-500 animate-pulse'
                        : type === 'expiry'
                            ? 'bg-red-400'
                            : 'bg-amber-400',
                )}
            ></div>
            <div className="flex-1">
                <h4 className="font-bold text-healthcare-dark text-sm leading-none mb-1.5">
                    {title}
                </h4>
                <p
                    className={cn(
                        'text-[10px] font-black uppercase tracking-widest',
                        isUrgent
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-slate-500 dark:text-slate-400',
                    )}
                >
                    {info}
                </p>
            </div>
        </div>
    );
}

function TableRow({
    id,
    name,
    category,
    qty,
    status,
    date,
    sku,
    isStockIn = false,
    isPending = false,
}: any) {
    return (
        <tr className="group hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition-all">
            <td className="px-6 py-4">
                <span className="text-[10px] font-black text-healthcare-primary bg-teal-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-teal-100 dark:border-slate-700 shadow-sm tracking-tight">
                    {id}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col">
                    <span className="font-black text-healthcare-dark text-[13px] leading-tight">
                        {name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">
                        {sku}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-[10px] font-black px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md whitespace-nowrap uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-xs">
                    {category}
                </span>
            </td>
            <td className="px-6 py-4 text-center">
                <span
                    className={cn(
                        'text-[14px] font-black tracking-tight',
                        isStockIn
                            ? 'text-emerald-500'
                            : qty.startsWith('-')
                                ? 'text-amber-500'
                                : 'text-slate-600 dark:text-slate-300',
                    )}
                >
                    {qty}
                </span>
            </td>
            <td className="px-6 py-4">
                <span
                    className={cn(
                        'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border whitespace-nowrap shadow-xs',
                        isPending
                            ? 'bg-amber-50 dark:bg-amber-900 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            : isStockIn
                                ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                : 'bg-emerald-50 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 border-teal-200 dark:border-teal-800',
                    )}
                >
                    {status}
                </span>
            </td>
            <td className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {date}
            </td>
            <td className="px-6 py-4 text-right">
                <button className="p-2 text-slate-300 hover:text-healthcare-dark transition-all opacity-0 group-hover:opacity-100 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                    <MoreVertical size={14} />
                </button>
            </td>
        </tr>
    );
}

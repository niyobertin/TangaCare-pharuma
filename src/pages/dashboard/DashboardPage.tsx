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
    ShieldCheck,
    MoreVertical,
    ArrowRightLeft,
    FilePlus,
    RefreshCw,
} from 'lucide-react';
import { ABCAnalysisVisual } from '../../components/pharmacy/ABCAnalysisVisual';
import { FEFOComplianceVisual } from '../../components/pharmacy/FEFOComplianceVisual';
import { DemandPlanningPanel } from '../../components/pharmacy/DemandPlanningPanel';
import { SupplierMetrics } from '../../components/pharmacy/SupplierMetrics';
import { useNavigate } from '@tanstack/react-router';
import {
    InventoryStatusChart,
    ConsumptionTrendChart,
    ExpiryRiskChart,
    type InventoryData,
    type TrendData,
} from '../../components/dashboard/DashboardCharts';
import { AdvancedKPICards } from '../../components/pharmacy/AdvancedKPICards';
import { CriticalMedicinesPanel } from '../../components/pharmacy/CriticalMedicinesPanel';
import { ExpiryHeatMap } from '../../components/pharmacy/ExpiryHeatMap';
import { cn } from '../../lib/utils';

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
    const [loadingTransactions] = useState(false);
    const [, setAlerts] = useState<Alert[]>([]);
    const [, setTopMedicines] = useState<{ name: string; value: number }[]>([]);
    const [medicinesSortOrder] = useState<'ASC' | 'DESC'>('DESC');

    const [inventoryStatus, setInventoryStatus] = useState<{ by_category: InventoryData[] } | null>(
        null,
    );
    const [consumptionTrends, setConsumptionTrends] = useState<{
        daily_trends: TrendData[];
    } | null>(null);
    const [expiryRisk, setExpiryRisk] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoadingStats(true);
            try {
                const results = await Promise.allSettled([
                    pharmacyService.getDashboardStats(),
                    pharmacyService.getTopSellingMedicines(medicinesSortOrder),
                    pharmacyService.getInventoryStatus(),
                    pharmacyService.getConsumptionTrends(30),
                    pharmacyService.getExpiryRisk(90),
                    pharmacyService.getAlerts({ status: 'active' }),
                    pharmacyService.getRecentSales(),
                ]);

                if (mounted) {
                    if (results[0].status === 'fulfilled') setStats(results[0].value);
                    if (results[1].status === 'fulfilled') setTopMedicines(results[1].value);
                    if (results[2].status === 'fulfilled') setInventoryStatus(results[2].value);
                    if (results[3].status === 'fulfilled') setConsumptionTrends(results[3].value);
                    if (results[4].status === 'fulfilled') setExpiryRisk(results[4].value);
                    if (results[5].status === 'fulfilled') setAlerts(results[5].value?.data ?? []);
                    if (results[6].status === 'fulfilled')
                        setTransactions(Array.isArray(results[6].value) ? results[6].value : []);

                    // Log errors for debugging
                    results.forEach((res, i) => {
                        if (res.status === 'rejected') {
                            console.error(`Dashboard fetch error [${i}]:`, res.reason);
                        }
                    });
                }
            } catch (error) {
                console.error('Unexpected dashboard error:', error);
            } finally {
                if (mounted) setLoadingStats(false);
            }
        };
        load();

        return () => {
            mounted = false;
        };
    }, [facilityId, medicinesSortOrder]);

    const medicinesInStock = stats?.medicinesInStock ?? '0';
    const lowStockWarning = stats?.lowStockWarning ?? 0;
    const expiringSoon = stats?.expiringSoon ?? 0;
    const dailySalesVal = Number(stats?.dailySales);
    const dailySales = !isNaN(dailySalesVal) ? `RWF ${dailySalesVal.toLocaleString()}` : 'RWF 0';

    const totalSalesAllTimeVal = stats?.totalSalesAllTime ?? 0;
    const totalSalesAllTime = `RWF ${totalSalesAllTimeVal.toLocaleString()}`;

    const scopeLabel =
        facilityId == null && facilities.length > 0
            ? 'All facilities'
            : facilityId != null
              ? (facilities.find((f) => f.id === facilityId)?.name ?? `Facility #${facilityId}`)
              : `Facility #${user?.facility_id ?? '—'}`;

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
                            Pharmacy{' '}
                            <span className="text-healthcare-primary">Analytics Command</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2 mt-0.5 text-xs uppercase tracking-wider">
                            <span className="flex h-2 w-2 rounded-full bg-healthcare-accent animate-pulse"></span>
                            Live Compliance & Inventory • {scopeLabel}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => navigate({ to: '/app/procurement' })}
                            className="flex items-center gap-2 px-4 py-2 bg-healthcare-primary text-white rounded-lg text-sm font-black hover:bg-teal-700 transition-all shadow-md shadow-teal-500/10"
                        >
                            <FilePlus size={14} /> New Order
                        </button>
                        <button
                            onClick={() => navigate({ to: '/app/inventory' })}
                            className="flex items-center gap-2 px-4 py-2 bg-healthcare-dark text-white rounded-lg text-sm font-black hover:opacity-90 transition-all shadow-md shadow-slate-900/10"
                        >
                            <ArrowRightLeft size={14} /> Transfer
                        </button>
                        <button
                            onClick={async () => {
                                await pharmacyService.recalculateConsumption();
                                window.location.reload();
                            }}
                            className="p-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-healthcare-primary transition-all shadow-sm"
                            title="Recalculate AI Demand"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </div>

                <AdvancedKPICards />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <StatCard
                        title="Medicines in Stock"
                        value={
                            loadingStats
                                ? '—'
                                : medicinesInStock.toLocaleString?.() || medicinesInStock
                        }
                        color="bg-healthcare-primary"
                        icon={<Package size={18} />}
                        onClick={() => navigate({ to: '/app/inventory' })}
                    />
                    <StatCard
                        title="Low Stock Warning"
                        value={loadingStats ? '—' : String(lowStockWarning)}
                        color="bg-amber-500"
                        icon={<AlertTriangle size={18} />}
                        onClick={() => navigate({ to: '/app/alerts' })}
                    />
                    <StatCard
                        title="Expiring Soon"
                        value={loadingStats ? '—' : String(expiringSoon)}
                        color="bg-red-500"
                        icon={<Clock size={18} />}
                        onClick={() => navigate({ to: '/app/alerts' })}
                    />
                    <StatCard
                        title="Total Daily Sales"
                        value={loadingStats ? '—' : dailySales}
                        color="bg-healthcare-secondary"
                        icon={<TrendingUp size={18} />}
                        onClick={() => navigate({ to: '/app/analytics' })}
                    />
                    <StatCard
                        title="Total All-Time Sales"
                        value={loadingStats ? '—' : totalSalesAllTime}
                        color="bg-blue-600"
                        icon={<TrendingUp size={18} />}
                        onClick={() => navigate({ to: '/app/analytics' })}
                    />
                    <StatCard
                        title="Total Inventory Value"
                        value={
                            loadingStats
                                ? '—'
                                : `RWF ${stats?.totalInventoryValue?.toLocaleString() || '0'}`
                        }
                        color="bg-emerald-600"
                        icon={<ShieldCheck size={18} />}
                        onClick={() => navigate({ to: '/app/inventory' })}
                    />
                </div>

                {/* Operational Intelligence Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ABCAnalysisVisual />
                    <FEFOComplianceVisual />
                    <DemandPlanningPanel />
                    <SupplierMetrics />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass-card p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-base font-black text-healthcare-dark flex items-center gap-2">
                                <Package size={18} className="text-healthcare-primary" />
                                Inventory Status
                            </h3>
                        </div>
                        {inventoryStatus ? (
                            <div className="h-[300px]">
                                <InventoryStatusChart data={inventoryStatus.by_category} />
                            </div>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-slate-400">
                                Loading Inventory...
                            </div>
                        )}
                    </div>

                    <div className="glass-card p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-base font-black text-healthcare-dark flex items-center gap-2">
                                <TrendingUp size={18} className="text-healthcare-primary" />
                                Consumption Trends
                            </h3>
                        </div>
                        {consumptionTrends?.daily_trends &&
                        consumptionTrends.daily_trends.length > 0 ? (
                            <div className="h-[300px]">
                                <ConsumptionTrendChart data={consumptionTrends.daily_trends} />
                            </div>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-slate-400">
                                Loading Trends...
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <CriticalMedicinesPanel />
                    <div className="glass-card p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-base font-black text-healthcare-dark flex items-center gap-2">
                                <AlertTriangle size={18} className="text-red-500" />
                                Expiry Risk Analysis
                            </h3>
                        </div>
                        {expiryRisk ? (
                            <div className="h-[300px]">
                                <ExpiryRiskChart data={expiryRisk} />
                            </div>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-slate-400">
                                Loading Risk Data...
                            </div>
                        )}
                    </div>
                </div>

                <ExpiryHeatMap />

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
            </div>
        </ProtectedRoute>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: string;
    isPositive?: boolean;
    color: string;
    icon: React.ReactNode;
    onClick?: () => void;
    subtitle?: string;
}

function StatCard({ title, value, color, icon, onClick, subtitle }: StatCardProps) {
    return (
        <div
            onClick={onClick}
            className="glass-card p-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group transition-all duration-300 shadow-sm relative overflow-hidden cursor-pointer border-2 hover:border-healthcare-primary/30 hover:scale-[1.02]"
        >
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div
                        className={cn(
                            'w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md transition-all duration-300 group:scale-110',
                            color,
                        )}
                    >
                        {icon}
                    </div>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mb-1.5 truncate">
                    {title}
                </h3>
                <p className="text-lg font-black text-healthcare-dark leading-none tracking-tight">
                    {value}
                </p>
                {subtitle && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight mt-1.5 line-clamp-1">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}

interface TableRowProps {
    id: string;
    name: string;
    category: string;
    qty: string;
    status: 'Completed' | 'In Process' | 'Restocked' | string;
    date: string;
    sku: string;
    isStockIn?: boolean;
    isPending?: boolean;
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
}: TableRowProps) {
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

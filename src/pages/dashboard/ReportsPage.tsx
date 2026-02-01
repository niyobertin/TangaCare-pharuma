import { useEffect, useMemo, useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar, Download, FileText } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { TableSkeleton } from '../../components/shared/Skeleton';
import { pharmacyService } from '../../services/pharmacy.service';
import { useAuth } from '../../context/AuthContext';

export function ReportsPage() {
    const [activeTab, setActiveTab] = useState<'sales' | 'stock'>('sales');
    const { user, facilityId } = useAuth();
    const effectiveFacilityId = facilityId ?? user?.facility_id;

    return (
        <ProtectedRoute
            allowedRoles={[
                'ADMIN',
                'SUPER_ADMIN',
                'SUPER ADMIN',
                'FACILITY_ADMIN',
                'FACILITY ADMIN',
                'OWNER',
                'STORE_MANAGER',
                'STORE MANAGER',
                'AUDITOR',
            ]}
            requireFacility
        >
            <div className="p-6 space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-healthcare-dark">
                            Reports & Analytics
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Detailed insights into pharmacy performance
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Link
                            to="/app/stock-register"
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <FileText size={16} /> Stock Register
                        </Link>
                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            <Calendar size={16} /> Last 30 Days
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-healthcare-primary text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors shadow-md">
                            <Download size={16} /> Export Report
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
                    <button
                        onClick={() => setActiveTab('sales')}
                        className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors border-b-2 ${
                            activeTab === 'sales'
                                ? 'border-healthcare-primary text-healthcare-primary bg-slate-50 dark:bg-slate-800/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                        }`}
                    >
                        Sales & Dispensing
                    </button>
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors border-b-2 ${
                            activeTab === 'stock'
                                ? 'border-healthcare-primary text-healthcare-primary bg-slate-50 dark:bg-slate-800/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                        }`}
                    >
                        Stock & Inventory
                    </button>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[400px]">
                    {activeTab === 'sales' ? (
                        <SalesReports facilityId={effectiveFacilityId} />
                    ) : (
                        <StockReports facilityId={effectiveFacilityId} />
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}

function SalesReports({ facilityId }: { facilityId?: number }) {
    const [loading, setLoading] = useState(false);
    const [sales, setSales] = useState<any | null>(null);
    const [profit, setProfit] = useState<any | null>(null);

    useEffect(() => {
        if (!facilityId) return;
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const [salesData, profitData] = await Promise.all([
                    pharmacyService.getSalesReport(facilityId),
                    pharmacyService.getProfitReport(facilityId),
                ]);
                if (mounted) {
                    setSales(salesData);
                    setProfit(profitData);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [facilityId]);

    const totals = useMemo(() => {
        const totalSales = Number(sales?.total_sales || 0);
        const totalQty = Number(sales?.total_quantity || 0);
        const days = Array.isArray(sales?.daily_sales) ? sales.daily_sales.length : 0;
        const totalProfit = Number(profit?.profit || 0);
        return { totalSales, totalQty, days, totalProfit };
    }, [sales, profit]);

    return (
        <div className="space-y-6">
            {loading ? (
                <TableSkeleton rows={3} columns={1} />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SummaryCard
                            title="Total Sales (30d)"
                            value={`RWF ${totals.totalSales.toLocaleString()}`}
                            trend="0%"
                            icon={<TrendingUp size={20} />}
                        />
                        <SummaryCard
                            title="Units Sold (30d)"
                            value={totals.totalQty.toLocaleString()}
                            trend="0%"
                            icon={<BarChart3 size={20} />}
                        />
                        <SummaryCard
                            title="Profit (30d)"
                            value={`RWF ${totals.totalProfit.toLocaleString()}`}
                            trend="—"
                            icon={<PieChart size={20} />}
                        />
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-slate-500 text-sm font-medium">
                        {Array.isArray(sales?.daily_sales) && sales.daily_sales.length > 0 ? (
                            <div className="space-y-2">
                                <div className="text-xs font-bold uppercase text-slate-400">
                                    Daily Sales (latest 10)
                                </div>
                                <div className="space-y-1">
                                    {sales.daily_sales
                                        .slice(-10)
                                        .reverse()
                                        .map((d: any) => (
                                            <div
                                                key={d.date}
                                                className="flex justify-between text-xs"
                                            >
                                                <span className="font-bold">{d.date}</span>
                                                <span>
                                                    RWF {Number(d.sales || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">No sales data yet for this facility.</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function StockReports({ facilityId }: { facilityId?: number }) {
    const [loading, setLoading] = useState(false);
    const [stock, setStock] = useState<any | null>(null);
    const [deadStock, setDeadStock] = useState<any | null>(null);

    useEffect(() => {
        if (!facilityId) return;
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const [stockData, deadStockData] = await Promise.all([
                    pharmacyService.getStockReport(facilityId),
                    pharmacyService.getDeadStockReport(facilityId, { days: 90 }),
                ]);
                if (mounted) {
                    setStock(stockData);
                    setDeadStock(deadStockData);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [facilityId]);

    return (
        <div className="space-y-6">
            {loading ? (
                <TableSkeleton rows={3} columns={1} />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SummaryCard
                            title="Total Stock Value"
                            value={`RWF ${Number(stock?.total_value || 0).toLocaleString()}`}
                            trend="0%"
                            icon={<TrendingUp size={20} />}
                        />
                        <SummaryCard
                            title="Low Stock Items"
                            value={String(stock?.low_stock_count ?? 0)}
                            trend="Warning"
                            icon={<BarChart3 size={20} />}
                            color="amber"
                        />
                        <SummaryCard
                            title="Expiring Soon"
                            value={String(stock?.expiring_batches_count ?? 0)}
                            trend="Critical"
                            icon={<PieChart size={20} />}
                            color="rose"
                        />
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 text-center text-slate-500 text-sm font-medium">
                        {stock ? (
                            <div className="space-y-1">
                                <div>Inventory summary loaded from API.</div>
                                <div className="text-xs font-bold text-slate-400">
                                    Dead stock (90d):{' '}
                                    {Array.isArray(deadStock?.items) ? deadStock.items.length : 0}{' '}
                                    medicines
                                </div>
                            </div>
                        ) : (
                            'No stock report data yet for this facility.'
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function SummaryCard({ title, value, trend, icon, color = 'teal' }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                    color === 'teal'
                        ? 'bg-teal-50 text-teal-600'
                        : color === 'amber'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-rose-50 text-rose-600'
                }`}
            >
                {icon}
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-black text-healthcare-dark mt-1">{value}</h3>
            <p
                className={`text-xs font-bold mt-2 ${trend.includes('+') ? 'text-emerald-500' : trend.includes('-') ? 'text-rose-500' : 'text-amber-500'}`}
            >
                {trend} <span className="text-slate-400 font-normal">vs last month</span>
            </p>
        </div>
    );
}

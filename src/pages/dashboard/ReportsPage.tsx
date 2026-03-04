import { useEffect, useState } from 'react';
import {
    TrendingUp,
    Calendar,
    Download,
    Activity,
    AlertTriangle,
    Package,
    DollarSign,
    RotateCcw,
} from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { SkeletonTable } from '../../components/ui/SkeletonTable';
import { pharmacyService } from '../../services/pharmacy.service';
import { useAuth } from '../../context/AuthContext';
import { PerformanceChart } from '../../components/pharmacy/PerformanceChart';
import { TaxSummaryTable } from '../../components/pharmacy/TaxSummaryTable';
import { format, subDays } from 'date-fns';
import { cn } from '../../lib/utils';

import { ReorderSuggestions } from '../../components/pharmacy/reports/ReorderSuggestions';
import { DeadStockReport } from '../../components/pharmacy/reports/DeadStockReport';
import { ExpiryReport } from '../../components/pharmacy/reports/ExpiryReport';
import { DashboardOwner } from '../../components/dashboard/DashboardOwner';
import { CreateReturnModal } from '../../components/pharmacy/returns/CreateReturnModal';
import { ABCAnalysisReport } from '../../components/pharmacy/reports/ABCAnalysisReport';
import { PurchaseReport } from '../../components/pharmacy/reports/PurchaseReport';
import { AuditLogsPage } from './AuditLogsPage';
import { StockMovementsPage } from './StockMovementsPage';

export interface ReportsPageProps {
    defaultTab?: string;
}

export function ReportsPage({ defaultTab = 'sales' }: ReportsPageProps) {
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const { user, facilityId } = useAuth();
    const effectiveFacilityId = facilityId ?? user?.facility_id;

    // H-9: 5 top-level tabs; activeTab overrides defaultTab from the router
    const [activeTab, setActiveTab] = useState<string>(
        defaultTab === 'profit' ? 'sales' : defaultTab,
    );

    // Map the 5 tabs → the existing sub-section keys
    const TABS = [
        {
            key: 'sales',
            label: 'Sales',
            emoji: '📊',
            subtabs: ['sales'],
        },
        {
            key: 'inventory',
            label: 'Inventory',
            emoji: '📦',
            subtabs: ['stock', 'low-stock', 'reorder', 'expiry', 'recall', 'stock-movement', 'movement'],
        },
        {
            key: 'compliance',
            label: 'Compliance',
            emoji: '💊',
            subtabs: ['kpis'],
        },
        {
            key: 'procurement',
            label: 'Procurement',
            emoji: '🏪',
            subtabs: ['purchase', 'procurement'],
        },
        {
            key: 'performance',
            label: 'Performance',
            emoji: '👥',
            subtabs: ['staff', 'performance', 'customer', 'loyalty', 'tax'],
        },
        {
            key: 'audit-logs',
            label: 'Audit Logs',
            emoji: '🛡️',
            subtabs: ['audit-logs'],
        },
        {
            key: 'stock-movements-history',
            label: 'Movements History',
            emoji: '🔄',
            subtabs: ['stock-movements-history'],
        },
    ] as const;

    // Determine which sub-report to load for the active tab
    function defaultSubtabFor(tab: string): string {
        if (tab === 'inventory') return 'stock';
        if (tab === 'compliance') return 'kpis';
        if (tab === 'procurement') return 'purchase';
        if (tab === 'performance') return 'performance';
        if (tab === 'audit-logs') return 'audit-logs';
        if (tab === 'stock-movements-history') return 'stock-movements-history';
        return 'sales'; // 'sales' tab
    }

    // resolvedTab = the specific sub-section key used by the existing render logic below
    const resolvedTab = TABS.some((t) => t.key === activeTab)
        ? defaultSubtabFor(activeTab)
        : activeTab === 'profit'
            ? 'sales'
            : activeTab;

    const [days, setDays] = useState(30);

    const handleExport = async (format: 'excel' | 'pdf') => {
        let type = resolvedTab;
        if (type === 'reorder') type = 'low-stock';
        if (type === 'recall' || type === 'expiry') type = 'expiry';
        if (type === 'movement') type = 'stock-movement';

        const params: any = { facilityId: effectiveFacilityId };
        if (['sales', 'tax', 'performance', 'staff', 'purchase'].includes(type)) {
            params.start_date = startDate;
            params.end_date = endDate;
        }
        if (type === 'expiry') params.days = days;

        try {
            await pharmacyService.downloadReport(type, format, params);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

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
            <div className="p-6 space-y-6 animate-in fade-in duration-500">
                {/* ── H-9 Tab Bar ───────────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h1 className="text-2xl font-black text-healthcare-dark dark:text-white uppercase tracking-tight">
                        Reports
                    </h1>
                    {/* Export buttons stay at the top right */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleExport('excel')}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20"
                        >
                            <Download size={14} /> Excel
                        </button>
                        <button
                            onClick={() => handleExport('pdf')}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-md shadow-rose-500/20"
                        >
                            <Download size={14} /> PDF
                        </button>
                    </div>
                </div>

                {/* Tab pills */}
                <div className="flex gap-2 flex-wrap border-b border-slate-200 dark:border-slate-700 pb-2">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
                                activeTab === tab.key
                                    ? 'bg-healthcare-primary text-white shadow-md shadow-healthcare-primary/30'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700',
                            )}
                        >
                            <span>{tab.emoji}</span> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Date / day pickers (conditionally shown) */}
                {(resolvedTab === 'expiry' || resolvedTab === 'recall') && (
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 shadow-sm w-fit">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Days:</span>
                        <select
                            value={days}
                            onChange={(e) => setDays(Number(e.target.value))}
                            className="bg-transparent text-sm font-bold text-slate-600 dark:text-slate-300 outline-none"
                        >
                            <option value={30}>30 Days</option>
                            <option value={60}>60 Days</option>
                            <option value={90}>90 Days</option>
                        </select>
                    </div>
                )}
                {['sales', 'tax', 'performance', 'staff', 'purchase'].includes(resolvedTab) && (
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 shadow-sm w-fit">
                        <Calendar size={14} className="text-slate-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-sm font-bold text-slate-600 dark:text-slate-300 outline-none"
                        />
                        <span className="text-slate-300 px-1">—</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-sm font-bold text-slate-600 dark:text-slate-300 outline-none"
                        />
                    </div>
                )}

                <div className="glass-card p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[400px]">
                    {defaultTab === 'kpis' && <DashboardOwner facilityId={effectiveFacilityId!} />}
                    {resolvedTab === 'sales' && (
                        <SalesReports
                            facilityId={effectiveFacilityId}
                            startDate={startDate}
                            endDate={endDate}
                        />
                    )}
                    {resolvedTab === 'stock' && <StockReports facilityId={effectiveFacilityId} />}
                    {(resolvedTab === 'low-stock' || resolvedTab === 'reorder') && (
                        <div className="w-full">
                            <ReorderSuggestions />
                        </div>
                    )}
                    {(resolvedTab === 'expiry' || resolvedTab === 'recall') && (
                        <ExpiryReport facilityId={effectiveFacilityId} />
                    )}
                    {(resolvedTab === 'stock-movement' || resolvedTab === 'movement') && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-healthcare-dark dark:text-white mb-6 uppercase">
                                Dead Stock Analysis
                            </h2>
                            <DeadStockReport />
                        </div>
                    )}
                    {resolvedTab === 'tax' && (
                        <TaxReports
                            facilityId={effectiveFacilityId}
                            startDate={startDate}
                            endDate={endDate}
                        />
                    )}
                    {(resolvedTab === 'customer' || resolvedTab === 'loyalty') && (
                        <LoyaltyReports facilityId={effectiveFacilityId} />
                    )}
                    {(resolvedTab === 'purchase' || resolvedTab === 'procurement') && (
                        <PurchaseReport
                            facilityId={effectiveFacilityId}
                            startDate={startDate}
                            endDate={endDate}
                        />
                    )}
                    {(resolvedTab === 'staff' || resolvedTab === 'performance') && (
                        <PerformanceReports
                            facilityId={effectiveFacilityId}
                            startDate={startDate}
                            endDate={endDate}
                        />
                    )}
                    {resolvedTab === 'audit-logs' && (
                        <div className="-mx-6 -my-6">
                            <AuditLogsPage />
                        </div>
                    )}
                    {resolvedTab === 'stock-movements-history' && (
                        <div className="-mx-6 -my-6">
                            <StockMovementsPage />
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}

// Reuse other existing functions but with simplified styles if needed
// ... (omitting full re-write of PerformanceReports, LoyaltyReports, TaxReports, etc. to save space,
//      but they will be included in the final file)

function PerformanceReports({
    facilityId,
    startDate,
    endDate,
}: {
    facilityId?: number;
    startDate: string;
    endDate: string;
}) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any | null>(null);

    useEffect(() => {
        if (!facilityId) return;
        const load = async () => {
            setLoading(true);
            try {
                const res = await pharmacyService.getEmployeePerformanceReport(facilityId, {
                    start_date: startDate,
                    end_date: endDate,
                });
                setData(res);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [facilityId, startDate, endDate]);

    if (loading)
        return <SkeletonTable rows={5} columns={1} headers={null} className="border-none shadow-none" />;

    return (
        <div className="space-y-6">
            <PerformanceChart data={data?.performers || []} />

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-healthcare-dark dark:text-white uppercase text-xs tracking-widest">
                        Staff Efficiency
                    </h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                                <th className="px-6 py-3 font-semibold">Staff Member</th>
                                <th className="px-6 py-3 font-semibold text-right">Transactions</th>
                                <th className="px-6 py-3 font-semibold text-right">Total Sales</th>
                                <th className="px-6 py-3 font-semibold text-right">
                                    Avg Bill Value
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {data?.performers?.map((p: any) => (
                                <tr key={p.employee_id}>
                                    <td className="px-6 py-4 font-black text-healthcare-dark dark:text-white">
                                        {p.employee_name}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500">
                                        {p.transaction_count}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500 font-bold">
                                        RWF {p.total_sales.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-healthcare-primary">
                                        RWF {p.average_transaction_value.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function LoyaltyReports({ facilityId }: { facilityId?: number }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any | null>(null);

    useEffect(() => {
        if (!facilityId) return;
        const load = async () => {
            setLoading(true);
            try {
                const res = await pharmacyService.getCustomerLoyaltyReport(facilityId);
                setData(res);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [facilityId]);

    if (loading)
        return <SkeletonTable rows={5} columns={1} headers={null} className="border-none shadow-none" />;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-healthcare-primary/5 rounded-2xl border border-healthcare-primary/10">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
                        Total Unique Patients
                    </p>
                    <p className="text-4xl font-black text-healthcare-primary">
                        {data?.total_patients || 0}
                    </p>
                </div>
                <div className="p-6 bg-teal-500/5 rounded-2xl border border-teal-500/10">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
                        Repeat Customers
                    </p>
                    <p className="text-4xl font-black text-teal-600">
                        {data?.repeat_customers || 0}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                        ({((data?.repeat_customers / data?.total_patients) * 100 || 0).toFixed(1)}%
                        loyalty rate)
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-healthcare-dark dark:text-white uppercase text-xs tracking-widest">
                        Top Patients
                    </h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                                <th className="px-6 py-3 font-semibold">Patient</th>
                                <th className="px-6 py-3 font-semibold text-right">Visits</th>
                                <th className="px-6 py-3 font-semibold text-right">Total Spent</th>
                                <th className="px-6 py-3 font-semibold text-right">Last Visit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {data?.top_patients?.map((p: any) => (
                                <tr key={p.patient_id}>
                                    <td className="px-6 py-4 font-black text-healthcare-dark dark:text-white whitespace-nowrap">
                                        {p.patient_name}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500">
                                        {p.visit_count}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-healthcare-primary">
                                        RWF {p.total_spent.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-400 text-[10px]">
                                        {new Date(p.last_visit).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function TaxReports({
    facilityId,
    startDate,
    endDate,
}: {
    facilityId?: number;
    startDate: string;
    endDate: string;
}) {
    const [loading, setLoading] = useState(false);
    const [taxData, setTaxData] = useState<any | null>(null);

    useEffect(() => {
        if (!facilityId) return;
        const load = async () => {
            setLoading(true);
            try {
                const tax = await pharmacyService.getTaxSummary(facilityId, {
                    start_date: startDate,
                    end_date: endDate,
                });
                setTaxData(tax);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [facilityId, startDate, endDate]);

    if (loading)
        return <SkeletonTable rows={5} columns={1} headers={null} className="border-none shadow-none" />;

    return (
        <div className="space-y-8">
            <TaxSummaryTable
                data={taxData?.tax_details || []}
                totalTaxable={taxData?.total_taxable_amount || 0}
                totalVat={taxData?.total_vat_amount || 0}
            />
            {/* Regulatory register could go here */}
        </div>
    );
}

function SalesReports({
    facilityId,
    startDate,
    endDate,
}: {
    facilityId?: number;
    startDate?: string;
    endDate?: string;
}) {
    const [loading, setLoading] = useState(false);
    const [sales, setSales] = useState<any | null>(null);
    const [profit, setProfit] = useState<any | null>(null);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<any>(null);

    useEffect(() => {
        if (!facilityId) return;
        const load = async () => {
            setLoading(true);
            try {
                const [salesResult, profitResult] = await Promise.allSettled([
                    pharmacyService.getSalesReport(facilityId, {
                        start_date: startDate,
                        end_date: endDate,
                    }),
                    pharmacyService.getProfitReport(facilityId, {
                        start_date: startDate,
                        end_date: endDate,
                    }),
                ]);

                if (salesResult.status === 'fulfilled') {
                    setSales(salesResult.value);
                } else {
                    throw salesResult.reason;
                }

                if (profitResult.status === 'fulfilled') {
                    setProfit(profitResult.value);
                } else {
                    setProfit(null);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [facilityId, startDate, endDate]);

    if (loading)
        return (
            <SkeletonTable
                rows={5}
                columns={6}
                headers={['Date', 'Receipt #', 'Medicine', 'Qty', 'Total']}
                columnAligns={['left', 'left', 'left', 'right', 'right', 'right']}
                actions
                className="border-none shadow-none"
            />
        );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    title="Gross profit"
                    value={`RWF ${Number(profit?.profit || 0).toLocaleString()}`}
                    trend="—"
                    icon={<TrendingUp size={20} />}
                />
                <SummaryCard
                    title="Profit Margin"
                    value={`${(Number(profit?.profit_margin || 0) * 100).toFixed(1)}%`}
                    trend="—"
                    icon={<Activity size={20} />}
                />
                <SummaryCard
                    title="Total Revenue"
                    value={`RWF ${Number(profit?.revenue || 0).toLocaleString()}`}
                    trend="—"
                    icon={<DollarSign size={20} />}
                />
            </div>
            <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                            <th className="px-6 py-3 font-semibold">Date</th>
                            <th className="px-6 py-3 font-semibold">Receipt #</th>
                            <th className="px-6 py-3 font-semibold">Medicine</th>
                            <th className="px-6 py-3 font-semibold text-right">Qty</th>
                            <th className="px-6 py-3 font-semibold text-right">Total</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {(() => {
                            const grouped = sales?.transactions?.reduce((acc: any, t: any) => {
                                if (!acc[t.transaction_number]) {
                                    acc[t.transaction_number] = {
                                        ...t,
                                        medicines: [t.medicine_name],
                                        total: t.total_amount,
                                        items: [t],
                                    };
                                } else {
                                    acc[t.transaction_number].medicines.push(t.medicine_name);
                                    acc[t.transaction_number].total += t.total_amount;
                                    acc[t.transaction_number].items.push(t);
                                }
                                return acc;
                            }, {});

                            return Object.values(grouped || {}).map((t: any) => (
                                <tr key={t.transaction_number} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                        {new Date(t.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-black text-healthcare-primary text-xs tracking-tighter uppercase">
                                        {t.transaction_number}
                                    </td>
                                    <td className="px-6 py-4 font-black text-healthcare-dark dark:text-white">
                                        <div className="flex flex-col">
                                            <span>{t.medicines[0]}</span>
                                            {t.medicines.length > 1 && (
                                                <span className="text-[10px] text-slate-400">
                                                    + {t.medicines.length - 1} more items
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500">
                                        {t.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-healthcare-primary">
                                        RWF {t.total.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={async () => {
                                                    if (facilityId) {
                                                        await pharmacyService.getSaleReceipt(t.sale_id, facilityId);
                                                    }
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase hover:bg-blue-100 transition-colors border border-blue-100"
                                            >
                                                <Download size={12} /> Receipt
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const details = await pharmacyService.getSale(
                                                        t.sale_id,
                                                    );
                                                    setSelectedSale(details);
                                                    setIsReturnModalOpen(true);
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase hover:bg-rose-100 transition-colors border border-rose-100"
                                            >
                                                <RotateCcw size={12} /> Return
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ));
                        })()}
                    </tbody>
                </table>
            </div>
            {isReturnModalOpen && selectedSale && (
                <CreateReturnModal
                    sale={selectedSale}
                    onClose={() => setIsReturnModalOpen(false)}
                    onSuccess={() => {
                        /* refresh */
                    }}
                />
            )}
        </div>
    );
}

function StockReports({ facilityId }: { facilityId?: number }) {
    const [loading, setLoading] = useState(false);
    const [stock, setStock] = useState<any | null>(null);

    useEffect(() => {
        if (!facilityId) return;
        const load = async () => {
            setLoading(true);
            try {
                const data = await pharmacyService.getStockReport(facilityId);
                setStock(data);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [facilityId]);

    if (loading)
        return <SkeletonTable rows={3} columns={3} headers={null} className="border-none shadow-none" />;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-center min-h-[70px]">
                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign size={32} className="text-teal-600" />
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-0.5">
                                Total Valuation
                            </p>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tighter">
                                RWF {Number(stock?.total_value || 0).toLocaleString()}
                            </h3>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div className="relative z-10 mt-0.5">
                        <p className="text-[9px] font-bold text-teal-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                            Active valuation
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-center min-h-[70px]">
                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Package size={32} className="text-blue-600" />
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-0.5">
                                SKU Count
                            </p>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tighter">
                                {stock?.total_medicines || 0}
                            </h3>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Package size={16} />
                        </div>
                    </div>
                    <div className="relative z-10 mt-0.5">
                        <p className="text-[9px] font-bold text-blue-600">Unique medicines</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-center min-h-[70px]">
                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertTriangle size={32} className="text-amber-600" />
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-0.5">
                                Stock Alerts
                            </p>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tighter">
                                {Number(stock?.low_stock_count || 0) +
                                    Number(stock?.expiring_batches_count || 0)}
                            </h3>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <AlertTriangle size={16} />
                        </div>
                    </div>
                    <div className="relative z-10 mt-0.5 flex gap-2">
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100">
                            {stock?.low_stock_count || 0} Low
                        </span>
                        <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-100">
                            {stock?.expiring_batches_count || 0} Exp
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                            Stock Analysis
                        </h3>
                        <p className="text-slate-500 text-sm font-medium">
                            ABC Classification based on consumption value
                        </p>
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors">
                        View Full Report
                    </button>
                </div>
                <ABCAnalysisReport />
            </div>
        </div>
    );
}

function SummaryCard({ title, value, trend, icon, color = 'teal' }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm group hover:shadow-lg transition-all min-h-[90px] flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
                <div
                    className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110',
                        color === 'teal'
                            ? 'bg-teal-50 text-teal-600'
                            : color === 'amber'
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-rose-50 text-rose-600',
                    )}
                >
                    {icon}
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">{trend}</p>
            </div>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest leading-none">
                {title}
            </p>
            <h3 className="text-lg font-black text-healthcare-dark dark:text-white mt-1.5 tracking-tighter leading-none">
                {value}
            </h3>
        </div>
    );
}

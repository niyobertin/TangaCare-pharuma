import { useEffect, useMemo, useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar, Download, FileText } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { TableSkeleton } from '../../components/shared/Skeleton';
import { pharmacyService } from '../../services/pharmacy.service';
import { useAuth } from '../../context/AuthContext';
import { PerformanceChart } from '../../components/pharmacy/PerformanceChart';
import { TaxSummaryTable } from '../../components/pharmacy/TaxSummaryTable';
import { Users, ShieldCheck, ShoppingBag } from 'lucide-react';
import { format, subDays } from 'date-fns';

import { ReorderSuggestions } from '../../components/pharmacy/reports/ReorderSuggestions';
import { DeadStockReport } from '../../components/pharmacy/reports/DeadStockReport';
import { SupplierPerformanceReport } from '../../components/pharmacy/reports/SupplierPerformanceReport';
import { ABCAnalysisReport } from '../../components/pharmacy/reports/ABCAnalysisReport';

export function ReportsPage() {
    const [activeTab, setActiveTab] = useState('sales');
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
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
                        <h1 className="text-2xl font-black text-healthcare-dark dark:text-white">
                            Reports & Analytics
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Detailed insights into pharmacy performance
                        </p>
                    </div>
                    <div className="flex gap-4 flex-wrap items-center">
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 shadow-sm">
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
                        <Link
                            to="/app/stock-register"
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <FileText size={16} /> Stock Register
                        </Link>
                        <button className="flex items-center gap-2 px-4 py-2 bg-healthcare-primary text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors shadow-md">
                            <Download size={16} /> Export Report
                        </button>
                    </div>
                </div>

                { }
                <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto scroller-none">
                    <TabButton
                        active={activeTab === 'sales'}
                        onClick={() => setActiveTab('sales')}
                        label="Sales & Revenue"
                        icon={<TrendingUp size={16} />}
                    />
                    <TabButton
                        active={activeTab === 'stock'}
                        onClick={() => setActiveTab('stock')}
                        label="Inventory"
                        icon={<ShoppingBag size={16} />}
                    />
                    <TabButton
                        active={activeTab === 'performance'}
                        onClick={() => setActiveTab('performance')}
                        label="Ops & Reorder"
                        icon={<Users size={16} />}
                    />
                    <TabButton
                        active={activeTab === 'procurement'}
                        onClick={() => setActiveTab('procurement')}
                        label="Supplier & Procurement"
                        icon={<ShoppingBag size={16} />}
                    />
                    <TabButton
                        active={activeTab === 'loyalty'}
                        onClick={() => setActiveTab('loyalty')}
                        label="Customers"
                        icon={<Users size={16} />}
                    />
                    <TabButton
                        active={activeTab === 'tax'}
                        onClick={() => setActiveTab('tax')}
                        label="Tax & Compliance"
                        icon={<ShieldCheck size={16} />}
                    />
                    <TabButton
                        active={activeTab === 'recall'}
                        onClick={() => setActiveTab('recall')}
                        label="Batch Recall"
                        icon={<FileText size={16} />}
                    />
                </div>

                <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[400px]">
                    {activeTab === 'sales' && <SalesReports facilityId={effectiveFacilityId} startDate={startDate} endDate={endDate} />}
                    {activeTab === 'stock' && <StockReports facilityId={effectiveFacilityId} />}
                    {activeTab === 'performance' && <PerformanceReports facilityId={effectiveFacilityId} startDate={startDate} endDate={endDate} />}
                    {activeTab === 'procurement' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                <h2 className="text-xl font-black text-healthcare-dark dark:text-white mb-6">
                                    Supplier Performance
                                </h2>
                                <SupplierPerformanceReport />
                            </div>
                        </div>
                    )}
                    {activeTab === 'loyalty' && <LoyaltyReports facilityId={effectiveFacilityId} />}
                    {activeTab === 'tax' && <TaxReports facilityId={effectiveFacilityId} startDate={startDate} endDate={endDate} />}
                    {activeTab === 'recall' && <BatchRecallReports facilityId={effectiveFacilityId} />}
                </div>
            </div>
        </ProtectedRoute>
    );
}

function PerformanceReports({ facilityId, startDate, endDate }: { facilityId?: number, startDate: string, endDate: string }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any | null>(null);

    useEffect(() => {
        if (!facilityId) return;
        const load = async () => {
            setLoading(true);
            try {
                const res = await pharmacyService.getEmployeePerformanceReport(facilityId, { start_date: startDate, end_date: endDate });
                setData(res);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [facilityId, startDate, endDate]);

    if (loading) return <TableSkeleton rows={5} columns={1} />;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 text-center">
                    <h2 className="text-xl font-black text-healthcare-dark dark:text-white mb-6">
                        Reorder Suggestions
                    </h2>
                    <ReorderSuggestions />
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 text-center">
                    <h2 className="text-xl font-black text-healthcare-dark dark:text-white mb-6">
                        Dead Stock Analysis
                    </h2>
                    <DeadStockReport />
                </div>
            </div>

            <PerformanceChart data={data?.performers || []} />

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                    <h4 className="font-bold text-slate-700 dark:text-slate-200">Dispensing Efficiency</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-500">Employee</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">Transactions</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">Total Sales</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">Avg Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {data?.performers?.map((p: any) => (
                                <tr key={p.employee_id}>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{p.employee_name}</td>
                                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">{p.transaction_count}</td>
                                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">RWF {p.total_sales.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-bold text-healthcare-primary">RWF {p.average_transaction_value.toLocaleString()}</td>
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

    if (loading) return <TableSkeleton rows={5} columns={1} />;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-healthcare-primary/5 rounded-2xl border border-healthcare-primary/10">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Unique Patients</p>
                    <p className="text-4xl font-black text-healthcare-primary">{data?.total_patients || 0}</p>
                </div>
                <div className="p-6 bg-teal-500/5 rounded-2xl border border-teal-500/10">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Repeat Customers</p>
                    <p className="text-4xl font-black text-teal-600">{data?.repeat_customers || 0}</p>
                    <p className="text-xs text-slate-400 mt-2">({((data?.repeat_customers / data?.total_patients) * 100 || 0).toFixed(1)}% loyalty rate)</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                    <h4 className="font-bold text-slate-700 dark:text-slate-200">Top Contributing Patients</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-500">Patient</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">Visits</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">Total Spent</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">Last Visit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {data?.top_patients?.map((p: any) => (
                                <tr key={p.patient_id}>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{p.patient_name}</td>
                                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">{p.visit_count}</td>
                                    <td className="px-6 py-4 text-right font-bold text-healthcare-primary">RWF {p.total_spent.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-slate-400 text-xs">{new Date(p.last_visit).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function TaxReports({ facilityId, startDate, endDate }: { facilityId?: number, startDate: string, endDate: string }) {
    const [loading, setLoading] = useState(false);
    const [taxData, setTaxData] = useState<any | null>(null);
    const [returnsData, setReturnsData] = useState<any | null>(null);

    useEffect(() => {
        if (!facilityId) return;
        const load = async () => {
            setLoading(true);
            try {
                const [tax, returns] = await Promise.all([
                    pharmacyService.getTaxSummary(facilityId, { start_date: startDate, end_date: endDate }),
                    pharmacyService.getVendorReturnsReport(facilityId)
                ]);
                setTaxData(tax);
                setReturnsData(returns);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [facilityId, startDate, endDate]);

    if (loading) return <TableSkeleton rows={5} columns={1} />;

    return (
        <div className="space-y-8">
            <TaxSummaryTable
                data={taxData?.tax_details || []}
                totalTaxable={taxData?.total_taxable_amount || 0}
                totalVat={taxData?.total_vat_amount || 0}
            />

            <div className="flex justify-between items-center bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-100 dark:border-teal-800/50">
                <div>
                    <h4 className="text-teal-900 dark:text-teal-100 font-bold flex items-center gap-2">
                        <ShieldCheck size={18} /> Controlled Drug Regulatory Audit
                    </h4>
                    <p className="text-teal-700 dark:text-teal-300 text-sm mt-1">
                        View formal registers with running balances for narcotics and psychotropics.
                    </p>
                </div>
                {/* We'll implement a search/selector in a formal register component below */}
            </div>

            <ControlledDrugRegister facilityId={facilityId} />

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Returns & Adjustments</h3>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Total Returned</p>
                        <p className="text-xl font-black text-rose-600">RWF {Number(returnsData?.total_returned_amount || 0).toLocaleString()}</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-500">Note #</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">Sale #</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">Reason</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">Amount</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {returnsData?.recent_notes?.map((n: any) => (
                                <tr key={n.note_id}>
                                    <td className="px-6 py-4 font-mono text-xs">{n.note_number}</td>
                                    <td className="px-6 py-4 text-slate-500">{n.sale_number}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 italic">"{n.reason}"</td>
                                    <td className="px-6 py-4 text-right font-bold text-rose-600">RWF {n.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-slate-400 text-xs">{new Date(n.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${active
                ? 'border-healthcare-primary text-healthcare-primary bg-healthcare-primary/5 dark:bg-slate-800/50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

function BatchRecallReports({ facilityId }: { facilityId?: number }) {
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<import('../../types/pharmacy').BatchTraceabilityReport | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!search) return;
        setLoading(true);
        try {
            // In a real app, we'd first find the batch ID from the batch number
            // For now, let's assume search is the batch ID for demo or implement a lookup if possible
            // But usually the user searches for a Batch Number.
            // Let's assume we have a search endpoint or we use the ID for now.
            const res = await pharmacyService.getBatchTraceability(Number(search));
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-2xl border border-rose-100 dark:border-rose-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h4 className="text-rose-900 dark:text-rose-100 font-bold flex items-center gap-2">
                        <FileText size={18} /> Drug Recall Traceability
                    </h4>
                    <p className="text-rose-700 dark:text-rose-300 text-sm mt-1">
                        Enter a Batch ID to see all patients who received medication from it.
                    </p>
                </div>
                <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Batch ID (e.g. 5)"
                        className="flex-1 md:w-64 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className="px-6 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700">
                        Trace Batch
                    </button>
                </form>
            </div>

            {loading ? (
                <TableSkeleton rows={5} columns={1} />
            ) : data ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-slate-400 font-bold uppercase">Medicine</p>
                            <p className="font-bold text-slate-900 dark:text-white mt-1">{data.medicine_name}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-slate-400 font-bold uppercase">Batch #</p>
                            <p className="font-bold text-slate-900 dark:text-white mt-1">{data.batch_number}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-slate-400 font-bold uppercase">Expiry</p>
                            <p className="font-bold text-rose-600 mt-1">{new Date(data.expiry_date).toLocaleDateString()}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-slate-400 font-bold uppercase">Total Dispensed</p>
                            <p className="font-black text-rose-600 mt-1">{data.total_dispensed} units</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                            <h4 className="font-bold text-slate-700 dark:text-slate-200">Affected Patients</h4>
                            <button className="text-xs text-healthcare-primary font-bold hover:underline flex items-center gap-1">
                                <Download size={14} /> Export Patient List
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold text-slate-500">Date</th>
                                        <th className="px-6 py-3 font-semibold text-slate-500">Transaction #</th>
                                        <th className="px-6 py-3 font-semibold text-slate-500">Patient Name</th>
                                        <th className="px-6 py-3 font-semibold text-slate-500 text-right">Quantity</th>
                                        <th className="px-6 py-3 font-semibold text-slate-500">Dispensed By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {data.patients?.map((p) => (
                                        <tr key={p.transaction_id}>
                                            <td className="px-6 py-4 text-xs text-slate-400">{new Date(p.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900 dark:text-white">{p.transaction_number}</td>
                                            <td className="px-6 py-4 font-bold text-healthcare-primary">{p.patient_name}</td>
                                            <td className="px-6 py-4 text-right font-black">{p.quantity}</td>
                                            <td className="px-6 py-4 text-slate-500">{p.dispensed_by}</td>
                                        </tr>
                                    ))}
                                    {data.patients?.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No patients found for this batch.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <p className="font-medium">Enter a batch number to start tracing</p>
                </div>
            )}
        </div>
    );
}

function ControlledDrugRegister({ facilityId }: { facilityId?: number }) {
    const [loading, setLoading] = useState(false);
    const [medicineId, setMedicineId] = useState('');
    const [data, setData] = useState<import('../../types/pharmacy').ControlledDrugRegisterReport | null>(null);

    const handleFetch = async () => {
        if (!facilityId || !medicineId) return;
        setLoading(true);
        try {
            const res = await pharmacyService.getControlledDrugRegister(facilityId, Number(medicineId));
            setData(res);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex flex-wrap gap-4 justify-between items-center">
                <h4 className="font-bold text-slate-700 dark:text-slate-200">Controlled Drug Register Record</h4>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Medicine ID (e.g. 10)"
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none w-40"
                        value={medicineId}
                        onChange={(e) => setMedicineId(e.target.value)}
                    />
                    <button
                        onClick={handleFetch}
                        className="px-4 py-1.5 bg-healthcare-primary text-white rounded-lg text-xs font-bold hover:bg-teal-700"
                    >
                        Load Register
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-8">
                        <TableSkeleton rows={3} columns={1} />
                    </div>
                ) : data ? (
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-slate-500">Date/Time</th>
                                <th className="px-4 py-3 font-semibold text-slate-500">Transaction Details</th>
                                <th className="px-4 py-3 font-semibold text-slate-500 text-right">Qty In</th>
                                <th className="px-4 py-3 font-semibold text-slate-500 text-right">Qty Out</th>
                                <th className="px-4 py-3 font-semibold text-slate-500 text-right">Balance</th>
                                <th className="px-4 py-3 font-semibold text-slate-500">Pharmacist/Witness</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {data.movements?.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{format(new Date(m.date), 'dd/MM/yy HH:mm')}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900 dark:text-white uppercase text-[10px]">{m.type}</div>
                                        <div className="text-slate-400 italic text-[10px]">{m.reference}</div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-emerald-600 font-bold">{m.quantity_in || '-'}</td>
                                    <td className="px-4 py-3 text-right text-rose-600 font-bold">{m.quantity_out || '-'}</td>
                                    <td className="px-4 py-3 text-right bg-slate-50/50 dark:bg-slate-800/50 font-black text-slate-900 dark:text-white text-sm">{m.balance}</td>
                                    <td className="px-4 py-3">
                                        <div className="text-slate-600 dark:text-slate-300 font-medium">{m.user_name}</div>
                                        {m.notes && <div className="text-[10px] text-slate-400 truncate w-32">"{m.notes}"</div>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center text-slate-400 italic bg-slate-50/30">
                        Select a controlled medication to view its register.
                    </div>
                )}
            </div>
        </div>
    );
}

function SalesReports({ facilityId, startDate, endDate }: { facilityId?: number, startDate?: string, endDate?: string }) {
    const [loading, setLoading] = useState(false);
    const [sales, setSales] = useState<any | null>(null);
    const [profit, setProfit] = useState<any | null>(null);

    useEffect(() => {
        if (!facilityId) return;
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const params = { start_date: startDate, end_date: endDate };
                const [salesData, profitData] = await Promise.all([
                    pharmacyService.getSalesReport(facilityId, params),
                    pharmacyService.getProfitReport(facilityId, params),
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
    }, [facilityId, startDate, endDate]);

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

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h4 className="font-bold text-slate-700 dark:text-slate-200">Recent Sales Transactions</h4>
                            <span className="text-xs font-medium text-slate-400">Showing last {sales?.transactions?.length || 0} transactions</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold text-slate-500">ID</th>
                                        <th className="px-6 py-3 font-semibold text-slate-500">Date</th>
                                        <th className="px-6 py-3 font-semibold text-slate-500">Receipt #</th>
                                        <th className="px-6 py-3 font-semibold text-slate-500">Medicine</th>
                                        <th className="px-6 py-3 font-semibold text-slate-500">Patient</th>
                                        <th className="px-6 py-3 font-semibold text-slate-500 text-right">Qty</th>
                                        <th className="px-6 py-3 font-semibold text-slate-500 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {sales?.transactions?.length > 0 ? (
                                        sales.transactions.map((t: any) => (
                                            <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 font-mono text-[10px] text-slate-400">
                                                    #{t.id}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                    {new Date(t.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-[10px] text-healthcare-primary font-bold uppercase">
                                                    {t.transaction_number}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-slate-600 dark:text-slate-300 font-medium">{t.medicine_name}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-slate-500 dark:text-slate-400">{t.patient_name}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                                                    {t.quantity}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-healthcare-primary">
                                                    RWF {t.total_amount.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                                No transactions found for the selected period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function StockReports({ facilityId }: { facilityId?: number }) {
    const [loading, setLoading] = useState(false);
    const [stock, setStock] = useState<any | null>(null);
    useEffect(() => {
        if (!facilityId) return;
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const stockData = await pharmacyService.getStockReport(facilityId);
                if (mounted) {
                    setStock(stockData);
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

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                        <h2 className="text-xl font-black text-healthcare-dark dark:text-white mb-6">
                            Inventory Valuation & ABC Analysis
                        </h2>
                        <ABCAnalysisReport />
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
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${color === 'teal'
                    ? 'bg-teal-50 text-teal-600'
                    : color === 'amber'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
            >
                {icon}
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-black text-healthcare-dark dark:text-white mt-1">
                {value}
            </h3>
            <p
                className={`text-xs font-bold mt-2 ${trend.includes('+') ? 'text-emerald-500' : trend.includes('-') ? 'text-rose-500' : 'text-amber-500'}`}
            >
                {trend} <span className="text-slate-400 font-normal">vs last month</span>
            </p>
        </div>
    );
}

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, RefreshCcw, ChevronRight, LayoutDashboard } from 'lucide-react';
import { pharmacyService } from '../../../services/pharmacy.service';
import { TableSkeleton } from '../../shared/Skeleton';
import { SummaryStatCards } from './SummaryStatCards';
import { SalesTrendChart } from './SalesTrendChart';
import { CategoryBarChart } from './CategoryBarChart';
import { PaymentDonutChart } from './PaymentDonutChart';
import { TopMedicinesTable } from './TopMedicinesTable';
import ExpiryRiskChart from './ExpiryRiskChart';
import type { DashboardSummary } from '../../../types/pharmacy';

export const OwnerDashboard = ({ facilityId }: { facilityId: number }) => {
    const {
        data: summary,
        isLoading,
        error,
        refetch,
    } = useQuery<DashboardSummary>({
        queryKey: ['dashboard-summary', facilityId],
        queryFn: () => pharmacyService.getDashboardSummary(facilityId),
    });

    if (isLoading) return <TableSkeleton rows={6} columns={1} />;

    if (error || !summary)
        return (
            <div className="p-12 text-center text-slate-400 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium text-slate-600 dark:text-slate-400">
                    Failed to load owner dashboard. Please try again later.
                </p>
                <button
                    onClick={() => refetch()}
                    className="mt-4 flex items-center gap-2 mx-auto text-healthcare-primary font-bold text-sm bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-healthcare-primary/20 hover:bg-healthcare-primary hover:text-white transition-all"
                >
                    <RefreshCcw size={16} /> Retry Now
                </button>
            </div>
        );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-healthcare-primary/10 text-healthcare-primary rounded-xl">
                        <LayoutDashboard size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Executive Dashboard
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                            Ownership & Financial Health Overview
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <button className="px-4 py-2 text-[10px] font-black uppercase tracking-wider bg-healthcare-primary text-white rounded-lg shadow-sm">
                        Today
                    </button>
                    <button className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-healthcare-primary rounded-lg transition-colors">
                        Last 7 Days
                    </button>
                    <button className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-healthcare-primary rounded-lg transition-colors">
                        This Month
                    </button>
                </div>
            </div>

            {/* Top KPI Row */}
            <SummaryStatCards summary={summary} />

            {/* Main Visualizations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Trend - Wide */}
                <div className="lg:col-span-2">
                    <SalesTrendChart data={summary.sales_trend || []} />
                </div>

                {/* Expiry Risk Bucket */}
                <div className="lg:col-span-1">
                    <ExpiryRiskChart data={summary.expiry_risk} />
                </div>
            </div>

            {/* Bottom Row - Mixed Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Top Medicines Table */}
                <div className="lg:col-span-1">
                    <TopMedicinesTable data={summary.top_medicines} />
                </div>

                {/* Categories Profit Bar Chart */}
                <div className="lg:col-span-2">
                    <CategoryBarChart data={summary.categories} />
                </div>

                {/* Payment Mix Donut */}
                <div className="lg:col-span-1">
                    <PaymentDonutChart data={summary.payments} />
                </div>
            </div>

            {/* Actionable Footer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer hover:bg-emerald-500 transition-colors">
                    <div className="relative z-10">
                        <h4 className="text-lg font-black tracking-tight mb-1">
                            Financial Integrity
                        </h4>
                        <p className="text-xs opacity-70 font-bold mb-4 uppercase tracking-wider">
                            Review P&L Reports
                        </p>
                        <div className="flex items-center gap-2 text-sm font-black">
                            Explore{' '}
                            <ChevronRight
                                size={16}
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                </div>

                <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer hover:bg-indigo-500 transition-colors">
                    <div className="relative z-10">
                        <h4 className="text-lg font-black tracking-tight mb-1">
                            Inventory Optimization
                        </h4>
                        <p className="text-xs opacity-70 font-bold mb-4 uppercase tracking-wider">
                            Dead Stock Analysis
                        </p>
                        <div className="flex items-center gap-2 text-sm font-black">
                            Optimize{' '}
                            <ChevronRight
                                size={16}
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                </div>

                <div className="bg-healthcare-primary rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer hover:bg-teal-500 transition-colors">
                    <div className="relative z-10">
                        <h4 className="text-lg font-black tracking-tight mb-1">Loss Prevention</h4>
                        <p className="text-xs opacity-70 font-bold mb-4 uppercase tracking-wider">
                            Expiry Action Plan
                        </p>
                        <div className="flex items-center gap-2 text-sm font-black">
                            Reduce Risk{' '}
                            <ChevronRight
                                size={16}
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                </div>
            </div>
        </div>
    );
};

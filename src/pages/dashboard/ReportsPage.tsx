import { useState } from 'react';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Calendar,
    Download
} from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { TableSkeleton } from '../../components/shared/Skeleton';
import { pharmacyService } from '../../services/pharmacy.service';

export function ReportsPage() {
    const [activeTab, setActiveTab] = useState<'sales' | 'stock'>('sales');

    return (
        <ProtectedRoute allowedRoles={['admin', 'super_admin', 'facility_admin', 'store_manager', 'auditor']}>
            <div className="p-6 space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-healthcare-dark">Reports & Analytics</h1>
                        <p className="text-slate-500 text-sm mt-1">Detailed insights into pharmacy performance</p>
                    </div>
                    <div className="flex gap-2">
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
                        className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors border-b-2 ${activeTab === 'sales'
                                ? 'border-healthcare-primary text-healthcare-primary bg-slate-50 dark:bg-slate-800/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                            }`}
                    >
                        Sales & Dispensing
                    </button>
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors border-b-2 ${activeTab === 'stock'
                                ? 'border-healthcare-primary text-healthcare-primary bg-slate-50 dark:bg-slate-800/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                            }`}
                    >
                        Stock & Inventory
                    </button>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[400px]">
                    {activeTab === 'sales' ? <SalesReports /> : <StockReports />}
                </div>
            </div>
        </ProtectedRoute>
    );
}

function SalesReports() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Total Sales" value="RWF 2.5M" trend="+12%" icon={<TrendingUp size={20} />} />
                <SummaryCard title="Prescriptions" value="1,234" trend="+5%" icon={<BarChart3 size={20} />} />
                <SummaryCard title="Avg. Transaction" value="RWF 8,500" trend="-2%" icon={<PieChart size={20} />} />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 text-center text-slate-500 text-sm font-medium">
                Sales Chart Visualization Placeholder
            </div>
        </div>
    );
}

function StockReports() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Total Stock Value" value="RWF 45.2M" trend="+0%" icon={<TrendingUp size={20} />} />
                <SummaryCard title="Low Stock Items" value="12" trend="Warning" icon={<BarChart3 size={20} />} color="amber" />
                <SummaryCard title="Expiring Soon" value="5" trend="Critical" icon={<PieChart size={20} />} color="rose" />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 text-center text-slate-500 text-sm font-medium">
                Inventory Distribution Chart Placeholder
            </div>
        </div>
    );
}

function SummaryCard({ title, value, trend, icon, color = "teal" }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${color === 'teal' ? 'bg-teal-50 text-teal-600' :
                    color === 'amber' ? 'bg-amber-50 text-amber-600' :
                        'bg-rose-50 text-rose-600'
                }`}>
                {icon}
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-black text-healthcare-dark mt-1">{value}</h3>
            <p className={`text-xs font-bold mt-2 ${trend.includes('+') ? 'text-emerald-500' : trend.includes('-') ? 'text-rose-500' : 'text-amber-500'}`}>
                {trend} <span className="text-slate-400 font-normal">vs last month</span>
            </p>
        </div>
    );
}

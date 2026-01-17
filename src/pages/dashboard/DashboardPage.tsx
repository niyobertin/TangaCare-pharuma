import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import {
    Package,
    TrendingUp,
    AlertTriangle,
    Clock,
    Zap,
    Stethoscope,
    ShieldCheck,
    Pill,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    MoreVertical,
    Download,
    Filter
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function DashboardPage() {
    return (
        <ProtectedRoute allowedRoles={['Admin', 'Pharmacist', 'Super Admin', 'ADMIN', 'PHARMACIST', 'SUPER_ADMIN']}>
            <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-black text-healthcare-dark tracking-tight">Pharmacy Management</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2 mt-0.5 text-xs uppercase tracking-wider">
                            <span className="flex h-2 w-2 rounded-full bg-healthcare-accent animate-pulse"></span>
                            Live Pharmacy Status • Facility #042
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Medicines in Stock" value="12,842" trend="+12%" isPositive={true} color="bg-healthcare-primary" icon={<Package size={20} />} />
                    <StatCard title="Low Stock Warning" value="14" trend="-3" isPositive={true} color="bg-amber-500" icon={<AlertTriangle size={20} />} />
                    <StatCard title="Expiring Soon" value="38" trend="+8" isPositive={false} color="bg-red-500" icon={<Clock size={20} />} />
                    <StatCard title="Total Daily Sales" value="RWF 842K" trend="+18%" isPositive={true} color="bg-healthcare-secondary" icon={<TrendingUp size={20} />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative overflow-hidden shadow-sm">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-base font-black text-healthcare-dark">Medicine Demand Trend</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Daily dispensing patterns</p>
                                </div>
                            </div>
                            <div className="flex items-end gap-3 min-h-[200px] pt-4 relative z-10 px-2">
                                {[42, 65, 38, 82, 95, 70, 85, 55, 60, 48, 72, 88].map((height, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                                        <div className="w-full relative h-[160px] flex items-end">
                                            <div style={{ height: `${height}%` }} className={cn("w-full rounded-t-md transition-all duration-500 relative shadow-sm", i === 4 ? "bg-healthcare-primary" : "bg-teal-500/20 dark:bg-teal-500/30 group-hover/bar:bg-healthcare-primary/40 dark:group-hover/bar:bg-healthcare-primary/60")}></div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F'][i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SummaryFeature icon={<Stethoscope size={18} className="text-blue-600" />} title="Pharmacy Staff" value="12 Pharmacists Online" description="Currently active in dispensing" color="bg-blue-50 dark:bg-blue-900" />
                            <SummaryFeature icon={<ShieldCheck size={18} className="text-healthcare-accent" />} title="System Compliance" value="99.8% Optimized" description="All regulatory checks passed" color="bg-emerald-50 dark:bg-emerald-900" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="glass-card p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                            <h3 className="font-black text-sm text-healthcare-dark mb-5 flex items-center gap-2"><Zap size={16} className="text-amber-500 fill-amber-500" /> Quick Actions</h3>
                            <div className="space-y-3">
                                <QuickAction icon={<Package size={16} />} title="Inventory Restock" description="Add new medicine batches" color="bg-healthcare-primary" />
                                <QuickAction icon={<Pill size={16} />} title="New Sale" description="Dispense medicine to patient" color="bg-healthcare-secondary" />
                                <QuickAction icon={<TrendingUp size={16} />} title="Monthly Reports" description="Analyze stock movements" color="bg-slate-800" />
                            </div>
                        </div>
                        <div className="glass-card p-5 rounded-2xl border-2 border-red-100 dark:border-red-900 bg-white dark:bg-slate-900 shadow-sm">
                            <h3 className="font-black text-sm text-healthcare-dark mb-5">Critical Alerts</h3>
                            <div className="space-y-4">
                                <AlertItem type="expiry" title="Amoxicillin batches" info="Expires in 2 business days" />
                                <AlertItem type="stock" title="Insulin supply" info="Critical low (4 units left)" />
                                <AlertItem type="audit" title="Batch Audit" info="Compliance deadline: 5 PM" isUrgent />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="text-base font-black text-healthcare-dark">Recent Medicine Sales</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time dispensing activity</p>
                        </div>
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
                                <TableRow id="TRX-948" name="Paracetamol 500mg Tabs" category="Pain Relief" qty="-40" status="Completed" date="2m ago" sku="SKU-4829" />
                                <TableRow id="TRX-947" name="Metformin 850mg Tabs" category="Anti-Diabetic" qty="-28" status="In Process" date="5m ago" isPending sku="SKU-1029" />
                                <TableRow id="TRX-946" name="Vitamin C 1000mg" category="Supplements" qty="+120" status="Restocked" date="12m ago" isStockIn sku="SKU-7721" />
                                <TableRow id="TRX-945" name="Azithromycin 250mg" category="Antibiotics" qty="-6" status="Completed" date="45m ago" sku="SKU-3321" />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

// --- Internal Stat Components ---

function StatCard({ title, value, trend, isPositive, color, icon }: any) {
    return (
        <div className="glass-card p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group transition-all duration-300 shadow-sm relative overflow-hidden cursor-pointer border-2">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-all duration-300 group:scale-110", color)}>{icon}</div>
                    <div className={cn("flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-lg", isPositive ? "bg-emerald-50 dark:bg-emerald-900 text-healthcare-accent" : "bg-red-50 dark:bg-red-900 text-red-500")}>{isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{trend}</div>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 truncate">{title}</h3>
                <p className="text-xl font-black text-healthcare-dark leading-none tracking-tight">{value}</p>
            </div>
        </div>
    );
}

function SummaryFeature({ icon, title, value, description, color }: any) {
    return (
        <div className="flex items-center gap-4 p-4 glass-card rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all shadow-sm">
            <div className={cn("p-3 rounded-xl shadow-inner", color)}>{icon}</div>
            <div>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1.5">{title}</p>
                <p className="text-lg font-black text-healthcare-dark leading-none mb-1">{value}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">{description}</p>
            </div>
        </div>
    );
}

function QuickAction({ icon, title, description, color }: any) {
    return (
        <button className="w-full flex items-center gap-4 p-3.5 rounded-2xl border-2 border-transparent hover:border-teal-100 dark:hover:border-teal-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 group text-left">
            <div className={cn("p-2.5 rounded-xl text-white transition-all group-hover:scale-110 shadow-sm", color)}>{icon}</div>
            <div className="flex-1">
                <h4 className="font-black text-healthcare-dark text-sm leading-tight">{title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">{description}</p>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-healthcare-primary group-hover:translate-x-1 transition-all" />
        </button>
    );
}

function AlertItem({ type, title, info, isUrgent = false }: any) {
    return (
        <div className={cn("p-3.5 rounded-2xl border-2 flex items-center gap-4 group cursor-pointer transition-all", isUrgent ? "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-900 shadow-sm" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm")}>
            <div className={cn("w-2 h-2 rounded-full", isUrgent ? "bg-red-500 animate-pulse" : (type === 'expiry' ? "bg-red-400" : "bg-amber-400"))}></div>
            <div className="flex-1">
                <h4 className="font-bold text-healthcare-dark text-sm leading-none mb-1.5">{title}</h4>
                <p className={cn("text-[10px] font-black uppercase tracking-widest", isUrgent ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400")}>{info}</p>
            </div>
        </div>
    );
}

function TableRow({ id, name, category, qty, status, date, sku, isStockIn = false, isPending = false }: any) {
    return (
        <tr className="group hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition-all">
            <td className="px-6 py-4"><span className="text-[10px] font-black text-healthcare-primary bg-teal-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-teal-100 dark:border-slate-700 shadow-sm tracking-tight">{id}</span></td>
            <td className="px-6 py-4"><div className="flex flex-col"><span className="font-black text-healthcare-dark text-[13px] leading-tight">{name}</span><span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">{sku}</span></div></td>
            <td className="px-6 py-4"><span className="text-[10px] font-black px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md whitespace-nowrap uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-xs">{category}</span></td>
            <td className="px-6 py-4 text-center"><span className={cn("text-[14px] font-black tracking-tight", isStockIn ? "text-emerald-500" : (qty.startsWith('-') ? "text-amber-500" : "text-slate-600 dark:text-slate-300"))}>{qty}</span></td>
            <td className="px-6 py-4"><span className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border whitespace-nowrap shadow-xs", isPending ? "bg-amber-50 dark:bg-amber-900 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" : (isStockIn ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" : "bg-emerald-50 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 border-teal-200 dark:border-teal-800"))}>{status}</span></td>
            <td className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">{date}</td>
            <td className="px-6 py-4 text-right"><button className="p-2 text-slate-300 hover:text-healthcare-dark transition-all opacity-0 group-hover:opacity-100 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700"><MoreVertical size={14} /></button></td>
        </tr>
    );
}

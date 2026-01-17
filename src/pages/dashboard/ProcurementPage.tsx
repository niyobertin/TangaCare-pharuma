import { useState, useEffect } from 'react';
import {
    Plus,
    ShoppingCart,
    Truck,
    Clock,
    CheckCircle2,
    XCircle,
    MoreVertical,
    FileText,
    ArrowUpRight,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { pharmacyService } from '../../services/pharmacy.service';
import type { ProcurementOrder } from '../../types/pharmacy';
import { TableSkeleton, StatsSkeleton } from '../../components/shared/Skeleton';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function ProcurementPage() {
    const [orders, setOrders] = useState<ProcurementOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);

    // For simplicity in this dummy-to-real transition, we'll assume a fixed limit
    // and manual filtering if the backend doesn't support specific status filtering yet.
    // In a full implementation, these would be API params.

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await pharmacyService.getProcurementOrders();
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch procurement orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter.toLowerCase();
        return matchesStatus;
    });

    const stats = [
        { label: 'Pending POs', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Active Orders', value: orders.filter(o => o.status === 'ordered').length, icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Total Value', value: 'RWF ' + (orders.reduce((acc, o) => acc + o.total_amount, 0) / 1000000).toFixed(1) + 'M', icon: ShoppingCart, color: 'text-teal-500', bg: 'bg-teal-50' },
        { label: 'Total Orders', value: orders.length, icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50' },
    ];

    return (
        <ProtectedRoute allowedRoles={['Super Admin', 'SUPER_ADMIN', 'Facility Admin', 'FACILITY_ADMIN', 'Store Manager', 'STORE_MANAGER', 'Auditor', 'AUDITOR', 'ADMIN']}>
            <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-healthcare-dark tracking-tight">Procurement & Orders</h2>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Supply Chain & Inventory Replenishment</p>
                    </div>
                    <button className="px-5 py-2.5 bg-healthcare-primary text-white rounded-xl font-black text-xs hover:bg-teal-700 transition-all shadow-lg active:scale-[0.98] flex items-center gap-2">
                        <Plus size={16} /> Create Purchase Order
                    </button>
                </div>

                {/* Stats Grid */}
                {loading ? (
                    <StatsSkeleton />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <div key={i} className="glass-card p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                                    <stat.icon size={22} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                                    <p className="text-xl font-black text-healthcare-dark">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Search & Filter */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {['All', 'Pending', 'Ordered', 'Received', 'Cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border-2",
                                    statusFilter === status
                                        ? "bg-healthcare-primary border-healthcare-primary text-white shadow-md shadow-teal-500/10"
                                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-teal-100"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Procurement Table */}
                <div className="glass-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Order ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Supplier</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8">
                                            <TableSkeleton rows={5} columns={5} />
                                        </td>
                                    </tr>
                                ) : filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-healthcare-dark text-sm leading-tight">
                                                        PO-{order.id.toString().padStart(4, '0')}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Date: {new Date(order.order_date).toLocaleDateString()} • {order.items_count} Items</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-slate-800 text-healthcare-primary border border-teal-100 dark:border-slate-700">
                                                        <Truck size={14} />
                                                    </div>
                                                    <span className="text-xs font-bold text-healthcare-dark">{order.supplier?.name || 'Unknown Supplier'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-healthcare-dark">RWF {order.total_amount.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={cn(
                                                    "w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5",
                                                    order.status === 'received' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                        order.status === 'ordered' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                                            order.status === 'pending' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                                "bg-red-50 text-red-600 border border-red-100"
                                                )}>
                                                    {order.status === 'received' ? <CheckCircle2 size={12} /> :
                                                        order.status === 'pending' ? <Clock size={12} /> :
                                                            order.status === 'ordered' ? <Truck size={12} /> :
                                                                <XCircle size={12} />}
                                                    {order.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors" title="View Details">
                                                        <ArrowUpRight size={16} />
                                                    </button>
                                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors" title="Print PO">
                                                        <FileText size={16} />
                                                    </button>
                                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertCircle size={32} className="text-slate-300" />
                                                <span className="text-slate-500 font-bold italic">No procurement orders found</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination (Simplified for now) */}
                <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Page {page}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 border rounded-lg disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 border rounded-lg"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

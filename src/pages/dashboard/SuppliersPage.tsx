import { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Building2,
    Phone,
    Mail,
    MapPin,
    MoreVertical,
    History,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
} from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { pharmacyService } from '../../services/pharmacy.service';
import type { Supplier } from '../../types/pharmacy';
import { TableSkeleton, StatsSkeleton } from '../../components/shared/Skeleton';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const response = await pharmacyService.getSuppliers({
                page,
                limit,
                // Search not supported by existing service but we can filter client-side if needed
                // or update service if backend supports it. For now keeping it simple.
            });
            setSuppliers(response?.data || []);
            setTotalPages(response?.meta?.totalPages || 1);
            setTotalItems(response?.meta?.total || 0);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [limit]);

    useEffect(() => {
        fetchSuppliers();
    }, [page, limit]);

    const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];

    const filteredSuppliers = safeSuppliers.filter(
        (s) =>
            (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.contact_person || '').toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const stats = [
        {
            label: 'Total Partners',
            value: totalItems,
            icon: Building2,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
        },
        {
            label: 'Active Orders',
            value: 12,
            icon: TrendingUp,
            color: 'text-teal-500',
            bg: 'bg-teal-50',
        },
        {
            label: 'Avg lead Time',
            value: '3.5 Days',
            icon: History,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50',
        },
    ];

    return (
        <ProtectedRoute
            allowedRoles={[
                'Super Admin',
                'SUPER_ADMIN',
                'Facility Admin',
                'FACILITY_ADMIN',
                'Store Manager',
                'STORE_MANAGER',
                'Auditor',
                'AUDITOR',
                'ADMIN',
            ]}
        >
            <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-healthcare-dark tracking-tight">
                            Manufacturers & Suppliers
                        </h2>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                            Supply Chain & Vendor Management
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            Show
                        </span>
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-black text-healthcare-dark focus:outline-none focus:border-healthcare-primary transition-all shadow-sm"
                        >
                            {[10, 25, 50, 100].map((l) => (
                                <option key={l} value={l}>
                                    {l} per page
                                </option>
                            ))}
                        </select>
                        <button className="flex items-center gap-2 px-6 py-3 bg-healthcare-primary text-white rounded-xl font-black text-xs hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98]">
                            <Plus size={18} /> Add New Supplier
                        </button>
                    </div>
                </div>

                {/* Stats */}
                {loading ? (
                    <StatsSkeleton />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stats.map((stat, i) => (
                            <div
                                key={i}
                                className="glass-card p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4"
                            >
                                <div
                                    className={cn(
                                        'w-12 h-12 rounded-xl flex items-center justify-center',
                                        stat.bg,
                                        stat.color,
                                    )}
                                >
                                    <stat.icon size={22} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        {stat.label}
                                    </p>
                                    <p className="text-xl font-black text-healthcare-dark">
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-lg">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search by supplier name or contact..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-healthcare-primary transition-all text-sm font-bold shadow-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        Supplier Info
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        Contact Details
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        Address
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8">
                                            <TableSkeleton rows={5} columns={4} />
                                        </td>
                                    </tr>
                                ) : filteredSuppliers.length > 0 ? (
                                    filteredSuppliers.map((supplier) => (
                                        <tr
                                            key={supplier.id}
                                            className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-healthcare-dark text-sm leading-tight">
                                                        {supplier.name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                                        Ref: SUP-
                                                        {supplier.id.toString().padStart(3, '0')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                                                        <Phone
                                                            size={12}
                                                            className="text-slate-400"
                                                        />{' '}
                                                        {supplier.phone}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                                                        <Mail
                                                            size={12}
                                                            className="text-slate-400"
                                                        />{' '}
                                                        {supplier.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                                    <MapPin size={12} /> {supplier.address}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                                                        <History size={16} />
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
                                        <td colSpan={4} className="px-6 py-10 text-center">
                                            <span className="text-slate-400 font-bold italic">
                                                No suppliers found
                                            </span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                    <div className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
                        Showing{' '}
                        <span className="text-healthcare-dark">
                            {totalItems === 0 ? 0 : (page - 1) * limit + 1}
                        </span>{' '}
                        to{' '}
                        <span className="text-healthcare-dark">
                            {Math.min(page * limit, totalItems)}
                        </span>{' '}
                        of <span className="text-healthcare-dark">{totalItems}</span> Suppliers
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1 || loading}
                            className="p-2 border border-slate-100 dark:border-slate-800 rounded-xl disabled:opacity-50 text-slate-500 hover:text-healthcare-primary transition-all shadow-sm"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={page === totalPages || loading}
                            className="p-2 border border-slate-100 dark:border-slate-800 rounded-xl disabled:opacity-50 text-slate-500 hover:text-healthcare-primary transition-all shadow-sm"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

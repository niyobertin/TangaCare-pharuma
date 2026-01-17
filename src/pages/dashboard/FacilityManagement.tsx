import { useState, useEffect } from 'react';
import {
    Plus,
    Building2,
    MapPin,
    Users,
    MoreVertical,
    Store,
    Hotel,
    Stethoscope,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { pharmacyService } from '../../services/pharmacy.service';
import type { Facility } from '../../types/pharmacy';
import { TableSkeleton, StatsSkeleton } from '../../components/shared/Skeleton';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function FacilityManagementPage() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);

    const fetchFacilities = async () => {
        setLoading(true);
        try {
            const response = await pharmacyService.getFacilities({ page, limit });
            // Service returns normalized PaginatedResponse
            setFacilities(response?.data || []);
            setTotalPages(response?.meta?.totalPages || 1);
            setTotalItems(response?.meta?.total || 0);
        } catch (error) {
            console.error('Failed to fetch facilities:', error);
            setFacilities([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFacilities();
    }, [page, limit]);

    const safeFacilities = Array.isArray(facilities) ? facilities : [];

    const stats = [
        { label: 'Total Facilities', value: totalItems, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Active Hospitals', value: safeFacilities.filter(f => ((f.type as string) === 'hospital' || (f.type as string) === 'HOSPITAL') && (f.status === 'Active' || (f as any).is_active)).length, icon: Hotel, color: 'text-teal-500', bg: 'bg-teal-50' },
        { label: 'Active Clinics', value: safeFacilities.filter(f => ((f.type as string) === 'clinic' || (f.type as string) === 'CLINIC') && (f.status === 'Active' || (f as any).is_active)).length, icon: Stethoscope, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { label: 'Staff Managed', value: '---', icon: Users, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    return (
        <ProtectedRoute allowedRoles={['Super Admin', 'SUPER_ADMIN', 'Auditor', 'AUDITOR']}>
            <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-healthcare-dark tracking-tight">Facility Management</h2>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">System-Wide Infrastructure & Scoping</p>
                    </div>
                    <button className="px-5 py-2.5 bg-healthcare-primary text-white rounded-xl font-black text-xs hover:bg-teal-700 transition-all shadow-lg active:scale-[0.98] flex items-center gap-2">
                        <Plus size={16} /> Register New Facility
                    </button>
                </div>

                {/* Stats Grid */}
                {loading ? (
                    <StatsSkeleton />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <div key={i} className="glass-card p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all group">
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                                    <p className="text-xl font-black text-healthcare-dark">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Show</span>
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-black text-healthcare-dark focus:outline-none focus:border-healthcare-primary transition-all shadow-sm"
                        >
                            {[10, 25, 50, 100].map(l => (
                                <option key={l} value={l}>{l} per page</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
                        {['All', 'hospital', 'clinic', 'pharmacy'].map(type => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border-2",
                                    selectedType === type
                                        ? "bg-healthcare-primary border-healthcare-primary text-white shadow-md shadow-teal-500/10"
                                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-teal-100"
                                )}
                            >
                                {type === 'All' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Facilities List */}
                <div className="glass-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Facility Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Admin</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Type</th>
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
                                ) : safeFacilities.length > 0 ? (
                                    safeFacilities.map((f) => {
                                        const type = f.type?.toLowerCase() || 'pharmacy';
                                        const isActive = f.status === 'Active' || (f as any).is_active === true;
                                        return (
                                            <tr key={f.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center text-white",
                                                            type.includes('hospital') ? "bg-teal-500" : type.includes('clinic') ? "bg-indigo-500" : "bg-amber-500"
                                                        )}>
                                                            {type.includes('hospital') ? <Hotel size={20} /> : type.includes('clinic') ? <Stethoscope size={20} /> : <Store size={20} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-healthcare-dark text-sm leading-tight">{f.name}</p>
                                                            <div className="flex items-center gap-1 mt-1 text-slate-400">
                                                                <MapPin size={10} />
                                                                <p className="text-[10px] font-bold uppercase">{f.address}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">{(f.admin_name || 'U')[0]}</div>
                                                        <span className="text-xs font-bold text-healthcare-dark">{f.admin_name || 'System Admin'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 uppercase tracking-widest">
                                                        {type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={cn(
                                                        "w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5",
                                                        isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                                                    )}>
                                                        {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                        {isActive ? 'Active' : 'Inactive'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors tooltip" title="Manage Departments">
                                                            <ArrowUpRight size={16} />
                                                        </button>
                                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                                                            <MoreVertical size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertCircle size={32} className="text-slate-300" />
                                                <span className="text-slate-500 font-bold italic">No facilities found</span>
                                            </div>
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
                        Showing <span className="text-healthcare-dark">{totalItems === 0 ? 0 : (page - 1) * limit + 1}</span> to <span className="text-healthcare-dark">{Math.min(page * limit, totalItems)}</span> of <span className="text-healthcare-dark">{totalItems}</span> Facilities
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            disabled={page === 1 || loading}
                            className="p-2 border border-slate-100 dark:border-slate-800 rounded-xl disabled:opacity-50 text-slate-500 hover:text-healthcare-primary transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={cn(
                                        "w-9 h-9 flex items-center justify-center rounded-xl text-[11px] font-black transition-all",
                                        page === i + 1
                                            ? "bg-healthcare-primary text-white shadow-md shadow-teal-500/20"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400"
                                    )}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={page === totalPages || loading}
                            className="p-2 border border-slate-100 dark:border-slate-800 rounded-xl disabled:opacity-50 text-slate-500 hover:text-healthcare-primary transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

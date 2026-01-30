import { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Filter,
    MoreVertical,
    AlertCircle,
    Download,
    Pill,
    ChevronLeft,
    ChevronRight,
    ArrowRightLeft,
} from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import type { Medicine } from '../../types/pharmacy';
import { pharmacyService } from '../../services/pharmacy.service';
import { useDebounce } from '../../hooks/useDebounce';
import { TableSkeleton } from '../../components/shared/Skeleton';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../../context/AuthContext';
import { StockTransferModal } from '../../components/inventory/StockTransferModal';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function InventoryPage() {
    const { user } = useAuth();
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);
    const [selectedMedForTransfer, setSelectedMedForTransfer] = useState<Medicine | null>(null);

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const response = await pharmacyService.getMedicines({
                page,
                limit,

                search: debouncedSearch,
                ...(user?.facility_id ? { facility_id: user.facility_id } : {}),
            });
            setMedicines(response?.data || []);
            setTotalPages(response?.meta?.totalPages || 1);
            setTotalItems(response?.meta?.total || 0);
        } catch (error) {
            console.error('Failed to fetch medicines:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, selectedCategory, limit]);

    useEffect(() => {
        fetchMedicines();
    }, [page, debouncedSearch, selectedCategory, limit]);

    const categories = [
        'All Categories',
        'Antibiotics',
        'Pain Relief',
        'Anti-Diabetic',
        'Supplements',
        'Cardiovascular',
    ];

    return (
        <ProtectedRoute
            allowedRoles={['admin', 'pharmacist', 'super_admin', 'store_manager', 'facility_admin']}
            requireFacility
        >
            <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-black text-healthcare-dark tracking-tight">
                            Medicine Inventory
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2 mt-0.5 text-xs uppercase tracking-wider">
                            Manage your full pharmaceutical stock and batches
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            Show
                        </span>
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-black text-healthcare-dark focus:outline-none focus:border-healthcare-primary transition-all shadow-sm"
                        >
                            {[10, 25, 50, 100].map((l) => (
                                <option key={l} value={l}>
                                    {l} per page
                                </option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                                <Download size={14} /> Export CSV
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-healthcare-primary text-white rounded-lg text-sm font-black hover:bg-teal-700 transition-all shadow-md shadow-teal-500/10">
                                <Plus size={16} /> Add Medicine
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters & Actions Section */}
                <div className="glass-card p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search by name, generic name or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-healthcare-primary/20 focus:border-healthcare-primary transition-all text-sm font-medium"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:outline-none text-sm font-bold text-slate-600 dark:text-slate-300"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <button className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-500 hover:text-healthcare-primary transition-all">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="glass-card rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-black uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Medicine Info</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Stock Level</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px] font-medium">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8">
                                            <TableSkeleton rows={5} columns={7} />
                                        </td>
                                    </tr>
                                ) : medicines.length > 0 ? (
                                    medicines.map((med) => (
                                        <tr
                                            key={med.id}
                                            className="group hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition-all"
                                        >
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                #{med.id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-slate-800 flex items-center justify-center text-healthcare-primary shadow-sm border border-teal-100 dark:border-slate-700">
                                                        <Pill size={18} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-healthcare-dark text-[14px] leading-tight">
                                                            {med.name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5 tracking-tight">
                                                            {med.code} • {med.strength}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md whitespace-nowrap uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-xs">
                                                    {med.dosage_form}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5 min-w-[120px]">
                                                    <div className="flex justify-between items-center text-[11px] font-black">
                                                        <span
                                                            className={cn(
                                                                (med.stock_quantity || 0) <= 20
                                                                    ? 'text-red-500'
                                                                    : 'text-slate-600 dark:text-slate-300',
                                                            )}
                                                        >
                                                            {med.stock_quantity || 0} Units
                                                        </span>
                                                        <span className="text-slate-400 uppercase tracking-tighter">
                                                            Min: 20
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                                                        <div
                                                            className={cn(
                                                                'h-full rounded-full transition-all duration-500',
                                                                (med.stock_quantity || 0) <= 20
                                                                    ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                                                                    : 'bg-healthcare-primary',
                                                            )}
                                                            style={{
                                                                width: `${Math.min(((med.stock_quantity || 0) / 100) * 100, 100)}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] font-black text-healthcare-dark">
                                                RWF {med.selling_price.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={cn(
                                                        'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-xs flex items-center gap-1.5 w-max',
                                                        (med.stock_quantity || 0) === 0
                                                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30'
                                                            : (med.stock_quantity || 0) <= 20
                                                              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30'
                                                              : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-teal-200 dark:border-teal-900/30',
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            'w-1.5 h-1.5 rounded-full',
                                                            (med.stock_quantity || 0) === 0
                                                                ? 'bg-red-500 animate-pulse'
                                                                : (med.stock_quantity || 0) <= 20
                                                                  ? 'bg-amber-500'
                                                                  : 'bg-emerald-500',
                                                        )}
                                                    ></div>
                                                    {(med.stock_quantity || 0) === 0
                                                        ? 'Out of Stock'
                                                        : (med.stock_quantity || 0) <= 20
                                                          ? 'Low Stock'
                                                          : 'In Stock'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            setSelectedMedForTransfer(med)
                                                        }
                                                        className="p-2 text-slate-400 hover:text-healthcare-primary hover:bg-teal-50 dark:hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-teal-100 dark:hover:border-slate-700"
                                                        title="Transfer Stock"
                                                    >
                                                        <ArrowRightLeft size={16} />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-healthcare-primary hover:bg-teal-50 dark:hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-teal-100 dark:hover:border-slate-700">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertCircle size={32} className="text-slate-300" />
                                                <span className="text-slate-500 font-bold italic">
                                                    No medicines found matching your criteria
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                    <div className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
                        Showing{' '}
                        <span className="text-healthcare-dark">{(page - 1) * limit + 1}</span> to{' '}
                        <span className="text-healthcare-dark">
                            {Math.min(page * limit, totalItems)}
                        </span>{' '}
                        of <span className="text-healthcare-dark">{totalItems}</span> Medicines
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1 || loading}
                            className="p-2 border-2 border-slate-100 dark:border-slate-800 rounded-xl disabled:opacity-50 text-slate-500 hover:text-healthcare-primary hover:border-healthcare-primary/20 transition-all shadow-sm"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={cn(
                                        'w-9 h-9 flex items-center justify-center rounded-xl text-[11px] font-black transition-all',
                                        page === i + 1
                                            ? 'bg-healthcare-primary text-white shadow-md shadow-teal-500/20'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400',
                                    )}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={page === totalPages || loading}
                            className="p-2 border-2 border-slate-100 dark:border-slate-800 rounded-xl disabled:opacity-50 text-slate-500 hover:text-healthcare-primary hover:border-healthcare-primary/20 transition-all shadow-sm"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {selectedMedForTransfer && user?.facility_id && (
                <StockTransferModal
                    medicine={selectedMedForTransfer}
                    facilityId={user.facility_id}
                    onClose={() => setSelectedMedForTransfer(null)}
                    onSuccess={() => {
                        fetchMedicines();
                        // Additional refresh/toast handled in modal
                    }}
                />
            )}
        </ProtectedRoute>
    );
}

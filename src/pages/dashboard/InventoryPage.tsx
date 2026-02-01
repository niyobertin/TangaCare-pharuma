import { useState, useEffect, useRef } from 'react';
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
    Upload,
    Loader2,
    CheckCircle2,
    XCircle,
    FileText,
    Copy,
    Calendar,
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
import { toast } from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Preview Modal Component
const MedicineImportPreviewModal = ({
    isOpen,
    onClose,
    onConfirm,
    items,
    loading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    items: any[];
    loading: boolean;
}) => {
    if (!isOpen) return null;

    const updates = items.filter((i) => i.is_update).length;
    const newItems = items.length - updates;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <FileText className="text-healthcare-primary" size={24} />
                            Preview Medicines Import
                        </h3>
                        <p className="text-sm text-slate-500 font-bold mt-1">
                            Review the {items.length} medicines before final confirmation.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <XCircle size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 bg-healthcare-primary/5 rounded-xl p-4 border border-healthcare-primary/10">
                            <div className="text-[10px] font-black text-healthcare-primary uppercase tracking-wider">
                                New Medicines
                            </div>
                            <div className="text-2xl font-black text-healthcare-primary">
                                {newItems}
                            </div>
                        </div>
                        <div className="flex-1 bg-amber-500/5 rounded-xl p-4 border border-amber-500/10">
                            <div className="text-[10px] font-black text-amber-500 uppercase tracking-wider">
                                To Be Updated
                            </div>
                            <div className="text-2xl font-black text-amber-500">{updates}</div>
                        </div>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                        Medicine Name
                                    </th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                        Form
                                    </th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">
                                        Price (Cost)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {items.map((item, idx) => (
                                    <tr
                                        key={idx}
                                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        <td className="px-4 py-3 font-bold text-xs">
                                            {item.is_update ? (
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px]">
                                                    Update
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-[10px]">
                                                    New
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-xs text-slate-700 dark:text-slate-300">
                                            {item.code}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-black text-slate-900 dark:text-white">
                                            {item.name}
                                            {item.brand_name && (
                                                <span className="block text-[10px] font-bold text-slate-400">
                                                    {item.brand_name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-bold text-slate-500 capitalize">
                                            {item.dosage_form}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-black text-slate-900 dark:text-white text-right">
                                            ${item.cost_price?.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2.5 text-sm font-black text-slate-600 hover:text-slate-800 disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 bg-healthcare-primary text-white rounded-xl text-sm font-black hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={16} />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={16} />
                                Confirm Import
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export function InventoryPage() {
    const { user, facilityId } = useAuth();
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);
    const [selectedMedForTransfer, setSelectedMedForTransfer] = useState<Medicine | null>(null);

    // Import states
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [previewItems, setPreviewItems] = useState<any[]>([]);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [stats, setStats] = useState({
        totalItems: 0,
        totalCategories: 0,
        lowStock: 0,
        expired: 0,
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const response = await pharmacyService.getMedicines({
                page,
                limit,
                search: debouncedSearch,
                start_date: startDate,
                end_date: endDate,
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

    const fetchStats = async () => {
        try {
            const data = await pharmacyService.getMedicineStatistics();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, selectedCategory, limit, startDate, endDate]);

    useEffect(() => {
        fetchMedicines();
    }, [page, debouncedSearch, selectedCategory, limit, startDate, endDate]);

    const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const result = await pharmacyService.validateMedicineImport(file);
            if (result.errors && result.errors.length > 0) {
                toast.error(`${result.errors.length} errors found in file. Check details.`);
            }
            setPreviewItems(result.items);
            setPendingFile(file);
            setIsImportModalOpen(true);
        } catch (error: any) {
            console.error('Validation failed:', error);
            toast.error(error.message || 'Failed to validate Excel file.');
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const confirmImport = async () => {
        if (!pendingFile) return;

        setUploading(true);
        try {
            const result = await pharmacyService.importMedicines(pendingFile);
            toast.success(
                `Import complete: ${result.imported} new, ${result.updated} updated.`,
                { duration: 5000 },
            );
            if (result.errors?.length) {
                console.error('Import errors:', result.errors);
            }
            setIsImportModalOpen(false);
            setPendingFile(null);
            fetchMedicines();
            fetchStats();
        } catch (error: any) {
            console.error('Import failed:', error);
            toast.error(error.message || 'Failed to import medicines.');
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = async () => {
        try {
            const blob = await pharmacyService.downloadMedicineTemplate();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Medicine_Template.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Template downloaded!');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download template.');
        }
    };

    const categories = [
        'All Categories',
        'Antibiotics',
        'Pain Relief',
        'Anti-Diabetic',
        'Supplements',
        'Cardiovascular',
    ];

    const toggleSelectAll = () => {
        if (selectedIds.length === medicines.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(medicines.map((m) => m.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    const copySelectedIds = () => {
        const selectedCodes = medicines
            .filter((m) => selectedIds.includes(m.id))
            .map((m) => m.code)
            .join(', ');

        if (!selectedCodes) {
            toast.error('No items selected');
            return;
        }

        navigator.clipboard.writeText(selectedCodes);
        toast.success(`Copied ${selectedIds.length} medicine codes to clipboard!`);
    };

    const handleExport = async () => {
        try {
            await pharmacyService.exportMedicines();
            toast.success('Exporting inventory...');
        } catch (error) {
            toast.error('Failed to export inventory');
        }
    };

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
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImportFileChange}
                                className="hidden"
                                accept=".xlsx,.xls"
                            />
                            <button
                                onClick={downloadTemplate}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                            >
                                <Download size={14} /> Template
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                            >
                                {loading && !medicines.length ? (
                                    <Loader2 className="animate-spin" size={14} />
                                ) : (
                                    <Upload size={14} />
                                )}
                                Import Excel
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-healthcare-primary text-white rounded-lg text-sm font-black hover:bg-teal-700 transition-all shadow-md shadow-teal-500/10">
                                <Plus size={16} /> Add Medicine
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-healthcare-primary/30 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-1.5 bg-healthcare-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                                <Pill className="text-healthcare-primary" size={16} />
                            </div>
                            <span className="text-[8px] font-black bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                Total
                            </span>
                        </div>
                        <h3 className="text-xl font-medium text-slate-800 dark:text-white leading-tight">
                            {stats.totalItems}
                        </h3>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                            Medicines
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-1.5 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                <Filter className="text-blue-500" size={16} />
                            </div>
                            <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                Types
                            </span>
                        </div>
                        <h3 className="text-xl font-medium text-slate-800 dark:text-white leading-tight">
                            {stats.totalCategories}
                        </h3>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                            Categories
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-healthcare-secondary/30 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-1.5 bg-healthcare-secondary/10 rounded-lg group-hover:scale-110 transition-transform">
                                <AlertCircle className="text-healthcare-secondary" size={16} />
                            </div>
                            <span className="text-[8px] font-black bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                Alert
                            </span>
                        </div>
                        <h3 className="text-xl font-medium text-slate-800 dark:text-white leading-tight">
                            {stats.lowStock}
                        </h3>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                            Low Stock
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-red-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-1.5 bg-red-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                <AlertCircle className="text-red-500" size={16} />
                            </div>
                            <span className="text-[8px] font-black bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                Critical
                            </span>
                        </div>
                        <h3 className="text-xl font-medium text-slate-800 dark:text-white leading-tight">
                            {stats.expired}
                        </h3>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                            Expired
                        </p>
                    </div>
                </div>

                {/* Filters & Actions Bar */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                        <div className="flex-1 relative group">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-healthcare-primary transition-colors"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search by code, generic or brand name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-healthcare-primary focus:bg-white transition-all shadow-inner"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border-2 border-slate-100 dark:border-slate-800">
                                <Calendar size={14} className="text-slate-400" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent text-[10px] font-black text-slate-700 dark:text-slate-300 focus:outline-none"
                                />
                                <span className="text-slate-300">/</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent text-[10px] font-black text-slate-700 dark:text-slate-300 focus:outline-none"
                                />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-sm font-black text-slate-700 dark:text-slate-300 focus:outline-none focus:border-healthcare-primary transition-all shadow-sm"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-sm font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <Download size={16} /> Export
                            </button>
                        </div>
                    </div>

                    {selectedIds.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 bg-healthcare-primary/10 border-2 border-healthcare-primary/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-healthcare-primary text-white rounded-lg">
                                    <CheckCircle2 size={16} />
                                </div>
                                <span className="text-sm font-black text-healthcare-primary">
                                    {selectedIds.length} items selected
                                </span>
                            </div>
                            <button
                                onClick={copySelectedIds}
                                className="flex items-center gap-2 px-4 py-2 bg-healthcare-primary text-white rounded-lg text-sm font-black hover:bg-teal-700 transition-all shadow-md"
                            >
                                <Copy size={16} /> Copy Codes for PO
                            </button>
                        </div>
                    )}
                </div>

                {/* Inventory Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-800">
                                    <th className="px-4 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedIds.length === medicines.length &&
                                                medicines.length > 0
                                            }
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-2 border-slate-300 text-healthcare-primary focus:ring-healthcare-primary transition-all"
                                        />
                                    </th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">
                                        Medicine Details
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center whitespace-nowrap">
                                        Dosage Form
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right whitespace-nowrap">
                                        Total Stock
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center whitespace-nowrap">
                                        Expiry Date
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center whitespace-nowrap">
                                        Date Added
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center whitespace-nowrap">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right whitespace-nowrap">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <TableSkeleton columns={9} rows={5} />
                                ) : medicines.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full">
                                                    <Search size={32} className="text-slate-300" />
                                                </div>
                                                <p className="text-slate-500 font-bold">
                                                    No medicines found matching your filters.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    medicines.map((med) => (
                                        <tr
                                            key={med.id}
                                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                                        >
                                            <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(med.id)}
                                                    onChange={() => toggleSelect(med.id)}
                                                    className="w-4 h-4 rounded border-2 border-slate-300 text-healthcare-primary focus:ring-healthcare-primary transition-all"
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-[10px] font-black text-slate-400">
                                                    #{med.id}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-healthcare-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <Pill
                                                            className="text-healthcare-primary"
                                                            size={20}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                                                            {med.name}
                                                        </p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">
                                                            {med.code} • {med.brand_name || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <span className="text-xs font-bold text-slate-500 capitalize">
                                                    {med.dosage_form}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-black text-slate-800 dark:text-white">
                                                        {med.stock_quantity || 0}
                                                    </span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        {med.unit}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <span className={cn(
                                                    "text-xs font-bold",
                                                    med.expiry_date && new Date(med.expiry_date) < new Date()
                                                        ? "text-red-500"
                                                        : "text-slate-500"
                                                )}>
                                                    {med.expiry_date ? new Date(med.expiry_date).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <span className="text-xs font-bold text-slate-500">
                                                    {med.created_at ? new Date(med.created_at).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <span
                                                    className={cn(
                                                        'px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider',
                                                        (med.stock_quantity || 0) === 0
                                                            ? 'bg-red-50 text-red-600 border-red-100'
                                                            : (med.stock_quantity || 0) <= 20
                                                                ? 'bg-amber-50 text-amber-600 border-amber-100'
                                                                : 'bg-teal-50 text-teal-600 border-teal-100',
                                                    )}
                                                >
                                                    {(med.stock_quantity || 0) === 0
                                                        ? 'Out of Stock'
                                                        : (med.stock_quantity || 0) <= 20
                                                            ? 'Low Stock'
                                                            : 'In Stock'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2 transition-all">
                                                    <button
                                                        onClick={() =>
                                                            setSelectedMedForTransfer(med)
                                                        }
                                                        title="Transfer Stock"
                                                        className="p-2 text-blue-600 hover:bg-blue-50 bg-blue-50/10 rounded-lg transition-colors"
                                                    >
                                                        <ArrowRightLeft size={16} />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:bg-slate-100 bg-slate-50/30 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing {medicines.length} of {totalItems} items
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-50 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setPage(i + 1)}
                                        className={cn(
                                            'w-8 h-8 rounded-lg text-xs font-black transition-all border-2',
                                            page === i + 1
                                                ? 'bg-healthcare-primary border-healthcare-primary text-white shadow-md shadow-teal-500/20'
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700',
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-50 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {selectedMedForTransfer && facilityId && (
                    <StockTransferModal
                        facilityId={facilityId}
                        onClose={() => setSelectedMedForTransfer(null)}
                        medicine={selectedMedForTransfer}
                        onSuccess={() => {
                            fetchMedicines();
                            setSelectedMedForTransfer(null);
                        }}
                    />
                )}

                {/* Import Preview Modal */}
                <MedicineImportPreviewModal
                    isOpen={isImportModalOpen}
                    onClose={() => {
                        setIsImportModalOpen(false);
                        setPendingFile(null);
                    }}
                    onConfirm={confirmImport}
                    items={previewItems}
                    loading={uploading}
                />
            </div>
        </ProtectedRoute>
    );
}

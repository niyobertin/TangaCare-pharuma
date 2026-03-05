import { useState, useEffect } from 'react';
import {
    Plus,
    ShoppingCart,
    Truck,
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
    ArrowUpRight,
    AlertCircle,
    Upload,
    Download,
    Loader2,
    Calendar,
    Search as SearchIcon,
    RefreshCw,
    Trash2,
    Phone,
    Mail,
    MapPin,
    Edit,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { pharmacyService } from '../../services/pharmacy.service';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { SupplierModal } from '../../components/inventory/SupplierModal';
import type { ProcurementOrder, Supplier } from '../../types/pharmacy';
import { SkeletonTable } from '../../components/ui/SkeletonTable';
import { CreatePurchaseOrderModal } from '../../components/inventory/CreatePurchaseOrderModal';
import { ReceiveOrderModal } from '../../components/inventory/ReceiveOrderModal';
import { StatsSkeleton } from '../../components/shared/Skeleton';
import { Pagination } from '../../components/ui/Pagination';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const ACTIVE_ORDER_STATUSES = [
    'approved',
    'confirmed',
    'partially_received',
    'backordered',
] as const;

const formatRwfCompact = (value: number): string => {
    const amount = Number(value || 0);
    if (amount >= 1_000_000_000) return `RWF ${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `RWF ${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `RWF ${(amount / 1_000).toFixed(1)}K`;
    return `RWF ${Math.round(amount).toLocaleString()}`;
};

const toLabelCase = (value: string): string =>
    String(value || '')
        .replace(/[_\s]+/g, ' ')
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());

const ImportPreviewModal = ({
    isOpen,
    onClose,
    onConfirm,
    items,
    totalAmount,
    loading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    items: any[];
    totalAmount: number;
    loading: boolean;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <h3 className="text-xl font-black text-healthcare-dark dark:text-white">
                            Import Preview
                        </h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                            Review items before creating Purchase Order
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <XCircle size={24} className="text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-200 dark:border-slate-800">
                                <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    Medicine
                                </th>
                                <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">
                                    Code
                                </th>
                                <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">
                                    Quantity
                                </th>
                                <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">
                                    Unit Price
                                </th>
                                <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {items.map((item, idx) => (
                                <tr
                                    key={idx}
                                    className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                >
                                    <td className="py-4 font-bold text-healthcare-dark dark:text-white text-sm">
                                        {item.medicine_name}
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 uppercase">
                                            {item.medicine_code}
                                        </span>
                                    </td>
                                    <td className="py-4 text-center text-sm font-black text-healthcare-dark dark:text-white">
                                        {item.quantity_ordered}
                                    </td>
                                    <td className="py-4 text-right text-sm font-bold text-slate-500">
                                        RWF {item.unit_price.toLocaleString()}
                                    </td>
                                    <td className="py-4 text-right text-sm font-black text-healthcare-primary">
                                        RWF {item.total_price.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="text-right sm:text-left">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                Total Items
                            </p>
                            <p className="text-lg font-black text-healthcare-dark dark:text-white">
                                {items.length}
                            </p>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                        <div className="text-right sm:text-left">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                Total Amount
                            </p>
                            <p className="text-lg font-black text-healthcare-primary">
                                RWF {totalAmount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 sm:flex-none px-8 py-3 bg-healthcare-primary text-white rounded-xl text-sm font-black hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <CheckCircle2 size={18} />
                            )}
                            Confirm Import
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SuppliersTab = () => {
    const { user } = useAuth();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchSuppliers = async (currentSearch?: string, currentStatus?: string) => {
        setLoading(true);
        try {
            const params: any = {
                page,
                limit,
                search: currentSearch ?? searchQuery,
            };

            if (
                currentStatus === 'active' ||
                (currentStatus === undefined && statusFilter === 'active')
            ) {
                params.is_active = true;
            } else if (
                currentStatus === 'inactive' ||
                (currentStatus === undefined && statusFilter === 'inactive')
            ) {
                params.is_active = false;
            }

            const response = await pharmacyService.getSuppliers(params);
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
        const timer = setTimeout(() => {
            if (page !== 1) setPage(1);
            else fetchSuppliers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setPage(1);
        fetchSuppliers(searchQuery, statusFilter);
    }, [statusFilter, limit]);

    useEffect(() => {
        fetchSuppliers();
    }, [page]);

    const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <div className="relative flex-1 max-w-lg">
                    <SearchIcon
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Search by supplier name or contact..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white focus:border-healthcare-primary rounded-xl text-sm font-bold text-slate-900 dark:text-white transition-all outline-none"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">
                        Show
                    </span>
                    <select
                        value={limit}
                        onChange={(e) => {
                            setLimit(Number(e.target.value));
                            setPage(1);
                        }}
                        className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 text-[10px] font-black text-healthcare-dark dark:text-white focus:outline-none focus:border-healthcare-primary"
                    >
                        {[10, 25, 50, 100].map((l) => (
                            <option key={l} value={l}>
                                {l}
                            </option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-healthcare-dark dark:text-white focus:outline-none focus:border-healthcare-primary transition-all"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Partners</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    {user?.role?.toString()?.toLowerCase() !== 'auditor' && (
                        <button
                            onClick={() => {
                                setSelectedSupplier(null);
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-6 py-2.5 bg-healthcare-primary text-white rounded-xl font-black text-xs hover:bg-teal-700 transition-all shadow-lg active:scale-[0.98]"
                        >
                            <Plus size={18} /> Add Supplier
                        </button>
                    )}
                </div>
            </div>

            <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    {loading ? (
                        <SkeletonTable
                            rows={5}
                            columns={6}
                            headers={['ID', 'Company Name', 'TIN (Tax ID)', 'Contact', 'Location', 'Actions']}
                            columnAligns={['left', 'left', 'left', 'left', 'left', 'right']}
                            className="border-none shadow-none"
                        />
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">
                                        Company Name
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">
                                        TIN (Tax ID)
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">
                                        Contact
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">
                                        Location
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {safeSuppliers.length > 0 ? (
                                    safeSuppliers.map((supplier) => (
                                        <tr
                                            key={supplier.id}
                                            className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-sm"
                                        >
                                            <td className="px-6 py-4 font-bold text-slate-400">
                                                #{supplier.id.toString().padStart(3, '0')}
                                            </td>
                                            <td className="px-6 py-4 font-black text-healthcare-dark dark:text-white">
                                                {supplier.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-[10px] font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                    {supplier.tax_id || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                                                    <Phone size={12} className="text-teal-500" />
                                                    {supplier.phone}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                    <Mail size={12} />
                                                    {supplier.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                    <MapPin size={12} className="text-teal-500" />
                                                    {supplier.address}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {user?.role?.toString()?.toLowerCase() !==
                                                        'auditor' && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedSupplier(supplier);
                                                                        setIsModalOpen(true);
                                                                    }}
                                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-healthcare-primary transition-all"
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSupplierToDelete(supplier.id);
                                                                        setIsConfirmOpen(true);
                                                                    }}
                                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center">
                                            <span className="text-slate-400 font-bold italic">
                                                No suppliers found
                                            </span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={limit}
                onPageChange={setPage}
                loading={loading}
            />

            <SupplierModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchSuppliers()}
                supplier={selectedSupplier}
            />

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => {
                    setIsConfirmOpen(false);
                    setSupplierToDelete(null);
                }}
                onConfirm={async () => {
                    if (supplierToDelete) {
                        setActionLoading(true);
                        try {
                            await pharmacyService.deleteSupplier(supplierToDelete);
                            toast.success('Supplier removed successfully');
                            setIsConfirmOpen(false);
                            setSupplierToDelete(null);
                            fetchSuppliers();
                        } catch (error) {
                            console.error('Failed to delete supplier:', error);
                            toast.error('Failed to remove supplier');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }}
                loading={actionLoading}
                title="Remove Supplier"
                message="Are you sure you want to remove this supplier? This action cannot be undone."
                confirmText="Remove"
            />
        </div>
    );
};

export function ProcurementPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<ProcurementOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<
        | 'all'
        | 'draft'
        | 'pending'
        | 'approved'
        | 'confirmed'
        | 'partially_received'
        | 'backordered'
        | 'received'
        | 'cancelled'
    >('all');
    const [page, setPage] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
    const [isPOModalOpen, setIsPOModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(10);
    const [procurementStats, setProcurementStats] = useState({
        pending: 0,
        active: 0,
        totalOrders: 0,
        totalValue: 0,
    });


    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<ProcurementOrder | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<{ items: any[]; total_amount: number } | null>(
        null,
    );
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const sharedParams = {
                page,
                limit,
                search: searchTerm || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            };
            const params = {
                ...sharedParams,
                status: statusFilter === 'all' ? undefined : statusFilter,
            };

            const activeRequests = ACTIVE_ORDER_STATUSES.map((status) =>
                pharmacyService.getProcurementOrders({
                    ...sharedParams,
                    page: 1,
                    limit: 1,
                    status,
                }),
            );

            const [response, allOrdersStats, pendingStats, ...activeStats] = await Promise.all([
                pharmacyService.getProcurementOrders(params),
                pharmacyService.getProcurementOrders({
                    ...sharedParams,
                    page: 1,
                    limit: 1,
                    status: undefined,
                }),
                pharmacyService.getProcurementOrders({
                    ...sharedParams,
                    page: 1,
                    limit: 1,
                    status: 'pending',
                }),
                ...activeRequests,
            ]);

            const activeCount = activeStats.reduce(
                (sum, stat) => sum + Number(stat.meta?.total || 0),
                0,
            );

            setOrders(Array.isArray(response.data) ? response.data : []);
            setTotalPages(response.meta?.totalPages || 1);
            setTotalItems(response.meta?.total || 0);
            setProcurementStats({
                pending: pendingStats.meta?.total || 0,
                active: activeCount,
                totalOrders: allOrdersStats.meta?.total || 0,
                totalValue:
                    allOrdersStats.meta?.totalValue ??
                    response.meta?.totalValue ??
                    0,
            });
        } catch (error) {
            console.error('Failed to fetch procurement orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await pharmacyService.getSuppliers({ limit: 100 });
            setSuppliers(response.data);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'orders') {
            const timer = setTimeout(() => {
                fetchOrders();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [statusFilter, searchTerm, startDate, endDate, page, activeTab]);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const downloadTemplate = async () => {
        try {
            const blob = await pharmacyService.downloadProcurementTemplate();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'PO_Template.xlsx';
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

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!selectedSupplierId) {
            toast.error('Please select a supplier first before importing.');
            e.target.value = '';
            return;
        }

        setUploading(true);
        try {
            const result = await pharmacyService.validateProcurementImport(file);
            setPreviewData(result);
            setPendingFile(file);
            setIsPreviewOpen(true);
        } catch (error: any) {
            console.error('Validation failed:', error);
            const message =
                error?.response?.data?.message ||
                'Failed to parse Excel file. Please ensure it follows the template.';
            toast.error(message);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const confirmImport = async () => {
        if (!pendingFile || !selectedSupplierId) return;

        setUploading(true);
        try {
            await pharmacyService.importProcurementExcel(selectedSupplierId, pendingFile);
            toast.success('Purchase Order imported successfully!');
            setIsPreviewOpen(false);
            setPreviewData(null);
            setPendingFile(null);
            fetchOrders();
        } catch (error: any) {
            console.error('Import failed:', error);
            const message = error?.response?.data?.message || 'Failed to create Purchase Order.';
            toast.error(message);
        } finally {
            setUploading(false);
        }
    };

    const handleAction = async (id: number, action: 'submit' | 'approve' | 'cancel') => {
        try {
            if (action === 'submit') {
                await pharmacyService.submitProcurementOrder(id);
                toast.success('Order submitted for approval');
            }
            if (action === 'approve') {
                await pharmacyService.approveProcurementOrder(id);
                toast.success('Order approved successfully');
            }
            if (action === 'cancel') {
                await pharmacyService.cancelProcurementOrder(id);
                toast.success('Order cancelled');
            }
            fetchOrders();
        } catch (error: any) {
            console.error(`Failed to ${action} order:`, error);
            toast.error(error?.response?.data?.message || `Failed to ${action} order`);
        }
    };

    const handleReceiveClick = (order: ProcurementOrder) => {
        setSelectedOrder(order);
        setIsReceiveModalOpen(true);
    };

    const stats = [
        {
            label: 'Pending POs',
            value: procurementStats.pending,
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
        },
        {
            label: 'Active Orders',
            value: procurementStats.active,
            icon: Truck,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            label: 'Total Value',
            value: formatRwfCompact(procurementStats.totalValue),
            icon: ShoppingCart,
            color: 'text-teal-500',
            bg: 'bg-teal-50 dark:bg-teal-900/20',
        },
        {
            label: 'Total Orders',
            value: procurementStats.totalOrders,
            icon: FileText,
            color: 'text-rose-500',
            bg: 'bg-rose-50 dark:bg-rose-900/20',
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
            requireFacility
        >
            <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                { }
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-healthcare-dark dark:text-white tracking-tight">
                                Procurement & Orders
                            </h2>
                            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={cn(
                                        'px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all',
                                        activeTab === 'orders'
                                            ? 'bg-healthcare-primary text-white shadow-lg shadow-teal-500/20'
                                            : 'text-slate-500 hover:text-healthcare-primary',
                                    )}
                                >
                                    Purchase orders
                                </button>
                                <button
                                    onClick={() => setActiveTab('suppliers')}
                                    className={cn(
                                        'px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all',
                                        activeTab === 'suppliers'
                                            ? 'bg-healthcare-primary text-white shadow-lg shadow-teal-500/20'
                                            : 'text-slate-500 hover:text-healthcare-primary',
                                    )}
                                >
                                    Suppliers
                                </button>
                            </div>
                        </div>
                        {activeTab === 'orders' &&
                            user?.role?.toString()?.toLowerCase() !== 'auditor' && (
                                <div className="flex flex-wrap items-center gap-3">
                                    <select
                                        value={selectedSupplierId || ''}
                                        onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
                                        className="min-w-[220px] h-11 px-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-healthcare-primary"
                                    >
                                        <option value="">Select supplier to import</option>
                                        {suppliers.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={downloadTemplate}
                                        className="h-11 px-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-500 rounded-xl font-black text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] inline-flex items-center gap-2"
                                    >
                                        <Download size={16} />
                                        Template
                                    </button>
                                    <label className="cursor-pointer h-11 px-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-500 rounded-xl font-black text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] inline-flex items-center gap-2">
                                        {uploading ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <Upload size={16} />
                                        )}
                                        Import excel
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".xlsx, .xls"
                                            onChange={handleImport}
                                            disabled={uploading}
                                        />
                                    </label>
                                    <button
                                        onClick={() => setIsPOModalOpen(true)}
                                        className="h-11 px-5 bg-healthcare-primary text-white rounded-xl font-black text-xs hover:bg-teal-700 transition-all shadow-lg active:scale-[0.98] inline-flex items-center gap-2"
                                    >
                                        <Plus size={16} /> Create PO
                                    </button>
                                </div>
                            )}
                    </div>
                </div>

                {activeTab === 'orders' ? (
                    <>
                        { }
                        {loading ? (
                            <StatsSkeleton />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {stats.map((stat, i) => (
                                    <div
                                        key={i}
                                        className="glass-card min-h-[108px] p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4 shadow-sm"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                {stat.label}
                                            </p>
                                            <p className="mt-1 text-xl font-black text-healthcare-dark dark:text-white leading-none truncate">
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div
                                            className={cn(
                                                'w-12 h-12 shrink-0 rounded-xl flex items-center justify-center',
                                                stat.bg,
                                                stat.color,
                                            )}
                                        >
                                            <stat.icon size={22} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        { }
                        <div className="space-y-4">
                            <div className="flex flex-col xl:flex-row xl:items-center gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                                <div className="relative flex-1 w-full xl:min-w-[340px]">
                                    <SearchIcon
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        size={14}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search PO#, Supplier..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-10 pl-9 pr-4 bg-slate-50 dark:bg-slate-800 border-slate-200 focus:bg-white border-2 focus:border-healthcare-primary rounded-xl text-xs font-bold text-slate-900 dark:text-white transition-all outline-none"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap mr-1">
                                            Status
                                        </span>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value as typeof statusFilter);
                                                setPage(1);
                                            }}
                                            className="h-10 min-w-[150px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-3 text-xs font-black uppercase tracking-widest text-healthcare-dark dark:text-white focus:outline-none focus:border-healthcare-primary transition-all"
                                        >
                                            <option value="all">All status</option>
                                            <option value="draft">Draft</option>
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="partially_received">Partially received</option>
                                            <option value="backordered">Backordered</option>
                                            <option value="received">Received</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <div className="relative flex-1 sm:flex-none">
                                            <Calendar
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                size={14}
                                            />
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full sm:w-auto h-10 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border-slate-200 focus:bg-white border-2 focus:border-healthcare-primary rounded-xl text-[10px] font-black uppercase text-slate-900 dark:text-white transition-all outline-none"
                                            />
                                        </div>
                                        <span className="text-slate-400 font-black text-[10px] shrink-0">
                                            TO
                                        </span>
                                        <div className="relative flex-1 sm:flex-none">
                                            <Calendar
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                size={14}
                                            />
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full sm:w-auto h-10 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border-slate-200 focus:bg-white border-2 focus:border-healthcare-primary rounded-xl text-[10px] font-black uppercase text-slate-900 dark:text-white transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setStartDate('');
                                            setEndDate('');
                                            setStatusFilter('all');
                                        }}
                                        className="h-10 w-10 inline-flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
                                        title="Reset Filters"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        { }
                        <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                {loading ? (
                                    <SkeletonTable
                                        rows={5}
                                        columns={5}
                                        headers={['Order ID', 'Supplier', 'Amount', 'Status', 'Actions']}
                                        columnAligns={['left', 'left', 'left', 'left', 'right']}
                                        className="border-none shadow-none"
                                    />
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                    Order ID
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                    Supplier
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                    Status
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {orders.length > 0 ? (
                                                orders.map((order) => (
                                                    <tr
                                                        key={order.id}
                                                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-healthcare-dark dark:text-white text-sm leading-tight">
                                                                    PO-
                                                                    {order.id
                                                                        .toString()
                                                                        .padStart(4, '0')}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                                                    Date:{' '}
                                                                    {new Date(
                                                                        order.order_date,
                                                                    ).toLocaleDateString()}{' '}
                                                                    • {order.items_count} Items
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-slate-800 text-healthcare-primary border border-teal-100 dark:border-slate-700">
                                                                    <Truck size={14} />
                                                                </div>
                                                                <span className="text-xs font-bold text-healthcare-dark dark:text-white">
                                                                    {order.supplier?.name ||
                                                                        'Unknown Supplier'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm font-black text-healthcare-dark dark:text-white">
                                                                RWF{' '}
                                                                {order.total_amount.toLocaleString()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div
                                                                className={cn(
                                                                    'w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5',
                                                                    order.status.toUpperCase() ===
                                                                        'RECEIVED'
                                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                                    : [
                                                                            'ORDERED',
                                                                            'APPROVED',
                                                                            'CONFIRMED',
                                                                        ].includes(
                                                                            order.status.toUpperCase(),
                                                                        )
                                                                            ? 'bg-teal-50 text-teal-600 border border-teal-100'
                                                                            : order.status.toUpperCase() ===
                                                                                'PENDING'
                                                                                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                                                                : [
                                                                                    'PARTIAL',
                                                                                    'PARTIALLY_RECEIVED',
                                                                                    'BACKORDERED',
                                                                                ].includes(
                                                                                    order.status.toUpperCase(),
                                                                                )
                                                                                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                                                                    : order.status.toUpperCase() ===
                                                                                        'DRAFT'
                                                                                        ? 'bg-slate-100 text-slate-500 border border-slate-200'
                                                                                        : 'bg-red-50 text-red-600 border border-red-100',
                                                                )}
                                                            >
                                                                {order.status.toUpperCase() ===
                                                                    'RECEIVED' ? (
                                                                    <CheckCircle2 size={12} />
                                                                ) : order.status.toUpperCase() ===
                                                                    'PENDING' ? (
                                                                    <Clock size={12} />
                                                                ) : [
                                                                    'ORDERED',
                                                                    'APPROVED',
                                                                    'CONFIRMED',
                                                                ].includes(
                                                                    order.status.toUpperCase(),
                                                                ) ? (
                                                                    <CheckCircle2
                                                                        size={12}
                                                                        className="text-teal-500"
                                                                    />
                                                                ) : [
                                                                    'PARTIAL',
                                                                    'PARTIALLY_RECEIVED',
                                                                    'BACKORDERED',
                                                                ].includes(
                                                                    order.status.toUpperCase(),
                                                                ) ? (
                                                                    <Truck
                                                                        size={12}
                                                                        className="text-indigo-500"
                                                                    />
                                                                ) : order.status.toUpperCase() ===
                                                                    'DRAFT' ? (
                                                                    <FileText size={12} />
                                                                ) : (
                                                                    <XCircle size={12} />
                                                                )}
                                                                {toLabelCase(
                                                                    order.status.toUpperCase() ===
                                                                        'CONFIRMED'
                                                                        ? 'ordered'
                                                                        : order.status,
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {user?.role
                                                                    ?.toString()
                                                                    ?.toLowerCase() !== 'auditor' && (
                                                                        <>
                                                                            {order.status.toUpperCase() ===
                                                                                'DRAFT' && (
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleAction(
                                                                                                order.id,
                                                                                                'submit',
                                                                                            )
                                                                                        }
                                                                                        className="px-3 py-1 bg-teal-500 text-white rounded-lg text-[10px] font-black hover:bg-teal-600 transition-colors shadow-sm"
                                                                                    >
                                                                                        Submit
                                                                                    </button>
                                                                                )}
                                                                            {/* Internal approval removed as per new flow. Only supplier approves. */}
                                                                            {[
                                                                                'APPROVED',
                                                                                'CONFIRMED',
                                                                                'PARTIAL',
                                                                                'PARTIALLY_RECEIVED',
                                                                                'BACKORDERED',
                                                                                'ORDERED',
                                                                            ].includes(
                                                                                order.status.toUpperCase(),
                                                                            ) && (
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleReceiveClick(
                                                                                                order,
                                                                                            )
                                                                                        }
                                                                                        className="px-3 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-black hover:bg-amber-600 transition-colors shadow-sm"
                                                                                    >
                                                                                        Receive
                                                                                    </button>
                                                                                )}
                                                                            {[
                                                                                'DRAFT',
                                                                                'PENDING',
                                                                                'APPROVED',
                                                                            ].includes(
                                                                                order.status.toUpperCase(),
                                                                            ) && (
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleAction(
                                                                                                order.id,
                                                                                                'cancel',
                                                                                            )
                                                                                        }
                                                                                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                                                                        title="Cancel PO"
                                                                                    >
                                                                                        <XCircle size={16} />
                                                                                    </button>
                                                                                )}
                                                                        </>
                                                                    )}
                                                                <button
                                                                    onClick={() =>
                                                                        pharmacyService.exportProcurementOrder(
                                                                            order.id,
                                                                        )
                                                                    }
                                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                                                                    title="Export PO to Excel"
                                                                >
                                                                    <Download size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        navigate({
                                                                            to: `/app/procurement/orders/${order.id}`,
                                                                        })
                                                                    }
                                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                                                                    title="View Details"
                                                                >
                                                                    <ArrowUpRight size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-10 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <AlertCircle
                                                                size={32}
                                                                className="text-slate-300"
                                                            />
                                                            <span className="text-slate-500 font-bold italic">
                                                                No procurement orders found
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            pageSize={limit}
                            onPageChange={setPage}
                            loading={loading}
                        />
                    </>
                ) : (
                    <SuppliersTab />
                )}

                <CreatePurchaseOrderModal
                    isOpen={isPOModalOpen}
                    onClose={() => setIsPOModalOpen(false)}
                    onSuccess={fetchOrders}
                />

                <ImportPreviewModal
                    isOpen={isPreviewOpen}
                    onClose={() => {
                        setIsPreviewOpen(false);
                        setPreviewData(null);
                        setPendingFile(null);
                    }}
                    onConfirm={confirmImport}
                    items={previewData?.items || []}
                    totalAmount={previewData?.total_amount || 0}
                    loading={uploading}
                />

                <ReceiveOrderModal
                    isOpen={isReceiveModalOpen}
                    onClose={() => {
                        setIsReceiveModalOpen(false);
                        setSelectedOrder(null);
                    }}
                    onSuccess={fetchOrders}
                    order={selectedOrder}
                />
            </div>
        </ProtectedRoute>
    );
}

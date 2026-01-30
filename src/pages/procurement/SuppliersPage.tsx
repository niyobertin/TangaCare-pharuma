import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import {
    Search,
    Plus,
    MapPin,
    Phone,
    Mail,
    Edit,
    Trash2,
    Building,
    Globe,
    Briefcase,
    FileText,
    X,
} from 'lucide-react';
import { pharmacyService } from '../../services/pharmacy.service';
import type { Supplier } from '../../types/pharmacy';
import { TableSkeleton } from '../../components/shared/Skeleton';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

// Schema
const supplierSchema = yup.object({
    name: yup.string().required('Supplier Name is required'),
    contact_person: yup.string().required('Contact Person is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phone: yup.string().required('Phone is required'),
    address: yup.string().required('Address is required'),
    tax_id: yup.string().optional().default(''),
    is_active: yup.boolean().default(true),
});

export function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const response = await pharmacyService.getSuppliers();
            setSuppliers(response.data || []);
        } catch (error) {
            console.error('Failed to load suppliers:', error);
            // toast.error('Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const filteredSuppliers = suppliers.filter(
        (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.contact_person.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <ProtectedRoute
            allowedRoles={['admin', 'super_admin', 'store_manager', 'facility_admin']}
            requireFacility
        >
            <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-healthcare-dark">
                            Supplier Management
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Manage pharmaceutical suppliers and vendors
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingSupplier(null);
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-healthcare-primary text-white rounded-lg font-bold hover:bg-teal-700 transition-all shadow-md"
                    >
                        <Plus size={18} /> Add Supplier
                    </button>
                </div>

                {/* Content */}
                <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                    {/* Search */}
                    <div className="mb-6 max-w-md relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search suppliers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-healthcare-primary/20 border outline-none font-medium"
                        />
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-black text-slate-500 tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 rounded-l-xl">Supplier Info</th>
                                    <th className="px-6 py-4">Contact Details</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 rounded-r-xl text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8">
                                            <TableSkeleton rows={4} columns={4} />
                                        </td>
                                    </tr>
                                ) : filteredSuppliers.length > 0 ? (
                                    filteredSuppliers.map((supplier) => (
                                        <tr
                                            key={supplier.id}
                                            className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                        <Building size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-healthcare-dark">
                                                            {supplier.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                            <MapPin size={10} /> {supplier.address}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1 text-sm">
                                                    <p className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                                        <Briefcase
                                                            size={14}
                                                            className="text-slate-400"
                                                        />
                                                        {supplier.contact_person}
                                                    </p>
                                                    <p className="text-slate-500 flex items-center gap-2">
                                                        <Phone
                                                            size={14}
                                                            className="text-slate-400"
                                                        />{' '}
                                                        {supplier.phone}
                                                    </p>
                                                    <p className="text-slate-500 flex items-center gap-2">
                                                        <Mail
                                                            size={14}
                                                            className="text-slate-400"
                                                        />{' '}
                                                        {supplier.email}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${
                                                        supplier.is_active
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}
                                                >
                                                    {supplier.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingSupplier(supplier);
                                                            setShowModal(true);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-healthcare-primary hover:bg-slate-100 rounded-lg transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-12 text-center text-slate-500 font-medium"
                                        >
                                            No suppliers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <SupplierModal
                    supplier={editingSupplier}
                    onClose={() => {
                        setShowModal(false);
                        setEditingSupplier(null);
                    }}
                    onSuccess={() => {
                        fetchSuppliers();
                        setShowModal(false);
                        setEditingSupplier(null);
                    }}
                />
            )}
        </ProtectedRoute>
    );
}

function SupplierModal({
    supplier,
    onClose,
    onSuccess,
}: {
    supplier: Supplier | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(supplierSchema) as any,
        defaultValues: supplier || { is_active: true },
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            if (supplier) {
                await pharmacyService.updateSupplier(supplier.id, data);
                toast.success('Supplier updated');
            } else {
                await pharmacyService.createSupplier(data);
                toast.success('Supplier created');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to save supplier');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-black text-healthcare-dark">
                        {supplier ? 'Edit Supplier' : 'Add New Supplier'}
                    </h2>
                    <button onClick={onClose}>
                        <X className="text-slate-400 hover:text-red-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Name</label>
                            <input
                                {...register('name')}
                                className="input"
                                placeholder="Supplier Name"
                            />
                            {errors.name && <p className="error">{errors.name.message}</p>}
                        </div>
                        <div>
                            <label className="label">Contact Person</label>
                            <input
                                {...register('contact_person')}
                                className="input"
                                placeholder="Manager Name"
                            />
                            {errors.contact_person && (
                                <p className="error">{errors.contact_person.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Phone</label>
                            <input {...register('phone')} className="input" placeholder="+250..." />
                            {errors.phone && <p className="error">{errors.phone.message}</p>}
                        </div>
                        <div>
                            <label className="label">Email</label>
                            <input
                                {...register('email')}
                                className="input"
                                placeholder="supplier@example.com"
                            />
                            {errors.email && <p className="error">{errors.email.message}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="label">Address</label>
                        <textarea
                            {...register('address')}
                            className="input"
                            rows={2}
                            placeholder="Physical address"
                        />
                        {errors.address && <p className="error">{errors.address.message}</p>}
                    </div>
                    <div>
                        <label className="label">Tax ID (TIN)</label>
                        <input
                            {...register('tax_id')}
                            className="input"
                            placeholder="Tax Identification Number"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-3"
                        >
                            {isLoading
                                ? 'Saving...'
                                : supplier
                                  ? 'Update Supplier'
                                  : 'Create Supplier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

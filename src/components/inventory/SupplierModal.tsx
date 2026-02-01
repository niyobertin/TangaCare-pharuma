import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Building2, Phone, Mail, MapPin, Hash, Check, Loader2 } from 'lucide-react';
import { pharmacyService } from '../../services/pharmacy.service';
import type { Supplier } from '../../types/pharmacy';
import toast from 'react-hot-toast';

interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    supplier?: Supplier | null;
}

const supplierSchema = yup.object({
    name: yup.string().required('Company name is required'),
    contact_person: yup.string().required('Contact person is required'),
    phone: yup.string().required('Phone number is required'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    address: yup.string().required('Physical address is required'),
    tax_id: yup.string().optional().default(''),
    is_active: yup.boolean().default(true),
});

type SupplierFormData = yup.InferType<typeof supplierSchema>;

export function SupplierModal({ isOpen, onClose, onSuccess, supplier }: SupplierModalProps) {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SupplierFormData>({
        resolver: yupResolver(supplierSchema),
        defaultValues: {
            name: '',
            contact_person: '',
            phone: '',
            email: '',
            address: '',
            tax_id: '',
            is_active: true,
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (supplier) {
                reset({
                    name: supplier.name,
                    contact_person: supplier.contact_person,
                    phone: supplier.phone,
                    email: supplier.email,
                    address: supplier.address,
                    tax_id: supplier.tax_id || '',
                    is_active: supplier.is_active,
                });
            } else {
                reset({
                    name: '',
                    contact_person: '',
                    phone: '',
                    email: '',
                    address: '',
                    tax_id: '',
                    is_active: true,
                });
            }
        }
    }, [supplier, isOpen, reset]);

    if (!isOpen) return null;

    const onSubmit = async (data: SupplierFormData) => {
        setLoading(true);
        try {
            if (supplier?.id) {
                await pharmacyService.updateSupplier(supplier.id, data);
                toast.success('Partner updated successfully');
            } else {
                await pharmacyService.createSupplier(data);
                toast.success('Partner registered successfully');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to save supplier:', error);
            toast.error(error?.response?.data?.message || 'Failed to save partner information');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-teal-900/20 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-teal-500/10 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-teal-500/5 p-6 flex justify-between items-center border-b border-teal-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                            <Building2 className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-healthcare-dark">
                                {supplier ? 'Edit Partner' : 'Register New Partner'}
                            </h3>
                            <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest">
                                Supply Chain Network
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-healthcare-primary transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="space-y-4">
                        {/* Company Name */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                Company Name
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500" size={16} />
                                <input
                                    {...register('name')}
                                    type="text"
                                    placeholder="Enter company name"
                                    className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-2xl outline-none transition-all font-bold text-sm shadow-sm ${errors.name ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/10'
                                        }`}
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.name.message}</p>}
                        </div>

                        {/* Contact Person */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                Contact Person
                            </label>
                            <div className="relative">
                                <Check className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500" size={16} />
                                <input
                                    {...register('contact_person')}
                                    type="text"
                                    placeholder="Full name of contact person"
                                    className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-2xl outline-none transition-all font-bold text-sm shadow-sm ${errors.contact_person ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/10'
                                        }`}
                                />
                            </div>
                            {errors.contact_person && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.contact_person.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Phone */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500" size={16} />
                                    <input
                                        {...register('phone')}
                                        type="tel"
                                        placeholder="+254..."
                                        className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-2xl outline-none transition-all font-bold text-sm shadow-sm ${errors.phone ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/10'
                                            }`}
                                    />
                                </div>
                                {errors.phone && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.phone.message}</p>}
                            </div>

                            {/* Address */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                    physical Address
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500" size={16} />
                                    <input
                                        {...register('address')}
                                        type="text"
                                        placeholder="City, Building, Floor..."
                                        className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-2xl outline-none transition-all font-bold text-sm shadow-sm ${errors.address ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/10'
                                            }`}
                                    />
                                </div>
                                {errors.address && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.address.message}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500" size={16} />
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="partner@company.com"
                                    className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-2xl outline-none transition-all font-bold text-sm shadow-sm ${errors.email ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/10'
                                        }`}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.email.message}</p>}
                        </div>

                        {/* Tax ID */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                Tax Reg ID (Optional)
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500" size={16} />
                                <input
                                    {...register('tax_id')}
                                    type="text"
                                    placeholder="KRA PIN / VAT Number"
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-2xl outline-none transition-all font-bold text-sm shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-slate-100 dark:border-slate-800 text-slate-500 rounded-2xl font-black text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-healthcare-primary text-white rounded-2xl font-black text-sm hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/30 disabled:opacity-50 active:scale-[0.98] border-2 border-teal-600"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                            {supplier ? 'Update Partner Information' : 'Register New Partner'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

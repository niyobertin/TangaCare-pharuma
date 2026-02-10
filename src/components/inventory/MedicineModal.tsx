import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Pill, X, Save, Info } from 'lucide-react';
import { pharmacyService } from '../../services/pharmacy.service';
import type { Medicine, MedicineCategory } from '../../types/pharmacy';

interface MedicineModalProps {
    medicine?: Medicine;
    onClose: () => void;
    onSuccess: () => void;
}

const medicineSchema = yup.object({
    name: yup.string().required('Name is required'),
    brand_name: yup.string().optional(),
    code: yup.string().required('Code is required'),
    strength: yup.string().required('Strength is required'),
    dosage_form: yup.string().required('Dosage form is required'),
    unit: yup.string().required('Unit is required'),
    category_id: yup.number().optional(),
    cost_price: yup.number().min(0, 'Cannot be negative').required('Required'),
    selling_price: yup.number().min(0, 'Cannot be negative').required('Required'),
    is_controlled_drug: yup.boolean().default(false),
    allow_partial_sales: yup.boolean().default(false),
    units_per_package: yup.number().when('allow_partial_sales', {
        is: true,
        then: (schema) =>
            schema.min(1, 'Must be at least 1').required('Required for partial sales'),
        otherwise: (schema) => schema.optional(),
    }),
    base_unit: yup.string().when('allow_partial_sales', {
        is: true,
        then: (schema) => schema.required('Base unit is required (e.g. tablet)'),
        otherwise: (schema) => schema.optional(),
    }),
});

export function MedicineModal({ medicine, onClose, onSuccess }: MedicineModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<MedicineCategory[]>([]);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(medicineSchema) as any,
        defaultValues: medicine || {
            is_controlled_drug: false,
            allow_partial_sales: false,
            cost_price: 0,
            selling_price: 0,
        },
    });

    const allowPartialSales = watch('allow_partial_sales');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await pharmacyService.getCategories();
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            if (medicine?.id) {
                await pharmacyService.updateMedicine(medicine.id, data);
                toast.success('Medicine updated successfully');
            } else {
                await pharmacyService.createMedicine(data);
                toast.success('Medicine created successfully');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Operation failed:', error);
            toast.error(error?.response?.data?.message || 'Operation failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl my-8 animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-black text-healthcare-dark dark:text-white flex items-center gap-2">
                            <Pill size={24} className="text-healthcare-primary" />
                            {medicine ? 'Edit Medicine' : 'Add New Medicine'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Configure basic information and retail settings.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <section className="space-y-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-white mb-1">
                                        Medicine Name *
                                    </label>
                                    <input
                                        {...register('name')}
                                        placeholder="e.g. Paracetamol"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-healthcare-primary/20 focus:border-healthcare-primary text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.name.message as string}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-white mb-1">
                                        Brand Name
                                    </label>
                                    <input
                                        {...register('brand_name')}
                                        placeholder="e.g. Panadol"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-healthcare-primary/20 focus:border-healthcare-primary text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-white mb-1">
                                        System Code *
                                    </label>
                                    <input
                                        {...register('code')}
                                        placeholder="e.g. PARA-500"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-healthcare-primary/20 focus:border-healthcare-primary text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono uppercase"
                                    />
                                    {errors.code && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.code.message as string}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-white mb-1">
                                        Category
                                    </label>
                                    <select
                                        {...register('category_id')}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-healthcare-primary/20 focus:border-healthcare-primary text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    >
                                        <option value="">Uncategorized</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-white mb-1">
                                        Strength *
                                    </label>
                                    <input
                                        {...register('strength')}
                                        placeholder="e.g. 500mg"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-healthcare-primary/20 focus:border-healthcare-primary text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    />
                                    {errors.strength && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.strength.message as string}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-white mb-1">
                                        Dosage Form *
                                    </label>
                                    <select
                                        {...register('dosage_form')}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-healthcare-primary/20 focus:border-healthcare-primary text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    >
                                        <option value="">Select form...</option>
                                        <option value="Tablet">Tablet</option>
                                        <option value="Capsule">Capsule</option>
                                        <option value="Syrup">Syrup</option>
                                        <option value="Injection">Injection</option>
                                        <option value="Cream">Cream</option>
                                        <option value="Ointment">Ointment</option>
                                        <option value="Drops">Drops</option>
                                        <option value="Inhaler">Inhaler</option>
                                        <option value="Suppository">Suppository</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.dosage_form && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.dosage_form.message as string}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                Pricing & Packaging
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-white mb-1">
                                        Package Unit *
                                    </label>
                                    <input
                                        {...register('unit')}
                                        placeholder="e.g. Box, Bottle"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-healthcare-primary/20 focus:border-healthcare-primary text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    />
                                    {errors.unit && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.unit.message as string}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-white mb-1">
                                        Cost Price (per Unit) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('cost_price')}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-healthcare-primary/20 focus:border-healthcare-primary text-sm font-bold bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-white mb-1">
                                        Selling Price (per Unit) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('selling_price')}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-healthcare-primary/20 focus:border-healthcare-primary text-sm font-bold bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black text-healthcare-primary uppercase tracking-widest">
                                        Partial Sales Support
                                    </h3>
                                    <div className="group relative">
                                        <Info size={14} className="text-slate-400 cursor-help" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                            Enable this to allow selling individual units (e.g.
                                            pills) from a larger package (e.g. box).
                                        </div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        {...register('allow_partial_sales')}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-healthcare-primary"></div>
                                </label>
                            </div>

                            {allowPartialSales && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-white mb-1">
                                            Units per Package *
                                        </label>
                                        <input
                                            type="number"
                                            {...register('units_per_package')}
                                            placeholder="e.g. 10"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-healthcare-primary/20 focus:border-healthcare-primary text-sm font-bold bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                        />
                                        {errors.units_per_package && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.units_per_package.message as string}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-white mb-1">
                                            Base Unit *
                                        </label>
                                        <input
                                            {...register('base_unit')}
                                            placeholder="e.g. tablet, pill, ml"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-healthcare-primary/20 focus:border-healthcare-primary text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                        />
                                        {errors.base_unit && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.base_unit.message as string}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>

                        <div className="flex items-center gap-4 pt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register('is_controlled_drug')}
                                    className="w-4 h-4 rounded border-2 border-slate-300 text-healthcare-primary focus:ring-healthcare-primary transition-all"
                                />
                                <span className="text-sm font-bold text-slate-700 dark:text-white">
                                    Controlled Drug
                                </span>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-[2] py-3 bg-healthcare-primary text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                                ) : (
                                    <>
                                        <Save size={18} />
                                        <span>
                                            {medicine ? 'Update Medicine' : 'Create Medicine'}
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

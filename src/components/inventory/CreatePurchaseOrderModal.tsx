import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Plus, ShoppingCart, Search, Loader2 } from 'lucide-react';
import { pharmacyService } from '../../services/pharmacy.service';
import type { Supplier, Medicine } from '../../types/pharmacy';
import toast from 'react-hot-toast';

interface CreatePurchaseOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialItem?: {
        medicine_id: number;
        medicine_name: string;
        quantity: number;
    } | null;
}

const poItemSchema = yup.object({
    medicine_id: yup.number().positive('Required').required('Required'),
    medicine_name: yup.string().required(),
    quantity: yup.number().min(1, 'Min 1').required('Required'),
    unit_price: yup.number().min(0, 'Min 0').required('Required'),
});

const poSchema = yup.object({
    supplier_id: yup
        .number()
        .positive('Please select a supplier')
        .required('Please select a supplier'),
    expected_delivery_date: yup.string().optional(),
    items: yup.array().of(poItemSchema).min(1, 'Please add at least one item').required(),
});

type POFormData = {
    supplier_id: number;
    expected_delivery_date?: string;
    items: Array<{
        medicine_id: number;
        medicine_name: string;
        quantity: number;
        unit_price: number;
    }>;
};

export function CreatePurchaseOrderModal({
    isOpen,
    onClose,
    onSuccess,
    initialItem,
}: CreatePurchaseOrderModalProps) {
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const {
        register,
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<POFormData>({
        resolver: yupResolver(poSchema) as any,
        defaultValues: {
            supplier_id: 0,
            expected_delivery_date: '',
            items: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    const watchItems = watch('items') || [];
    const medicineById = useMemo(
        () => new Map(medicines.map((medicine) => [medicine.id, medicine])),
        [medicines],
    );

    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                try {
                    const [sRes, mRes] = await Promise.all([
                        pharmacyService.getSuppliers({ limit: 100 }),
                        pharmacyService.getMedicines({ limit: 100 }),
                    ]);
                    setSuppliers(sRes.data || []);
                    const fetchedMedicines = mRes.data || [];
                    setMedicines(fetchedMedicines);

                    // Handle initial item if present
                    if (initialItem) {

                        reset({
                            supplier_id: 0,
                            expected_delivery_date: '',
                            items: [
                                {
                                    medicine_id: initialItem.medicine_id,
                                    medicine_name: initialItem.medicine_name,
                                    quantity: initialItem.quantity,
                                    unit_price: 0,
                                },
                            ],
                        });
                    } else {
                        reset({ supplier_id: 0, expected_delivery_date: '', items: [] });
                    }
                } catch (error) {
                    console.error('Failed to load PO data:', error);
                    toast.error('Failed to load suppliers and medicines');
                }
            };
            loadData();
        }
    }, [isOpen, reset, initialItem]);

    if (!isOpen) return null;

    const addItem = (med: Medicine) => {
        if (watchItems.find((i) => i.medicine_id === med.id)) {
            toast.error('Item already added to order');
            return;
        }
        append({
            medicine_id: med.id,
            medicine_name: med.name,
            quantity: 1,
            unit_price: Number(med.cost_price || 0),
        });
    };

    const onSubmit = async (data: POFormData) => {
        setLoading(true);
        try {
            await pharmacyService.createProcurementOrder({
                supplier_id: data.supplier_id,
                expected_delivery_date: data.expected_delivery_date || undefined,
                items: data.items.map((i) => ({
                    medicine_id: i.medicine_id,
                    quantity_ordered: i.quantity,
                    unit_price: i.unit_price,
                })),
            });
            toast.success('Purchase Order generated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to create PO:', error);
            toast.error(error?.response?.data?.message || 'Failed to create Purchase Order');
        } finally {
            setLoading(false);
        }
    };

    const filteredMedicines = medicines.filter(
        (m) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.code.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const totalAmount = watchItems.reduce((acc, i) => acc + i.quantity * i.unit_price, 0);
    const hasCostAboveSelling = watchItems.some((item) => {
        const medicine = medicineById.get(Number(item.medicine_id));
        if (!medicine) return false;
        return Number(item.unit_price || 0) > Number(medicine.selling_price || 0);
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-teal-900/20 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[100dvh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-teal-500/10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                { }
                <div className="bg-teal-500/5 p-4 sm:p-6 flex justify-between items-center border-b border-teal-500/10">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                            <ShoppingCart className="text-white" size={20} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-black text-healthcare-dark truncate">
                                New Purchase Order
                            </h3>
                            <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest truncate">
                                Inventory Replenishment
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 inline-flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-healthcare-primary transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 pb-24 sm:pb-6">
                    { }
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                Supplier / Partner
                            </label>
                            <select
                                {...register('supplier_id')}
                                className={`w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-2xl outline-none transition-all font-bold text-sm ${errors.supplier_id
                                    ? 'border-red-500 focus:ring-red-500/10'
                                    : 'border-transparent focus:border-teal-500/20 focus:bg-white dark:focus:bg-slate-800'
                                    }`}
                            >
                                <option value="0">Select a supplier...</option>
                                {suppliers.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            {errors.supplier_id && (
                                <p className="text-red-500 text-[10px] font-bold ml-1">
                                    {errors.supplier_id.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                Expected Delivery (Optional)
                            </label>
                            <input
                                type="date"
                                {...register('expected_delivery_date')}
                                className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none transition-all font-bold text-sm"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                Search Medicines
                            </label>
                            <div className="relative">
                                <Search
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500"
                                    size={16}
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or code..."
                                    className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none transition-all font-bold text-sm"
                                />
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 h-[220px] sm:h-[300px] overflow-y-auto p-2 space-y-1">
                                {filteredMedicines.map((med) => (
                                    <button
                                        key={med.id}
                                        onClick={() => addItem(med)}
                                        className="w-full flex items-center justify-between p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all group border border-transparent hover:border-teal-500/10"
                                    >
                                        <div className="text-left">
                                            <p className="text-xs font-black text-healthcare-dark">
                                                {med.name}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">
                                                {med.code}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-bold mt-1">
                                                Sell: RWF {Number(med.selling_price || 0).toLocaleString()} | Cost:
                                                {' '}RWF {Number(med.cost_price || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-1.5 bg-teal-50 text-teal-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                            <Plus size={14} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    { }
                    <div className="flex flex-col h-full space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                            Order items ({fields.length})
                        </label>
                        <div
                            className={`flex-1 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border overflow-y-auto p-4 space-y-3 ${errors.items
                                ? 'border-red-500'
                                : 'border-slate-100 dark:border-slate-800'
                                }`}
                        >
                            {fields.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                                    <ShoppingCart size={32} className="opacity-20" />
                                    <p className="text-xs font-bold italic">No items added yet</p>
                                </div>
                            ) : (
                                fields.map((field, index) => {
                                    const selectedMedicine = medicineById.get(
                                        Number(watchItems[index]?.medicine_id || field.medicine_id),
                                    );
                                    const sellingPrice = Number(selectedMedicine?.selling_price || 0);
                                    const currentCost = Number(watchItems[index]?.unit_price || 0);
                                    const isCostAboveSelling = currentCost > sellingPrice;

                                    return (
                                        <div
                                            key={field.id}
                                        className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2"
                                        >
                                            <div className="flex justify-between items-start">
                                                <p className="text-xs font-black text-healthcare-dark">
                                                    {field.medicine_name}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors touch-manipulation"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded-md text-[10px] font-black uppercase tracking-wider">
                                                    Selling: RWF {sellingPrice.toLocaleString()}
                                                </span>
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-wider">
                                                    Last Cost: RWF {Number(selectedMedicine?.cost_price || 0).toLocaleString()}
                                                </span>
                                            </div>
                                            {isCostAboveSelling && (
                                                <p className="text-[10px] font-black text-red-600">
                                                    Unit cost is above current selling price. Update medicine selling price
                                                    first to avoid below-cost sale errors.
                                                </p>
                                            )}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                                                        Qty
                                                    </p>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        {...register(`items.${index}.quantity`)}
                                                        className={`w-full h-10 px-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-bold transition-all ${errors.items?.[index]?.quantity
                                                            ? 'border-red-500'
                                                            : 'focus:border-teal-500 font-bold'
                                                            }`}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                                                        Unit Cost
                                                    </p>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        {...register(`items.${index}.unit_price`)}
                                                        className={`w-full h-10 px-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-bold transition-all ${errors.items?.[index]?.unit_price
                                                            ? 'border-red-500'
                                                            : 'focus:border-teal-500 font-bold'
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        {errors.items && (
                            <p className="text-red-500 text-[10px] font-bold text-center">
                                {errors.items.message}
                            </p>
                        )}

                        {hasCostAboveSelling && (
                            <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                                <p className="text-[10px] font-black text-red-600 text-center">
                                    Fix items where Unit Cost is above Selling Price before creating PO.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="sticky bottom-0 border-t border-teal-500/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-4 sm:p-6 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                        <span className="text-[10px] font-black uppercase text-teal-600 tracking-widest">
                            Total Amount
                        </span>
                        <span className="text-base sm:text-lg font-black text-healthcare-dark dark:text-white">
                            RWF {totalAmount.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-11 px-4 w-full sm:w-auto border border-slate-200 dark:border-slate-700 rounded-xl font-black text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all touch-manipulation"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            disabled={loading || fields.length === 0 || hasCostAboveSelling}
                            className="h-11 px-5 w-full sm:w-auto flex items-center justify-center gap-2 bg-healthcare-primary text-white rounded-xl font-black text-xs hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 active:scale-[0.98] touch-manipulation"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                            Generate Purchase Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

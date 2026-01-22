import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { X, CheckCircle, AlertTriangle, Calendar, Package } from 'lucide-react';
import { pharmacyService } from '../../services/pharmacy.service';
import type { ProcurementOrder } from '../../types/pharmacy';

interface ReceiveOrderModalProps {
    order: ProcurementOrder;
    onClose: () => void;
    onSuccess: () => void;
}

const receiveSchema = yup.object({
    items: yup.array().of(
        yup.object({
            id: yup.number().required(), // Detail ID or Item ID
            medicine_id: yup.number().required(),
            quantity_received: yup.number().min(1, 'Min 1').required('Required'),
            batch_number: yup.string().required('Batch # is required'),
            expiry_date: yup.string().required('Expiry is required'),
        })
    ).required()
});

export function ReceiveOrderModal({ order, onClose, onSuccess }: ReceiveOrderModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(receiveSchema),
        defaultValues: {
            items: order.items?.map(item => ({
                id: item.id,
                medicine_id: item.medicine_id,
                quantity_received: item.quantity_ordered,
                batch_number: '',
                expiry_date: ''
            })) || []
        }
    });

    const { fields } = useFieldArray({
        control,
        name: 'items'
    });

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await pharmacyService.receiveProcurementOrder(order.id, {
                items: data.items
            });
            toast.success('Order received and stock updated');
            onSuccess();
        } catch (error: any) {
            console.error('Receive failed:', error);
            toast.error(error?.response?.data?.message || 'Failed to receive order');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-healthcare-dark flex items-center gap-2">
                            <CheckCircle size={20} className="text-healthcare-primary" />
                            Receive Order #{order.order_number}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Enter batch details for stock entry</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="receive-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="border rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Item</th>
                                        <th className="px-4 py-3">Ordered Qty</th>
                                        <th className="px-4 py-3 w-[20%]">Received Qty</th>
                                        <th className="px-4 py-3 w-[25%]">Batch Number</th>
                                        <th className="px-4 py-3 w-[20%]">Expiry Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {fields.map((field, index) => {
                                        const originalItem = order.items?.find(i => i.id === field.id);
                                        return (
                                            <tr key={field.id} className="group hover:bg-slate-50/50">
                                                <td className="p-4 font-medium text-slate-700">
                                                    {originalItem?.medicine?.name}
                                                    <span className="block text-xs text-slate-400 font-normal">
                                                        {originalItem?.medicine?.strength}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-bold text-slate-600">
                                                    {originalItem?.quantity_ordered}
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        {...register(`items.${index}.quantity_received`)}
                                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-healthcare-primary/20 bg-white"
                                                    />
                                                    {errors.items?.[index]?.quantity_received && <p className="text-red-500 text-[10px]">{errors.items[index]?.quantity_received?.message}</p>}
                                                </td>
                                                <td className="p-2">
                                                    <div className="relative">
                                                        <Package size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input
                                                            type="text"
                                                            {...register(`items.${index}.batch_number`)}
                                                            className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-healthcare-primary/20 bg-white uppercase font-mono text-xs"
                                                            placeholder="BATCH-001"
                                                        />
                                                    </div>
                                                    {errors.items?.[index]?.batch_number && <p className="text-red-500 text-[10px] mt-1">{errors.items[index]?.batch_number?.message}</p>}
                                                </td>
                                                <td className="p-2">
                                                    <div className="relative">
                                                        <input
                                                            type="date"
                                                            {...register(`items.${index}.expiry_date`)}
                                                            className="w-full pl-3 pr-2 py-2 border rounded-lg focus:ring-2 focus:ring-healthcare-primary/20 bg-white text-xs"
                                                        />
                                                    </div>
                                                    {errors.items?.[index]?.expiry_date && <p className="text-red-500 text-[10px] mt-1">{errors.items[index]?.expiry_date?.message}</p>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="receive-form"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-healthcare-primary text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" /> : <CheckCircle size={18} />}
                        Confirm Receipt
                    </button>
                </div>
            </div>
        </div>
    );
}

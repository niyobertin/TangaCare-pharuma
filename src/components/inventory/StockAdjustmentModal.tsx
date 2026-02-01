import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { pharmacyService } from '../../services/pharmacy.service';
import type { Batch } from '../../types/pharmacy';
import {
    X,
    ArrowDownWideNarrow,
    AlertTriangle,
    ArrowUpCircle,
    ArrowDownCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface StockAdjustmentModalProps {
    batch: Batch;
    onClose: () => void;
    onSuccess: () => void;
}

const adjustmentSchema = yup.object({
    type: yup.string().oneOf(['increase', 'decrease', 'damage', 'expired', 'return']).required(),
    quantity: yup.number().min(1, 'Quantity must be at least 1').required('Required'),
    reason: yup.string().required('Reason is required').min(5, 'Reason must be detailed'),
});

export function StockAdjustmentModal({ batch, onClose, onSuccess }: StockAdjustmentModalProps) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(adjustmentSchema),
        defaultValues: {
            type: 'decrease',
            quantity: 1,
        },
    });

    const adjustmentType = watch('type');

    const onSubmit = async (data: any) => {
        if (!user?.facility_id) {
            toast.error('User facility not found');
            return;
        }

        // Validate decrease
        if (['decrease', 'damage', 'expired'].includes(data.type)) {
            if (data.quantity > batch.current_quantity) {
                toast.error(`Cannot remove more than available stock (${batch.current_quantity})`);
                return;
            }
        }

        setIsLoading(true);
        try {
            await pharmacyService.adjustStock({
                facility_id: user.facility_id,
                batch_id: batch.id,
                type: data.type,
                quantity: data.quantity,
                reason: data.reason,
            });
            toast.success('Stock adjusted successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Adjustment failed:', error);
            toast.error(error?.response?.data?.message || 'Adjustment failed');
        } finally {
            setIsLoading(false);
        }
    };

    const getTypeIcon = () => {
        switch (adjustmentType) {
            case 'increase':
                return <ArrowUpCircle className="text-green-500" />;
            case 'return':
                return <ArrowUpCircle className="text-blue-500" />;
            case 'decrease':
                return <ArrowDownCircle className="text-amber-500" />;
            default:
                return <AlertTriangle className="text-red-500" />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-black text-healthcare-dark flex items-center gap-2">
                            <ArrowDownWideNarrow size={20} className="text-healthcare-primary" />
                            Adjust Stock
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Batch:{' '}
                            <span className="font-mono bg-slate-100 px-1 rounded">
                                {batch.batch_number}
                            </span>
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
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Current Info */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm flex justify-between items-center">
                            <span className="text-slate-500 font-bold">Current Quantity</span>
                            <span className="text-xl font-black text-healthcare-dark">
                                {batch.current_quantity}
                            </span>
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                Adjustment Type
                            </label>
                            <div className="relative">
                                <select
                                    {...register('type')}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-healthcare-primary/20 focus:border-healthcare-primary text-sm font-medium bg-white appearance-none"
                                >
                                    <option value="decrease">Standard Decrease (Correction)</option>
                                    <option value="increase">Standard Increase (Correction)</option>
                                    <option value="damage">Damaged / Broken</option>
                                    <option value="expired">Expired</option>
                                    <option value="return">Customer Return</option>
                                </select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    {getTypeIcon()}
                                </div>
                            </div>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                Quantity
                            </label>
                            <input
                                type="number"
                                {...register('quantity')}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-healthcare-primary/20 focus:border-healthcare-primary text-sm font-bold"
                            />
                            {errors.quantity && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.quantity.message}
                                </p>
                            )}
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                Reason / Notes
                            </label>
                            <textarea
                                {...register('reason')}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-healthcare-primary/20 focus:border-healthcare-primary text-sm"
                                rows={2}
                                placeholder="Explain why this adjustment is being made..."
                            />
                            {errors.reason && (
                                <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-healthcare-primary text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                            ) : (
                                <span>Save Adjustment</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

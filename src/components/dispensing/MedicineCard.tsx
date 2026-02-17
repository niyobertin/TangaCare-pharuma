import React from 'react';
import type { Medicine } from '../../types/pharmacy';
import { Calendar, AlertTriangle, AlertCircle, MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import { useMedicineStock } from '../../hooks/useMedicineStock';

interface MedicineCardProps {
    medicine: Medicine;
    onAddToCart: (medicine: Medicine) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, onAddToCart }) => {
    const { nearestExpiry, storageLocation, isLoading } = useMedicineStock(medicine.id);

    const isLowStock = (medicine.stock_quantity || 0) < 10;
    const isExpired = !!nearestExpiry && new Date(nearestExpiry) <= new Date();
    const isNearExpiry = !!nearestExpiry && !isExpired &&
        new Date(nearestExpiry) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    return (
        <div className={clsx(
            "relative group flex flex-col bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden",
            isExpired ? "border-red-200 dark:border-red-900/50" :
                isNearExpiry ? "border-amber-200 dark:border-amber-900/50" :
                    "border-slate-200 dark:border-slate-700"
        )}>
            {/* Top Status Bar */}
            {(isLowStock || isNearExpiry || isExpired) && (
                <div className={clsx(
                    "absolute top-0 inset-x-0 h-1",
                    isExpired ? "bg-red-500" :
                        isNearExpiry ? "bg-amber-500" :
                            "bg-rose-500"
                )} />
            )}

            <div className="p-4 flex-1 flex flex-col gap-3">
                {/* Header */}
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1" title={medicine.name}>
                            {medicine.name}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-0.5">
                            {medicine.strength} • {medicine.dosage_form}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-sm font-black text-healthcare-primary">
                                RWF {Number(medicine.selling_price || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">/ {medicine.unit}</span>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                    {/* Stock */}
                    <div className={clsx(
                        "flex items-center gap-2 p-2 rounded-lg border",
                        isLowStock
                            ? "bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400"
                            : "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                    )}>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold leading-none">{medicine.stock_quantity || 0} Left</span>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 p-2 rounded-lg border bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400">
                        <MapPin size={14} className="shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold leading-none">
                                {isLoading ? "..." : storageLocation || "N/A"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Expiry Warning */}
                <div className={clsx(
                    "flex items-center gap-2 p-2 rounded-lg border mt-auto",
                    isExpired
                        ? "bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                        : isNearExpiry
                            ? "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
                            : "bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                )}>
                    {isExpired || isNearExpiry ? <AlertTriangle size={14} className="shrink-0" /> : <Calendar size={14} className="shrink-0" />}
                    <div className="flex flex-col">
                        <span className="text-[10px] opacity-70 font-semibold uppercase">
                            {isExpired ? "Expired" : isNearExpiry ? "Expiring Soon" : "Nearest Expiry"}
                        </span>
                        <span className="text-xs font-bold leading-none">
                            {isLoading ? "..." : nearestExpiry ? new Date(nearestExpiry).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <button
                    onClick={() => onAddToCart(medicine)}
                    disabled={!medicine.stock_quantity || medicine.stock_quantity <= 0 || isExpired}
                    className={clsx(
                        "w-full py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2",
                        !medicine.stock_quantity || medicine.stock_quantity <= 0 || isExpired
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600"
                            : "bg-white border-2 border-healthcare-primary text-healthcare-primary hover:bg-healthcare-primary hover:text-white dark:bg-slate-700 dark:border-healthcare-primary dark:text-healthcare-primary dark:hover:bg-healthcare-primary dark:hover:text-white"
                    )}
                >
                    {isExpired ? (
                        <>
                            <AlertCircle size={16} />
                            Expired
                        </>
                    ) : !medicine.stock_quantity || medicine.stock_quantity <= 0 ? (
                        "Out of Stock"
                    ) : (
                        <>
                            Add to Cart
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

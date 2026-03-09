import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, PackageCheck, User, CalendarDays, FileText } from 'lucide-react';
import { pharmacyService } from '../../services/pharmacy.service';
import type { GoodsReceipt } from '../../types/pharmacy';
import toast from 'react-hot-toast';

export function ViewGoodsReceiptPage() {
    const { receiptId } = useParams({ from: '/app/procurement/receipts/$receiptId' });
    const navigate = useNavigate();
    const [receipt, setReceipt] = useState<GoodsReceipt | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                const data = await pharmacyService.getGoodsReceipt(Number(receiptId));
                setReceipt(data);
            } catch (error) {
                console.error('Failed to load goods receipt', error);
                toast.error('Failed to load goods receipt');
                navigate({ to: '/app/procurement/receipts' as any, search: {} as any });
            } finally {
                setLoading(false);
            }
        };
        fetchReceipt();
    }, [navigate, receiptId]);

    const summary = useMemo(() => {
        const items = receipt?.items || [];
        const totalUnits = items.reduce((sum, item) => sum + Number(item.quantity_received || 0), 0);
        const totalValue = items.reduce(
            (sum, item) => sum + Number(item.quantity_received || 0) * Number(item.unit_cost || 0),
            0,
        );
        return { totalUnits, totalValue };
    }, [receipt]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[380px]">
                <div className="w-12 h-12 border-4 border-healthcare-primary/20 border-t-healthcare-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!receipt) return null;

    return (
        <div className="p-5 md:p-8 space-y-6">
            <button
                onClick={() =>
                    navigate({
                        to: '/app/procurement/receipts' as any,
                        search: {} as any,
                    })
                }
                className="inline-flex items-center gap-2 text-slate-500 hover:text-healthcare-primary text-sm font-bold"
            >
                <ArrowLeft size={16} />
                Back to Goods Receipts
            </button>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-healthcare-dark dark:text-white flex items-center gap-2">
                            <PackageCheck size={22} className="text-emerald-500" />
                            {receipt.receipt_number || `GR-${receipt.id}`}
                        </h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                            Goods Receipt
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold">
                            <CalendarDays size={14} />
                            {receipt.received_date ? new Date(receipt.received_date).toLocaleString() : 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold">
                            <User size={14} />
                            {receipt.received_by?.first_name || receipt.received_by?.email || `User #${receipt.received_by_id}`}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold">
                            <FileText size={14} />
                            PO: {receipt.purchase_order?.order_number || `PO-${receipt.purchase_order_id}`}
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 font-bold">
                            Supplier: {receipt.purchase_order?.supplier?.name || 'N/A'}
                        </div>
                    </div>
                </div>
                {receipt.notes && (
                    <div className="mt-4 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-sm text-slate-600 dark:text-slate-300">
                        {receipt.notes}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Units</p>
                    <p className="text-2xl font-black text-healthcare-dark dark:text-white mt-1">{summary.totalUnits}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estimated Value</p>
                    <p className="text-2xl font-black text-healthcare-primary mt-1">
                        RWF {summary.totalValue.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Medicine</th>
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Batch</th>
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Expiry</th>
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Qty</th>
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Unit Cost</th>
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Line Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {(receipt.items || []).map((item) => {
                                const lineTotal = Number(item.quantity_received || 0) * Number(item.unit_cost || 0);
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                        <td className="px-5 py-4 text-sm font-bold text-healthcare-dark dark:text-white">
                                            {item.medicine?.name || `Medicine #${item.medicine_id}`}
                                        </td>
                                        <td className="px-5 py-4 text-xs font-bold text-slate-500">
                                            {item.batch_number || item.batch?.batch_number || '-'}
                                        </td>
                                        <td className="px-5 py-4 text-xs font-bold text-slate-500">
                                            {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-5 py-4 text-sm font-black text-right text-healthcare-dark dark:text-white">
                                            {Number(item.quantity_received || 0).toLocaleString()}
                                        </td>
                                        <td className="px-5 py-4 text-sm font-bold text-right text-slate-500">
                                            RWF {Number(item.unit_cost || 0).toLocaleString()}
                                        </td>
                                        <td className="px-5 py-4 text-sm font-black text-right text-healthcare-primary">
                                            RWF {lineTotal.toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

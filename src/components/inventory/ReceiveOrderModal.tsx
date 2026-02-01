import { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, Package } from 'lucide-react';
import { pharmacyService } from '../../services/pharmacy.service';
import type { ProcurementOrder } from '../../types/pharmacy';
import toast from 'react-hot-toast';
import * as yup from 'yup';

interface ReceiveOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    order: ProcurementOrder | null;
}

export function ReceiveOrderModal({ isOpen, onClose, onSuccess, order }: ReceiveOrderModalProps) {
    const [loading, setLoading] = useState(false);
    const [receivedItems, setReceivedItems] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && order) {
            setReceivedItems(order.items?.map(item => ({
                id: item.id,
                medicine_name: item.medicine?.name,
                quantity_ordered: item.quantity_ordered,
                quantity_received: item.quantity_ordered - (item.quantity_received || 0),
                batch_number: '',
                expiry_date: '',
                manufacturing_date: '',
            })) || []);
        }
    }, [isOpen, order]);

    if (!isOpen || !order) return null;

    const handleItemChange = (index: number, field: string, value: any) => {
        const updated = [...receivedItems];
        updated[index] = { ...updated[index], [field]: value };
        setReceivedItems(updated);
    };

    const handleClearAll = () => {
        setReceivedItems(prev => prev.map(item => ({ ...item, quantity_received: 0 })));
    };

    const handleSubmit = async () => {
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Identify items we INTEND to receive (qty > 0)
        const attemptedItems = receivedItems.filter(i => i.quantity_received > 0);

        if (attemptedItems.length === 0) {
            toast.error('Please enter a quantity to receive for at least one item.');
            return;
        }

        // Schema Validation
        const itemSchema = yup.object().shape({
            quantity_received: yup.number(),
            batch_number: yup.string().required('Batch Number is required'),
            expiry_date: yup.string()
                .required('Expiry Date is required')
                .test('is-future', 'Expiry date must be in the future', (val) => {
                    return !!val && val > todayStr;
                })
                .test('after-mfg', 'Expiry date must be after Mfg Date', function (val) {
                    const { manufacturing_date } = this.parent;
                    if (!val || !manufacturing_date) return true;
                    return val > manufacturing_date;
                }),
            manufacturing_date: yup.string().nullable().optional()
        });

        const validItems: any[] = [];
        const skippedItems: any[] = [];

        // 2. Validate items
        for (const item of attemptedItems) {
            try {
                itemSchema.validateSync(item);
                validItems.push(item);
            } catch (err: any) {
                // Capture reason
                skippedItems.push({
                    ...item,
                    reason: err.message
                });
            }
        }

        if (validItems.length === 0) {
            const firstError = skippedItems[0]?.reason || 'Invalid details';
            toast.error(`No valid items to receive. ${firstError}`);
            return;
        }

        if (skippedItems.length > 0) {
            const reasons = [...new Set(skippedItems.map(i => i.reason))].join(', ');
            toast(`Skipping ${skippedItems.length} invalid item(s). ${reasons}`, {
                icon: '⚠️',
                duration: 5000
            });
        }

        setLoading(true);
        try {
            const response = await pharmacyService.receiveProcurementOrder(order.id, {
                received_items: validItems.map(i => ({
                    item_id: i.id,
                    quantity_received: Number(i.quantity_received),
                    batch_number: i.batch_number,
                    expiry_date: i.expiry_date,
                    manufacturing_date: i.manufacturing_date || undefined
                })),
                received_date: new Date().toISOString().split('T')[0]
            });

            const skippedBackend = response.skippedItems || [];

            if (skippedBackend.length > 0) {
                toast('Received most items, but skipped ' + skippedBackend.length + ' duplicates.', {
                    icon: 'ℹ️',
                    duration: 5000
                });

                // Optional: Show list of skipped batches in a separate toast or log
                const skippedDetails = skippedBackend.map((s: any) => `${s.medicine_name} (${s.batch_number})`).join(', ');
                toast.error(`Existing Batches Skipped: ${skippedDetails}`, { duration: 6000 });
            } else {
                toast.success(`Successfully received ${validItems.length} item(s)`);
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to receive order:', error);
            toast.error(error?.response?.data?.message || 'Failed to update inventory');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <Package size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-healthcare-dark">Receive Inventory</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Record goods receipt for PO-{order.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-b border-amber-100 dark:border-amber-800/30 text-xs flex justify-between items-center px-6">
                    <span className="font-bold flex items-center gap-2">
                        <CheckCircle2 size={14} />
                        Only items with a quantity greater than 0 will be received.
                    </span>
                    <button
                        onClick={handleClearAll}
                        className="text-[10px] font-black uppercase bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors"
                    >
                        Clear All Quantities
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-100 dark:border-slate-800">
                                <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Medicine</th>
                                <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center px-2">Ordered</th>
                                <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center px-2">Receiving</th>
                                <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Batch Details</th>
                                <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Dates</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {receivedItems.map((item, idx) => {
                                const isReceiving = item.quantity_received > 0;
                                const isMissingInfo = isReceiving && (!item.batch_number || !item.expiry_date);

                                return (
                                    <tr key={idx} className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors align-top ${isMissingInfo ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                        <td className="py-4 px-2">
                                            <div className="font-bold text-healthcare-dark text-sm">{item.medicine_name}</div>
                                            {isMissingInfo && <span className="text-[10px] text-red-500 font-bold animate-pulse">Missing details</span>}
                                        </td>
                                        <td className="py-4 px-2 text-center text-sm font-black text-slate-400">
                                            {item.quantity_ordered}
                                        </td>
                                        <td className="py-4 px-2">
                                            <input
                                                type="number"
                                                value={item.quantity_received}
                                                onChange={(e) => handleItemChange(idx, 'quantity_received', Number(e.target.value))}
                                                className="w-20 px-2 py-1.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-lg text-center font-black text-sm outline-none focus:border-emerald-500"
                                            />
                                        </td>
                                        <td className="py-4 px-2">
                                            <input
                                                type="text"
                                                placeholder="Batch Number"
                                                value={item.batch_number}
                                                onChange={(e) => handleItemChange(idx, 'batch_number', e.target.value)}
                                                className={`w-full px-3 py-1.5 bg-white dark:bg-slate-800 border-2 rounded-lg font-bold text-xs outline-none focus:border-emerald-500 mb-2 ${isMissingInfo ? 'border-red-300 dark:border-red-800' : 'border-slate-100 dark:border-slate-700'}`}
                                                required={item.quantity_received > 0}
                                            />
                                        </td>
                                        <td className="py-4 px-2 space-y-2">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase">Expiry Date</span>
                                                <input
                                                    type="date"
                                                    value={item.expiry_date}
                                                    onChange={(e) => handleItemChange(idx, 'expiry_date', e.target.value)}
                                                    className={`px-2 py-1 bg-white dark:bg-slate-800 border-2 rounded-lg font-bold text-xs outline-none focus:border-emerald-500 ${isMissingInfo ? 'border-red-300 dark:border-red-800' : 'border-slate-100 dark:border-slate-700'}`}
                                                    required={item.quantity_received > 0}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase">Mfg Date (Optional)</span>
                                                <input
                                                    type="date"
                                                    value={item.manufacturing_date}
                                                    onChange={(e) => handleItemChange(idx, 'manufacturing_date', e.target.value)}
                                                    className="px-2 py-1 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-lg font-bold text-xs outline-none focus:border-emerald-500"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-xs text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-xs hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                        Confirm Goods Receipt
                    </button>
                </div>
            </div>
        </div>
    );
}

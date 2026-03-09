import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import {
    FileText,
    Download,
    Printer,
    Truck,
    User,
    Hash,
    ArrowLeft,
} from 'lucide-react';
import { pharmacyService } from '../../services/pharmacy.service';
import type { ProcurementOrder } from '../../types/pharmacy';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import tangaLogo from '../../assets/tanga-logo.png';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function ViewOrderPage() {
    const { orderId } = useParams({ from: '/app/procurement/orders/$orderId' });
    const navigate = useNavigate();
    const { socket } = useSocket();
    const [order, setOrder] = useState<ProcurementOrder | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        try {
            const data = await pharmacyService.getProcurementOrder(Number(orderId));
            setOrder(data);
        } catch (error) {
            console.error('Failed to fetch order details', error);
            toast.error('Failed to load order details');
            navigate({ to: '/app/procurement' as any, search: {} as any });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [orderId, navigate]);

    useEffect(() => {
        if (!socket) return;

        const handlePOUpdate = (data: { orderId: number; action: string }) => {
            if (data.orderId === Number(orderId)) {
                toast.success(`Order updated: ${data.action}`);
                fetchOrder();
            }
        };

        socket.on('po_updated', handlePOUpdate);

        return () => {
            socket.off('po_updated', handlePOUpdate);
        };
    }, [socket, orderId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-healthcare-primary/20 border-t-healthcare-primary rounded-full animate-spin mb-4" />
                    <p className="text-slate-500 font-bold animate-pulse">
                        Loading order details...
                    </p>
                </div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <Link
                to="/app/procurement" search={{}}
                className="flex items-center gap-2 text-slate-500 hover:text-healthcare-primary font-bold mb-6 transition-colors group print:hidden"
            >
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 group-hover:border-healthcare-primary/20">
                    <ArrowLeft size={18} />
                </div>
                Back to Procurement
            </Link>

            <div className="w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800 print:shadow-none print:rounded-none">
                { }
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 print:hidden">
                    <h2 className="text-xl font-black text-healthcare-dark dark:text-white flex items-center gap-2">
                        <FileText size={20} className="text-healthcare-primary" />
                        PO-{order.id.toString().padStart(4, '0')}
                    </h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                            title="Print PDF"
                        >
                            <Printer size={18} />
                            Print PO
                        </button>
                        <button
                            onClick={() => pharmacyService.exportProcurementOrder(order.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors shadow-md shadow-teal-500/10"
                            title="Export Excel"
                        >
                            <Download size={18} />
                            Export Excel
                        </button>
                    </div>
                </div>

                { }
                <div className="flex-1 p-8 md:p-12 print:p-0">
                    { }
                    <div className="flex justify-between items-start mb-16">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-2">
                                    <img src={tangaLogo} alt="TangaCare logo" className="max-w-full max-h-full object-contain" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-healthcare-dark tracking-tight uppercase">
                                        TangaCare
                                    </h1>
                                    <p className="text-[10px] font-black uppercase text-healthcare-primary tracking-widest leading-none">
                                        Pharmacy & Healthcare
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-healthcare-dark dark:text-white">
                                    {order.facility?.name}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium max-w-xs">
                                    {order.facility?.address}
                                </p>
                                <p className="text-sm text-slate-500 font-medium">
                                    Tel: {order.facility?.phone}
                                </p>
                                <p className="text-sm text-slate-500 font-medium">
                                    {order.facility?.email}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-5xl font-black text-slate-100 dark:text-slate-700 mb-6 uppercase tracking-tighter italic">
                                Purchase Order
                            </h2>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-shadow whitespace-nowrap">
                                <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-left">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                        Order No.
                                    </span>
                                    <span className="text-sm font-black text-healthcare-dark dark:text-white tracking-tight">
                                        PO-{order.id.toString().padStart(4, '0')}
                                    </span>

                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                        Date
                                    </span>
                                    <span className="text-sm font-bold text-healthcare-dark dark:text-white">
                                        {new Date(order.order_date).toLocaleDateString()}
                                    </span>

                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                        Status
                                    </span>
                                    <span
                                        className={cn(
                                            'text-[10px] font-black uppercase px-2.5 py-1 rounded-lg w-fit',
                                            order.status.toUpperCase() === 'RECEIVED'
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : ['APPROVED', 'ORDERED'].includes(
                                                    order.status.toUpperCase(),
                                                )
                                                    ? 'bg-teal-50 text-teal-600 border border-teal-100'
                                                    : ['PARTIAL', 'PARTIALLY_RECEIVED'].includes(
                                                        order.status.toUpperCase(),
                                                    )
                                                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                                        : order.status.toUpperCase() === 'PENDING'
                                                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                                            : 'bg-slate-100 text-slate-500 border border-slate-200',
                                        )}
                                    >
                                        {(order.status || '').replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
                        <div>
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <Truck size={14} className="text-slate-400" />
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    Supplier Details
                                </h4>
                            </div>
                            <div className="space-y-4">
                                <p className="text-lg font-black text-healthcare-dark dark:text-white uppercase tracking-tight leading-tight">
                                    {order.supplier?.name}
                                </p>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            <Hash size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-0.5">
                                                Tax ID
                                            </p>
                                            <p className="text-sm font-bold text-slate-600">
                                                {order.supplier?.tax_id || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            <User size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-0.5">
                                                Contact Person
                                            </p>
                                            <p className="text-sm font-bold text-slate-600">
                                                {order.supplier?.contact_person}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            <FileText size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-0.5">
                                                Email Address
                                            </p>
                                            <p className="text-sm font-bold text-slate-600 underline underline-offset-2 decoration-slate-200">
                                                {order.supplier?.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <FileText size={14} className="text-slate-400" />
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    Pricing Summary
                                </h4>
                            </div>
                            <div className="bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-2xl space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                        Subtotal
                                    </span>
                                    <span className="font-bold text-healthcare-dark dark:text-white">
                                        RWF {Number(order.subtotal_amount).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                        Discount ({order.discount_percent}%)
                                    </span>
                                    <span className="font-bold text-red-500">
                                        - RWF {Number(order.discount_amount).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                        VAT ({order.vat_rate}%)
                                    </span>
                                    <span className="font-bold text-healthcare-dark dark:text-white">
                                        RWF {Number(order.vat_amount).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-700 mt-2">
                                    <span className="text-sm font-black text-healthcare-dark dark:text-white uppercase tracking-widest">
                                        Total Payable
                                    </span>
                                    <span className="text-2xl font-black text-healthcare-primary">
                                        RWF {Number(order.total_amount).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    { }
                    <div className="mb-16">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 border-b pb-2">
                            Requested Items
                        </h4>
                        <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm shadow-slate-100/50">
                            <table className="tc-table w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                            Item / Medicine
                                        </th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">
                                            Qty
                                        </th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">
                                            Unit Price
                                        </th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {order.items?.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-healthcare-dark dark:text-white text-sm uppercase tracking-tight">
                                                        {item.medicine?.name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                                        {item.medicine?.strength} •{' '}
                                                        {item.medicine?.dosage_form}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black text-healthcare-dark dark:text-white">
                                                    {item.quantity_ordered}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className="text-sm font-bold text-slate-500 tracking-tight">
                                                    RWF {Number(item.unit_price).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className="text-sm font-black text-healthcare-dark dark:text-white tracking-tight">
                                                    RWF {Number(item.total_price).toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {order.notes && (
                        <div className="mb-16">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                                Order Instructions / Notes
                            </h4>
                            <div className="text-sm text-slate-600 bg-teal-50/30 dark:bg-slate-800/30 p-6 rounded-2xl italic font-medium border-l-4 border-teal-500/20">
                                "{order.notes}"
                            </div>
                        </div>
                    )}

                    {/* Activity History */}
                    {order.activities && order.activities.length > 0 && (
                        <div className="mb-16">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 border-b pb-2">
                                Activity History
                            </h4>
                            <div className="space-y-4">
                                {order.activities.map((activity) => (
                                    <div key={activity.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-800">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className={`w-2 h-2 rounded-full ${activity.action.includes('rejected') || activity.action.includes('cancelled') ? 'bg-red-500' :
                                                activity.action.includes('confirmed') || activity.action.includes('approved') ? 'bg-teal-500' :
                                                    activity.action.includes('clarification') ? 'bg-yellow-500' :
                                                        'bg-gray-400'
                                                }`}></div>
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-healthcare-dark dark:text-white capitalize">
                                                    {activity.action.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-sm text-slate-500">
                                                    {new Date(activity.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-wrap font-medium">{activity.description}</p>
                                            <p className="text-xs text-slate-400 mt-2 capitalize">
                                                By: <span className="font-semibold text-slate-500 dark:text-slate-300">{activity.actor_type}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    { }
                    <div className="grid grid-cols-2 gap-32 pt-16 mt-16 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-center">
                            <div className="h-24 border-b border-dashed border-slate-200 dark:border-slate-700 mb-4 flex items-center justify-center">
                                <p className="text-2xl font-serif italic text-slate-200 dark:text-slate-800 select-none">
                                    Signature
                                </p>
                            </div>
                            <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">
                                Authorized By
                            </p>
                            <p className="text-[11px] font-black text-healthcare-dark dark:text-white uppercase tracking-wider">
                                {order.created_by?.first_name} {order.created_by?.last_name}
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="h-24 border-b border-dashed border-slate-200 dark:border-slate-700 mb-4 flex items-center justify-center">
                                <p className="text-2xl font-serif italic text-slate-200 dark:text-slate-800 select-none">
                                    Stamp Here
                                </p>
                            </div>
                            <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">
                                Pharmacy Seal
                            </p>
                            <p className="text-[11px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">
                                Pending Verification
                            </p>
                        </div>
                    </div>
                </div>

                { }
                <div className="print-footer p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        Generated via TangaCare Pharmacy ERP Management System
                    </p>
                    <p className="mt-2 text-[11px] font-semibold text-slate-500">
                        Powered by Tanghub services https://www.tangahubservice.com/
                    </p>
                </div>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    @page { margin: 0; }
                    body { background: white; }
                    .max-w-5xl { max-width: 100% !important; padding: 0 !important; }
                    .min-h-screen { min-height: 0 !important; }
                    .print\\:hidden { display: none !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    .shadow-xl, .shadow-sm { box-shadow: none !important; }
                    .rounded-3xl, .rounded-2xl { border-radius: 0 !important; }
                    .border { border: none !important; }
                    .bg-slate-50 { background: white !important; }
                    table { border: 1px solid #f1f5f9 !important; border-collapse: collapse !important; table-layout: fixed !important; }
                    th, td { word-wrap: break-word !important; vertical-align: top !important; }
                    tr { break-inside: avoid !important; page-break-inside: avoid !important; }
                    .print-footer { border-top: 1px solid #e2e8f0 !important; margin-top: 16px !important; padding-top: 12px !important; }
                }
            `,
                }}
            />
        </div>
    );
}

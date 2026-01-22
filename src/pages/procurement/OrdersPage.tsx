import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { pharmacyService } from '../../services/pharmacy.service';
import type { ProcurementOrder } from '../../types/pharmacy';
import { TableSkeleton } from '../../components/shared/Skeleton';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { CreateOrderModal } from './CreateOrderModal';
// import { CreateOrderModal } from './CreateOrderModal'; // Will implement inline or separate
// import { ReceiveOrderModal } from './ReceiveOrderModal'; // Will implement inline or separate

export function OrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<ProcurementOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');

    const [showCreateModal, setShowCreateModal] = useState(false);
    // const [selectedOrder, setSelectedOrder] = useState<ProcurementOrder | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await pharmacyService.getProcurementOrders({
                status: statusFilter === 'All' ? undefined : statusFilter.toUpperCase(),
                ...(user?.facility_id ? { facility_id: user.facility_id } : {})
            });
            setOrders(response.data || []);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'APPROVED': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'ORDERED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'RECEIVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100'; // Full received
            case 'PARTIAL': return 'bg-teal-50 text-teal-600 border-teal-100';
            case 'CANCELLED': return 'bg-slate-100 text-slate-500 border-slate-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <ProtectedRoute allowedRoles={['admin', 'super_admin', 'store_manager', 'facility_admin']}>
            <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-healthcare-dark">Purchase Orders</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage procurement and stock replenishment</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-healthcare-primary text-white rounded-lg font-bold hover:bg-teal-700 transition-all shadow-md"
                    >
                        <Plus size={18} /> Create Purchase Order
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['All', 'Pending', 'Approved', 'Ordered', 'Received'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${statusFilter === status
                                ? 'bg-healthcare-dark text-white shadow-md'
                                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-black text-slate-500 tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Order Ref</th>
                                    <th className="px-6 py-4">Supplier</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Total Cost</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-8"><TableSkeleton rows={5} columns={6} /></td></tr>
                                ) : orders.length > 0 ? (
                                    orders.map(order => (
                                        <tr key={order.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-healthcare-dark">
                                                #{order.order_number || order.id}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                {order.supplier?.name || 'Unknown Supplier'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(order.order_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-healthcare-dark">
                                                RWF {order.total_amount?.toLocaleString() || '0'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    className="text-sm text-healthcare-primary font-bold hover:underline"
                                                    // onClick={() => setSelectedOrder(order)}
                                                    onClick={() => console.log('View order:', order)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                                            No orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <CreateOrderModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchOrders();
                    }}
                />
            )}
        </ProtectedRoute>
    );
}

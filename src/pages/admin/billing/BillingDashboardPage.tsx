import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { adminBillingService } from '../../../services/admin-billing.service';

const cardClass =
    'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4';

export function BillingDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<any>(null);
    const [failedPayments, setFailedPayments] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [ov, failed] = await Promise.all([
                    adminBillingService.getOverview(),
                    adminBillingService.getPayments({ status: 'failed', limit: 5, page: 1 }),
                ]);
                setOverview(ov);
                setFailedPayments(failed?.data || []);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPER ADMIN', 'super_admin']} requireFacility={false}>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-black">Billing Dashboard</h1>
                    <p className="text-sm text-slate-500">Platform-wide billing visibility for super admin.</p>
                </div>
                {loading ? (
                    <div className="text-sm text-slate-500">Loading...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            <div className={cardClass}><p className="text-xs text-slate-500">Total Revenue</p><p className="text-xl font-black">RWF {(overview?.totalRevenue || 0).toLocaleString()}</p></div>
                            <div className={cardClass}><p className="text-xs text-slate-500">Revenue This Month</p><p className="text-xl font-black">RWF {(overview?.revenueThisMonth || 0).toLocaleString()}</p></div>
                            <div className={cardClass}><p className="text-xs text-slate-500">Active Subscriptions</p><p className="text-xl font-black">{overview?.activeSubscriptions || 0}</p></div>
                            <div className={cardClass}><p className="text-xs text-slate-500">Trial Subscriptions</p><p className="text-xl font-black">{overview?.trialSubscriptions || 0}</p></div>
                            <div className={cardClass}><p className="text-xs text-slate-500">Expired</p><p className="text-xl font-black">{overview?.expiredSubscriptions || 0}</p></div>
                            <div className={cardClass}><p className="text-xs text-slate-500">Failed Payments</p><p className="text-xl font-black">{overview?.failedPayments || 0}</p></div>
                            <div className={cardClass}><p className="text-xs text-slate-500">Renewals Due Soon</p><p className="text-xl font-black">{overview?.renewalsDueSoon || 0}</p></div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <div className={cardClass}>
                                <h2 className="font-black mb-3">Monthly Revenue Trend</h2>
                                <div className="space-y-2">
                                    {(overview?.monthlyRevenueTrend || []).map((m: any) => (
                                        <div key={m.month} className="flex justify-between text-sm">
                                            <span>{m.month}</span>
                                            <span className="font-bold">RWF {Number(m.revenue || 0).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className={cardClass}>
                                <h2 className="font-black mb-3">Plan Distribution</h2>
                                <div className="space-y-2">
                                    {(overview?.planDistribution || []).map((p: any) => (
                                        <div key={p.planCode} className="flex justify-between text-sm">
                                            <span>{p.planCode}</span>
                                            <span className="font-bold">{p.count} ({p.sharePercent}%)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={cardClass}>
                            <h2 className="font-black mb-3">Recent Failed Payments</h2>
                            {failedPayments.length === 0 ? (
                                <p className="text-sm text-slate-500">No recent failed payments.</p>
                            ) : (
                                <div className="space-y-2">
                                    {failedPayments.map((p) => (
                                        <div key={p.id} className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                                            <span>{p.gateway_ref}</span>
                                            <span className="font-bold">RWF {Number(p.amount_rwf || 0).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </ProtectedRoute>
    );
}


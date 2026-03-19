import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import {
    subscriptionService,
    type PaymentMethodPreference,
    type SubscriptionPlanCode,
} from '../../services/subscription.service';

const PLAN_OPTIONS: Array<{ code: SubscriptionPlanCode; label: string; price: string }> = [
    { code: 'starter', label: 'Starter', price: 'RWF 35,000 / month' },
    { code: 'pro', label: 'Pro', price: 'RWF 75,000 / month' },
    { code: 'business', label: 'Business', price: 'RWF 100,000 / month' },
    { code: 'enterprise', label: 'Enterprise', price: 'Custom' },
];

export function BillingPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [subscription, setSubscription] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanCode>('starter');
    const [paymentMethodPreference, setPaymentMethodPreference] =
        useState<PaymentMethodPreference>('mtn_momo');
    const [phoneNumber, setPhoneNumber] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [sub, pays] = await Promise.all([
                subscriptionService.getMySubscription(),
                subscriptionService.getMyPayments(),
            ]);
            setSubscription(sub ?? null);
            setPayments(pays);
            setSelectedPlan((sub?.subscription_plan?.plan_code as SubscriptionPlanCode) || 'starter');
            setPhoneNumber(sub?.paypack_phone_number || user?.phone_number || user?.phoneNumber || '');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to load billing data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    const needsSubscription = useMemo(() => {
        if (!subscription) return true;
        return ['expired', 'cancelled', 'past_due', 'none'].includes(subscription.status);
    }, [subscription]);

    const handleRenewOrBuy = async () => {
        if (!phoneNumber.trim()) {
            toast.error('Phone number is required');
            return;
        }

        setSubmitting(true);
        try {
            if (subscription) {
                await subscriptionService.renewSubscription({
                    plan_code: selectedPlan,
                    phone_number: phoneNumber.trim(),
                    payment_method_preference: paymentMethodPreference,
                });
                toast.success('Subscription request submitted');
            } else {
                await subscriptionService.startSubscription({
                    plan_code: selectedPlan,
                    phone_number: phoneNumber.trim(),
                    payment_method_preference: paymentMethodPreference,
                });
                toast.success('Subscription trial started');
            }
            await loadData();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to process subscription');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ProtectedRoute
            allowedRoles={['SUPER_ADMIN', 'SUPER ADMIN', 'super_admin']}
            requireFacility={false}
        >
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-black text-healthcare-dark dark:text-white">
                        Billing & Subscription
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        View current subscription and invoice history, then renew or buy a plan.
                    </p>
                </div>

                {loading ? (
                    <div className="text-sm text-slate-500">Loading billing details...</div>
                ) : (
                    <>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
                                        Current status
                                    </p>
                                    <p className="text-lg font-black text-healthcare-dark dark:text-white mt-1">
                                        {subscription?.status || 'No subscription'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
                                        Current plan
                                    </p>
                                    <p className="text-lg font-black text-healthcare-dark dark:text-white mt-1">
                                        {subscription?.subscription_plan?.name || 'Not subscribed'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {(needsSubscription || !subscription) && (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                                <h2 className="text-lg font-black text-healthcare-dark dark:text-white">
                                    {subscription ? 'Renew subscription' : 'Buy a subscription'}
                                </h2>

                                <div className="grid md:grid-cols-2 gap-3">
                                    {PLAN_OPTIONS.map((plan) => (
                                        <button
                                            key={plan.code}
                                            type="button"
                                            onClick={() => setSelectedPlan(plan.code)}
                                            className={`text-left p-4 rounded-xl border-2 ${selectedPlan === plan.code ? 'border-healthcare-primary/50 bg-healthcare-primary/5' : 'border-slate-200 dark:border-slate-700'}`}
                                        >
                                            <div className="font-black">{plan.label}</div>
                                            <div className="text-xs text-slate-500 mt-1">{plan.price}</div>
                                        </button>
                                    ))}
                                </div>

                                <div className="grid md:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethodPreference('mtn_momo')}
                                        className={`flex items-center gap-2 p-4 rounded-xl border-2 ${paymentMethodPreference === 'mtn_momo' ? 'border-healthcare-primary/50 bg-healthcare-primary/5' : 'border-slate-200 dark:border-slate-700'}`}
                                    >
                                        <Smartphone size={16} />
                                        <span className="font-bold">MTN MoMo</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethodPreference('mobile_money')}
                                        className={`flex items-center gap-2 p-4 rounded-xl border-2 ${paymentMethodPreference === 'mobile_money' ? 'border-healthcare-primary/50 bg-healthcare-primary/5' : 'border-slate-200 dark:border-slate-700'}`}
                                    >
                                        <Smartphone size={16} />
                                        <span className="font-bold">Mobile Money</span>
                                    </button>
                                </div>

                                <div>
                                    <label className="text-xs uppercase tracking-wider font-bold text-slate-500">
                                        Phone number
                                    </label>
                                    <input
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                        placeholder="+2507..."
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleRenewOrBuy}
                                    disabled={submitting}
                                    className="px-4 py-2.5 bg-healthcare-primary text-white rounded-xl font-bold text-sm"
                                >
                                    {submitting ? 'Processing...' : subscription ? 'Renew subscription' : 'Buy plan'}
                                </button>
                            </div>
                        )}

                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard size={16} />
                                <h2 className="font-black">Invoices / Payments</h2>
                            </div>
                            {payments.length === 0 ? (
                                <p className="text-sm text-slate-500">No invoices yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {payments.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl"
                                        >
                                            <div>
                                                <p className="font-bold text-sm">{p.gateway_ref}</p>
                                                <p className="text-xs text-slate-500">
                                                    {p.status} • {p.provider || 'provider pending'}
                                                </p>
                                            </div>
                                            <div className="text-sm font-black">
                                                RWF {Number(p.amount_rwf || 0).toLocaleString()}
                                            </div>
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


import api from '../lib/api';

export type SubscriptionPlanCode = 'starter' | 'pro' | 'business' | 'enterprise';

export type PaymentMethodPreference = 'mtn_momo' | 'mobile_money';

export const subscriptionService = {
    async getMySubscription(): Promise<any | null> {
        const response = await api.get<any>('/subscriptions/me');
        return (response.data as any).data ?? response.data ?? null;
    },

    async startSubscription(data: {
        plan_code: SubscriptionPlanCode;
        phone_number: string;
        payment_method_preference?: PaymentMethodPreference;
    }): Promise<any> {
        const response = await api.post<any>('/subscriptions/start', data);
        return (response.data as any).data ?? response.data;
    },

    async getMyLimits(): Promise<any> {
        const response = await api.get<any>('/subscriptions/me/limits');
        return (response.data as any).data ?? response.data;
    },

    async renewSubscription(data: {
        plan_code?: SubscriptionPlanCode;
        phone_number?: string;
        payment_method_preference?: PaymentMethodPreference;
    }): Promise<any> {
        const response = await api.post<any>('/subscriptions/renew', data);
        return (response.data as any).data ?? response.data;
    },

    async getMyPayments(): Promise<any[]> {
        const response = await api.get<any>('/subscriptions/me/payments');
        const payload = (response.data as any).data ?? response.data;
        return Array.isArray(payload) ? payload : [];
    },
};


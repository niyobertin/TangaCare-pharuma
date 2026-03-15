import api from '../lib/api';
import type {
    EffectiveSettingsResult,
    ScopedSettingChangePayload,
    SettingDefinition,
    SettingDomain,
    SettingScopeType,
} from '../types/settings';

/** Flattened runtime config from backend: currency, tax, locale for UI display. */
export interface RuntimeConfig {
    currencyCode: string;
    currencySymbol: string;
    currencyDecimals: number;
    /** Rounding mode (e.g. half_up). Single-currency; no exchange execution yet. */
    currencyRoundingMode?: string;
    maxDiscountPercent: number;
    vatEnabled: boolean;
    vatRate: number;
    locale: string;
    timezone: string;
    dateFormat: string;
    numberFormat: string;
}

export const settingsService = {
    /** Single endpoint for UI: currency, tax, locale. Use for all display formatting. */
    async getRuntimeConfig(): Promise<RuntimeConfig> {
        const response = await api.get<{ data: RuntimeConfig }>('/pharmacy/settings/runtime-config');
        return (response.data as any).data ?? response.data;
    },

    async getDefinitions(domain?: SettingDomain): Promise<SettingDefinition[]> {
        const response = await api.get<any>('/pharmacy/settings/definitions', {
            params: domain ? { domain } : undefined,
        });
        return ((response.data as any).data ?? response.data) as SettingDefinition[];
    },

    async getEffective(params?: {
        tenantId?: number;
        branchId?: number;
        userId?: number;
        domain?: SettingDomain;
    }): Promise<EffectiveSettingsResult> {
        const response = await api.get<any>('/pharmacy/settings/effective', { params });
        return ((response.data as any).data ?? response.data) as EffectiveSettingsResult;
    },

    async validate(payload: {
        scope_type: SettingScopeType;
        scope_id: number;
        changes: ScopedSettingChangePayload[];
    }): Promise<any[]> {
        const response = await api.post<any>('/pharmacy/settings/validate', payload);
        return (response.data as any).data ?? response.data;
    },

    async updateTenant(tenantId: number, changes: ScopedSettingChangePayload[]): Promise<any> {
        const response = await api.put<any>(`/pharmacy/settings/tenant/${tenantId}`, { changes });
        return (response.data as any).data ?? response.data;
    },

    async updateBranch(branchId: number, changes: ScopedSettingChangePayload[]): Promise<any> {
        const response = await api.put<any>(`/pharmacy/settings/branch/${branchId}`, { changes });
        return (response.data as any).data ?? response.data;
    },

    async updateUser(userId: number, changes: ScopedSettingChangePayload[]): Promise<any> {
        const response = await api.put<any>(`/pharmacy/settings/user/${userId}`, { changes });
        return (response.data as any).data ?? response.data;
    },

    async getHistory(params?: {
        key?: string;
        scopeType?: SettingScopeType;
        scopeId?: number;
        limit?: number;
    }): Promise<any[]> {
        const response = await api.get<any>('/pharmacy/settings/history', { params });
        return (response.data as any).data ?? response.data;
    },

    async getDiff(fromVersion: number, toVersion: number): Promise<any> {
        const response = await api.get<any>('/pharmacy/settings/diff', {
            params: { fromVersion, toVersion },
        });
        return (response.data as any).data ?? response.data;
    },
};

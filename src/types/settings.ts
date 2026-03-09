export type SettingDomain =
    | 'localization'
    | 'currency_pricing'
    | 'tax_fiscal'
    | 'inventory_rules'
    | 'controlled_medicines'
    | 'reporting'
    | 'notifications'
    | 'integrations'
    | 'compliance'
    | 'ui_preferences'
    | 'security';

export type SettingScopeType = 'tenant' | 'branch' | 'user';

export interface SettingDefinition {
    id: number;
    key: string;
    label: string;
    description: string | null;
    domain: SettingDomain;
    value_type: 'string' | 'number' | 'boolean' | 'json';
    allowed_scopes: string[];
    override_mode: 'open' | 'guarded' | 'strict';
    constraints_schema: Record<string, any> | null;
    default_value: any;
    audit_sensitive: boolean;
    requires_approval: boolean;
    is_active: boolean;
    version: number;
    created_at: string;
    updated_at: string;
}

export interface EffectiveSettingItem {
    key: string;
    domain: SettingDomain;
    value: any;
    source: 'tenant' | 'branch' | 'user' | 'system';
    source_version: number | null;
    trail: Array<{
        source: 'tenant' | 'branch' | 'user' | 'system';
        value: any;
        version: number | null;
        updated_at: string | null;
    }>;
    metadata: {
        value_type: 'string' | 'number' | 'boolean' | 'json';
        allowed_scopes: string[];
        override_mode: 'open' | 'guarded' | 'strict';
        audit_sensitive: boolean;
        requires_approval: boolean;
    };
}

export interface EffectiveSettingsResult {
    context: {
        tenantId?: number;
        branchId?: number;
        userId?: number;
        domain?: SettingDomain;
    };
    resolved_at: string;
    values: Record<string, any>;
    items: EffectiveSettingItem[];
}

export interface ScopedSettingChangePayload {
    key: string;
    value: any;
    expected_version?: number;
    reason?: string;
}

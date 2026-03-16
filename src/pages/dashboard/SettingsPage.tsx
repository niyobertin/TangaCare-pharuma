import { Fragment, useEffect, useMemo, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import {
    Building2,
    ChevronRight,
    ExternalLink,
    Globe2,
    Lock,
    Save,
    Settings as SettingsIcon,
    ShieldCheck,
    UserCog,
    Zap,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { settingsService, type ComplianceStatus, type IntegrationsStatus } from '../../services/settings.service';
import type { EffectiveSettingItem, SettingDefinition, SettingDomain } from '../../types/settings';
import { formatLocalDateTime } from '../../lib/date';
import { OrganizationProfileForm } from '../../components/organization/OrganizationProfileForm';

type ScopeTab = 'tenant' | 'branch' | 'user';

interface DomainMenuItem {
    domain: SettingDomain;
    label: string;
}

interface SettingsGroup {
    id: string;
    label: string;
    description: string;
    icon: typeof Globe2;
    items: DomainMenuItem[];
}

interface EditState {
    key: string;
    label: string;
    value_type: SettingDefinition['value_type'];
    expected_version: number | null;
    raw_value: string;
}

const SETTINGS_GROUPS: SettingsGroup[] = [
    {
        id: 'organization',
        label: 'Organization',
        description: '',
        icon: Building2,
        items: [{ domain: 'organization_profile', label: 'Organization' }],
    },
    {
        id: 'currency_tax_pricing',
        label: 'Currency, Tax & Pricing',
        description: '',
        icon: Globe2,
        items: [
            { domain: 'currency_pricing', label: 'Currency & pricing' },
            { domain: 'tax_fiscal', label: 'Tax & fiscal' },
        ],
    },
    {
        id: 'inventory_rules',
        label: 'Inventory Rules',
        description: '',
        icon: Building2,
        items: [{ domain: 'inventory_rules', label: 'Inventory rules' }],
    },
    {
        id: 'roles_permissions',
        label: 'Roles & Permissions',
        description: '',
        icon: UserCog,
        items: [{ domain: 'link_roles', label: 'Roles & permissions' }],
    },
    {
        id: 'prescription_compliance',
        label: 'Prescription & Compliance',
        description: '',
        icon: ShieldCheck,
        items: [{ domain: 'controlled_medicines', label: 'Prescription & compliance' }],
    },
];

function prettyJson(value: any): string {
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value ?? '');
    }
}

function parseEditorValue(valueType: SettingDefinition['value_type'], rawValue: string): any {
    if (valueType === 'number') {
        const parsed = Number(rawValue);
        if (!Number.isFinite(parsed)) throw new Error('Value must be a valid number');
        return parsed;
    }
    if (valueType === 'boolean') {
        if (rawValue === 'true') return true;
        if (rawValue === 'false') return false;
        throw new Error('Value must be true or false');
    }
    if (valueType === 'json') {
        return JSON.parse(rawValue);
    }
    return rawValue;
}

function renderValue(valueType: SettingDefinition['value_type'], value: any): string {
    if (valueType === 'boolean') {
        return value ? 'Enabled' : 'Disabled';
    }
    if (valueType === 'number') {
        return Number(value ?? 0).toLocaleString();
    }
    if (valueType === 'json') {
        const raw = prettyJson(value);
        return raw.length > 120 ? `${raw.slice(0, 120)}...` : raw;
    }
    return String(value ?? '');
}

export function SettingsPage() {
    const { user, organizationId, facilityId } = useAuth();
    const location = useLocation();
    const sectionParam = typeof location?.search === 'string'
        ? new URLSearchParams(location.search).get('section')
        : null;
    const openOrganizationProfile = sectionParam === 'organization';

    const tenantId = Number(organizationId ?? user?.organization_id ?? 0) || undefined;
    const branchId = Number(facilityId ?? user?.facility_id ?? 0) || undefined;
    const userId = Number(user?.id ?? 0) || undefined;

    const orgGroup = SETTINGS_GROUPS.find((g) => g.id === 'organization');
    const defaultGroupId = openOrganizationProfile && orgGroup ? 'organization' : SETTINGS_GROUPS[0].id;
    const defaultDomain: SettingDomain = openOrganizationProfile && orgGroup
        ? 'organization_profile'
        : SETTINGS_GROUPS[0].items[0].domain;

    const [activeGroupId, setActiveGroupId] = useState<string>(defaultGroupId);
    const activeGroup = useMemo(
        () => SETTINGS_GROUPS.find((group) => group.id === activeGroupId) || SETTINGS_GROUPS[0],
        [activeGroupId],
    );
    const [activeDomain, setActiveDomain] = useState<SettingDomain>(defaultDomain);
    const [activeScope, setActiveScope] = useState<ScopeTab>('branch');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [definitions, setDefinitions] = useState<SettingDefinition[]>([]);
    const [effectiveItems, setEffectiveItems] = useState<EffectiveSettingItem[]>([]);
    const [expandedKey, setExpandedKey] = useState<string | null>(null);
    const [editing, setEditing] = useState<EditState | null>(null);
    const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
    const [integrationsStatus, setIntegrationsStatus] = useState<IntegrationsStatus | null>(null);

    const availableScopes = useMemo(
        () => ({
            tenant: !!tenantId,
            branch: !!branchId,
            user: !!userId,
        }),
        [tenantId, branchId, userId],
    );

    useEffect(() => {
        if (!activeGroup.items.some((item) => item.domain === activeDomain)) {
            setActiveDomain(activeGroup.items[0].domain);
        }
    }, [activeGroup, activeDomain]);

    useEffect(() => {
        if (activeScope === 'tenant' && !availableScopes.tenant) {
            setActiveScope(availableScopes.branch ? 'branch' : 'user');
        }
        if (activeScope === 'branch' && !availableScopes.branch) {
            setActiveScope(availableScopes.tenant ? 'tenant' : 'user');
        }
        if (activeScope === 'user' && !availableScopes.user) {
            setActiveScope(availableScopes.branch ? 'branch' : 'tenant');
        }
    }, [activeScope, availableScopes]);

    const loadSettings = async () => {
        if (
            activeDomain === 'organization_profile' ||
            activeDomain === 'link_facilities' ||
            activeDomain === 'link_suppliers' ||
            activeDomain === 'link_roles'
        ) {
            return;
        }
        setLoading(true);
        try {
            const context =
                activeScope === 'tenant'
                    ? { domain: activeDomain, tenantId }
                    : activeScope === 'branch'
                      ? { domain: activeDomain, tenantId, branchId }
                      : { domain: activeDomain, tenantId, branchId, userId };

            const [defs, effective] = await Promise.all([
                settingsService.getDefinitions(activeDomain),
                settingsService.getEffective(context),
            ]);

            setDefinitions(defs);
            setEffectiveItems(effective.items);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadSettings();
    }, [activeDomain, activeScope, tenantId, branchId, userId]);

    useEffect(() => {
        if (activeDomain === 'compliance') {
            settingsService.getComplianceStatus().then(setComplianceStatus).catch(() => setComplianceStatus(null));
        } else {
            setComplianceStatus(null);
        }
    }, [activeDomain]);

    useEffect(() => {
        if (activeDomain === 'integrations') {
            settingsService.getIntegrationsStatus().then(setIntegrationsStatus).catch(() => setIntegrationsStatus(null));
        } else {
            setIntegrationsStatus(null);
        }
    }, [activeDomain]);

    const effectiveByKey = useMemo(() => {
        return new Map(effectiveItems.map((item) => [item.key, item]));
    }, [effectiveItems]);

    const onSaveChange = async () => {
        if (!editing) return;
        try {
            const value = parseEditorValue(editing.value_type, editing.raw_value);
            setSaving(true);

            const payload = [
                {
                    key: editing.key,
                    value,
                    expected_version: editing.expected_version || undefined,
                },
            ];

            if (activeScope === 'tenant') {
                if (!tenantId) throw new Error('No tenant selected');
                await settingsService.updateTenant(tenantId, payload);
            } else if (activeScope === 'branch') {
                if (!branchId) throw new Error('No branch selected');
                await settingsService.updateBranch(branchId, payload);
            } else {
                if (!userId) throw new Error('No user selected');
                await settingsService.updateUser(userId, payload);
            }

            toast.success('Setting saved');
            setEditing(null);
            await loadSettings();
        } catch (error: any) {
            const message =
                error?.response?.data?.message || error?.message || 'Failed to save setting';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const onOpenEditor = (definition: SettingDefinition, effective?: EffectiveSettingItem) => {
        const sourceValue = effective?.value ?? definition.default_value;
        const rawValue =
            definition.value_type === 'json' ? prettyJson(sourceValue) : String(sourceValue ?? '');
        setEditing({
            key: definition.key,
            label: definition.label,
            value_type: definition.value_type,
            expected_version: effective?.source_version ?? null,
            raw_value: rawValue,
        });
    };

    return (
        <ProtectedRoute
            allowedRoles={[
                'SUPER_ADMIN',
                'SUPER ADMIN',
                'FACILITY_ADMIN',
                'FACILITY ADMIN',
                'OWNER',
                'ADMIN',
            ]}
            requireFacility={false}
        >
            <div className="p-5 md:p-6 h-full overflow-auto">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 rounded-xl bg-healthcare-primary/10 text-healthcare-primary">
                        <SettingsIcon size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-healthcare-dark dark:text-white">
                            Settings
                        </h1>
                        <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
                            Tenant, Branch, and User Configuration
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-5 items-start">
                    <aside className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                        {SETTINGS_GROUPS.map((group) => {
                            const Icon = group.icon;
                            const active = group.id === activeGroupId;
                            return (
                                <div
                                    key={group.id}
                                    className="rounded-xl border border-transparent"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setActiveGroupId(group.id)}
                                        className={`w-full text-left px-3 py-3 rounded-xl transition-colors ${
                                            active
                                                ? 'bg-healthcare-primary text-white'
                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon size={16} />
                                            <span className="font-black text-sm tracking-wide">
                                                {group.label}
                                            </span>
                                        </div>
                                        <p
                                            className={`text-[11px] mt-2 leading-relaxed ${active ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'}`}
                                        >
                                            {group.description}
                                        </p>
                                    </button>

                                    {active && (
                                        <div className="mt-2 pl-2 space-y-1">
                                            {group.items.map((item) => (
                                                <button
                                                    key={item.domain}
                                                    type="button"
                                                    onClick={() => setActiveDomain(item.domain)}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold ${
                                                        activeDomain === item.domain
                                                            ? 'bg-teal-50 text-healthcare-primary dark:bg-teal-900/30'
                                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <span>{item.label}</span>
                                                    <ChevronRight size={14} />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </aside>

                    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-5">
                        {activeDomain === 'organization_profile' ? (
                            <>
                                {!tenantId ? (
                                    <p className="text-slate-500 text-sm py-6">
                                        Select an organization context to edit organization profile.
                                    </p>
                                ) : (
                                    <OrganizationProfileForm organizationId={tenantId} />
                                )}
                            </>
                        ) : activeDomain === 'link_facilities' || activeDomain === 'link_suppliers' || activeDomain === 'link_roles' ? (
                            <div className="py-8">
                                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 bg-slate-50/50 dark:bg-slate-800/30">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                        {activeDomain === 'link_facilities' && 'Manage branches and facility-level settings from the Facilities page.'}
                                        {activeDomain === 'link_suppliers' && 'Manage suppliers and partners from the Procurement area.'}
                                        {activeDomain === 'link_roles' && 'Manage users and role assignments from the Users page.'}
                                    </p>
                                    <Link
                                        to={
                                            activeDomain === 'link_facilities'
                                                ? '/app/facilities'
                                                : activeDomain === 'link_suppliers'
                                                  ? '/app/procurement/suppliers'
                                                  : '/app/users'
                                        }
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-healthcare-primary text-white font-bold text-sm hover:bg-teal-600 transition-colors"
                                    >
                                        <ExternalLink size={16} />
                                        {activeDomain === 'link_facilities' && 'Open Facilities'}
                                        {activeDomain === 'link_suppliers' && 'Open Suppliers'}
                                        {activeDomain === 'link_roles' && 'Open Users & Roles'}
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <>
                        {(activeDomain === 'compliance' && complianceStatus) && (
                            <div className="mb-6 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Compliance status</h3>
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                        Immutable logs: {complianceStatus.immutableLogsEnabled ? 'On' : 'Off'}
                                    </span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                        Retention: {complianceStatus.auditRetentionDays} days
                                    </span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                        Separation of duty: {complianceStatus.separationOfDutyEnforced ? 'Enforced' : 'Off'}
                                    </span>
                                </div>
                            </div>
                        )}
                        {(activeDomain === 'integrations' && integrationsStatus) && (
                            <div className="mb-6 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Integration status</h3>
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                        EBM: {integrationsStatus.ebm.enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                        Configured: {integrationsStatus.ebm.configured ? 'Yes' : 'No'}
                                    </span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                        Provider: {integrationsStatus.ebm.provider}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            {(['tenant', 'branch', 'user'] as ScopeTab[]).map((scope) => {
                                const disabled = !availableScopes[scope];
                                const icon =
                                    scope === 'tenant' ? (
                                        <Globe2 size={14} />
                                    ) : scope === 'branch' ? (
                                        <Building2 size={14} />
                                    ) : (
                                        <UserCog size={14} />
                                    );
                                return (
                                    <button
                                        key={scope}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => setActiveScope(scope)}
                                        className={`px-3 py-2 rounded-lg text-xs uppercase font-black tracking-wider flex items-center gap-2 ${
                                            activeScope === scope
                                                ? 'bg-healthcare-primary text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                                    >
                                        {icon}
                                        {scope}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="tc-table min-w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/60">
                                    <tr className="text-left text-slate-500 dark:text-slate-300">
                                        <th className="px-4 py-3 font-black uppercase text-[11px]">
                                            Setting
                                        </th>
                                        <th className="px-4 py-3 font-black uppercase text-[11px]">
                                            Effective Value
                                        </th>
                                        <th className="px-4 py-3 font-black uppercase text-[11px]">
                                            Source
                                        </th>
                                        <th className="px-4 py-3 font-black uppercase text-[11px]">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loading ? (
                                        <tr>
                                            <td className="px-4 py-8 text-slate-500" colSpan={4}>
                                                Loading settings...
                                            </td>
                                        </tr>
                                    ) : definitions.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-8 text-slate-500" colSpan={4}>
                                                No settings found for this domain.
                                            </td>
                                        </tr>
                                    ) : (
                                        definitions.map((definition) => {
                                            const effective = effectiveByKey.get(definition.key);
                                            const canEditAtScope =
                                                definition.allowed_scopes.includes(activeScope) &&
                                                !(
                                                    definition.override_mode === 'strict' &&
                                                    activeScope !== 'tenant'
                                                );
                                            const isExpanded = expandedKey === definition.key;
                                            return (
                                                <Fragment key={definition.key}>
                                                    <tr className="align-top">
                                                        <td className="px-4 py-3">
                                                            <div className="font-black text-healthcare-dark dark:text-white">
                                                                {definition.label}
                                                            </div>
                                                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                                                {definition.key}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                                                            {renderValue(
                                                                definition.value_type,
                                                                effective?.value ??
                                                                    definition.default_value,
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span
                                                                className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                                                    effective?.source === 'tenant'
                                                                        ? 'bg-sky-100 text-sky-700'
                                                                        : effective?.source ===
                                                                            'branch'
                                                                          ? 'bg-emerald-100 text-emerald-700'
                                                                          : effective?.source ===
                                                                              'user'
                                                                            ? 'bg-amber-100 text-amber-700'
                                                                            : 'bg-slate-200 text-slate-700'
                                                                }`}
                                                            >
                                                                {effective?.source || 'system'}
                                                            </span>
                                                            {definition.override_mode !== 'open' &&
                                                                activeScope !== 'tenant' && (
                                                                    <div className="text-[11px] text-slate-500 mt-1 uppercase tracking-wide font-black">
                                                                        Guardrail:{' '}
                                                                        {definition.override_mode}
                                                                    </div>
                                                                )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setExpandedKey(
                                                                            isExpanded
                                                                                ? null
                                                                                : definition.key,
                                                                        )
                                                                    }
                                                                    className="px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider"
                                                                >
                                                                    Why this value
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={!canEditAtScope}
                                                                    onClick={() =>
                                                                        onOpenEditor(
                                                                            definition,
                                                                            effective,
                                                                        )
                                                                    }
                                                                    className="px-2.5 py-1.5 rounded-md bg-healthcare-primary text-white text-xs font-black uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                                                                >
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {isExpanded && (
                                                        <tr>
                                                            <td
                                                                className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50"
                                                                colSpan={4}
                                                            >
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                                                    {(effective?.trail || []).map(
                                                                        (trailEntry, index) => (
                                                                            <div
                                                                                key={`${trailEntry.source}-${index}`}
                                                                                className="rounded-lg border border-slate-200 dark:border-slate-700 p-2.5"
                                                                            >
                                                                                <div className="font-black uppercase tracking-wider text-slate-500">
                                                                                    {
                                                                                        trailEntry.source
                                                                                    }
                                                                                </div>
                                                                                <div className="mt-1 font-semibold text-slate-700 dark:text-slate-200 break-all">
                                                                                    {renderValue(
                                                                                        definition.value_type,
                                                                                        trailEntry.value,
                                                                                    )}
                                                                                </div>
                                                                                {trailEntry.updated_at && (
                                                                                    <div className="text-[11px] text-slate-500 mt-1">
                                                                                        {formatLocalDateTime(
                                                                                            trailEntry.updated_at,
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Fragment>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 text-xs text-slate-500 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                            <Lock size={14} className="mt-0.5 text-amber-600" />
                            Sensitive keys may require approval and can be blocked by tenant
                            guardrails.
                        </div>
                            </>
                        )}
                    </section>
                </div>
            </div>

            {editing && (
                <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                        <h3 className="text-lg font-black text-healthcare-dark dark:text-white mb-1">
                            {editing.label}
                        </h3>
                        <p className="text-xs uppercase tracking-wider font-black text-slate-500 mb-4">
                            {editing.key}
                        </p>

                        {editing.value_type === 'boolean' ? (
                            <select
                                value={editing.raw_value}
                                onChange={(event) =>
                                    setEditing((prev) =>
                                        prev
                                            ? {
                                                  ...prev,
                                                  raw_value: event.target.value,
                                              }
                                            : null,
                                    )
                                }
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 font-semibold"
                            >
                                <option value="true">Enabled</option>
                                <option value="false">Disabled</option>
                            </select>
                        ) : editing.value_type === 'json' ? (
                            <textarea
                                value={editing.raw_value}
                                onChange={(event) =>
                                    setEditing((prev) =>
                                        prev
                                            ? {
                                                  ...prev,
                                                  raw_value: event.target.value,
                                              }
                                            : null,
                                    )
                                }
                                rows={8}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 font-mono text-xs"
                            />
                        ) : (
                            <input
                                type={editing.value_type === 'number' ? 'number' : 'text'}
                                value={editing.raw_value}
                                onChange={(event) =>
                                    setEditing((prev) =>
                                        prev
                                            ? {
                                                  ...prev,
                                                  raw_value: event.target.value,
                                              }
                                            : null,
                                    )
                                }
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 font-semibold"
                            />
                        )}

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={onSaveChange}
                                className="px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-healthcare-primary text-white disabled:opacity-60 flex items-center gap-2"
                            >
                                <Save size={13} />
                                {saving ? 'Saving...' : 'Save Change'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}

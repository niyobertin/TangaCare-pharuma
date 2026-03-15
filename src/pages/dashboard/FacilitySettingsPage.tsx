import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import {
    Save,
    ArrowLeft,
    Building2,
    Settings,
    Shield,
    User as UserIcon,
    AlertTriangle,
    Layout,
} from 'lucide-react';
import { StorageLocationManager } from '../../components/facility/StorageLocationManager';
import { pharmacyService } from '../../services/pharmacy.service';
import { userService } from '../../services/user.service';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import type { Facility, CreateFacilityDto } from '../../types/pharmacy';
import type { User } from '../../types/auth';
import { toast } from 'react-hot-toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '../../components/ui/Skeleton';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function FacilitySettingsPage() {
    const { facilityId } = useParams({ from: '/app/facility/$facilityId/settings' });
    const navigate = useNavigate();
    const { user, facilityId: contextFacilityId, facilities } = useAuth();
    const [activeTab, setActiveTab] = useState<'general' | 'config' | 'storage' | 'admin'>(
        'general',
    );
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [facility, setFacility] = useState<Facility | null>(null);

    const [formData, setFormData] = useState<Partial<CreateFacilityDto>>({
        name: '',
        type: 'hospital',
        address: '',
        phone: '',
        email: '',
        tax_registration_number: '',
        status: 'Active',
        departments_enabled: true,
        controlled_drug_rules_enabled: true,
        min_stock_threshold_percentage: 20,
        expiry_alert_days: 90,
        expiry_critical_days: 30,
        expiry_warning_days: 60,
        ebm_enabled: false,
    });

    const [adminQuery, setAdminQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    const role = user?.role?.toUpperCase();
    const isFacilityAdmin =
        role === 'FACILITY_ADMIN' || role === 'FACILITY ADMIN' || role === 'OWNER';
    const assignedFacilityId = contextFacilityId ?? user?.facility_id ?? facilities?.[0]?.id;

    useEffect(() => {
        if (!facilityId) return;
        if (
            role !== 'SUPER_ADMIN' &&
            role !== 'SUPER ADMIN' &&
            assignedFacilityId != null &&
            Number(facilityId) !== assignedFacilityId
        ) {
            navigate({ to: '/app/facilities' as any, search: {} as any });
            return;
        }
        loadFacility(Number(facilityId));
    }, [facilityId, isFacilityAdmin, assignedFacilityId]);

    const loadFacility = async (id: number) => {
        setLoading(true);
        try {
            const data = await pharmacyService.getFacility(id);
            setFacility(data);
            setFormData({
                name: data.name,
                type: data.type,
                address: data.address,
                phone: data.phone,
                email: data.email,
                tax_registration_number: data.tax_registration_number ?? '',
                status: data.status || 'Active',
                departments_enabled: data.departments_enabled ?? true,
                controlled_drug_rules_enabled: data.controlled_drug_rules_enabled ?? true,
                min_stock_threshold_percentage: data.min_stock_threshold_percentage ?? 20,
                expiry_alert_days: data.expiry_alert_days ?? 90,
                expiry_critical_days: data.expiry_critical_days ?? 30,
                expiry_warning_days: data.expiry_warning_days ?? 60,
                ebm_enabled: data.ebm_enabled ?? false,
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to load facility details');
            navigate({ to: '/app/facilities' as any, search: {} as any });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!facility) return;
        setSaving(true);
        try {
            await pharmacyService.updateFacility(facility.id, formData);
            toast.success('Facility settings saved');
            loadFacility(facility.id);
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleAssignAdmin = async (user: User) => {
        if (!facility) return;
        if (
            !confirm(
                `Assign ${user.first_name || user.firstName} ${user.last_name || user.lastName} as facility admin?`,
            )
        )
            return;

        setSaving(true);
        try {
            await pharmacyService.updateFacility(facility.id, { facility_admin_id: user.id });
            try {
                await userService.updateUser(user.id, {
                    role: 'facility_admin',
                    facility_id: facility.id,
                });
            } catch (userErr) {}
            toast.success('Admin assigned successfully');
            loadFacility(facility.id);
        } catch (error) {
            console.error(error);
            toast.error('Failed to assign admin');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!facility) return;
        if (
            !confirm('Are you sure you want to delete this facility? This action cannot be undone.')
        )
            return;

        setSaving(true);
        try {
            await pharmacyService.deleteFacility(facility.id);
            toast.success('Facility deleted successfully');
            navigate({ to: '/app/facilities' as any, search: {} as any });
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete facility');
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!adminQuery) {
            setUsers([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearchingUsers(true);
            try {
                const results = await userService.getUsers({ search: adminQuery, limit: 10 });
                setUsers(results.data);
            } catch (err) {
                console.error(err);
            } finally {
                setSearchingUsers(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [adminQuery]);

    if (loading) {
        return (
            <div className="p-6 max-w-5xl xl:max-w-6xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>

                <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 mb-6">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>

                <div className="max-w-4xl">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
                        <div className="space-y-6">
                            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                                <Skeleton className="h-6 w-32" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-10 w-full rounded-xl" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute
            allowedRoles={[
                'SUPER_ADMIN',
                'SUPER ADMIN',
                'FACILITY_ADMIN',
                'FACILITY ADMIN',
                'OWNER',
            ]}
            requireFacility
        >
            <div className="p-6 max-w-5xl xl:max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() =>
                            navigate({ to: '/app/facilities' as any, search: {} as any })
                        }
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-healthcare-dark">
                            Facility Settings
                        </h1>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                            Manage Configuration & Access
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <div
                            className={cn(
                                'px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2',
                                facility?.status === 'Active'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-slate-100 text-slate-500',
                            )}
                        >
                            <div
                                className={cn(
                                    'w-2 h-2 rounded-full',
                                    facility?.status === 'Active'
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-400',
                                )}
                            />
                            {facility?.status || 'Unknown'}
                        </div>
                    </div>
                </div>

                {}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={cn(
                            'px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap',
                            activeTab === 'general'
                                ? 'border-healthcare-primary text-healthcare-primary'
                                : 'border-transparent text-slate-500 hover:text-healthcare-dark hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-t-lg',
                        )}
                    >
                        <Building2 size={16} />
                        General Info
                    </button>
                    <button
                        onClick={() => setActiveTab('config')}
                        className={cn(
                            'px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap',
                            activeTab === 'config'
                                ? 'border-healthcare-primary text-healthcare-primary'
                                : 'border-transparent text-slate-500 hover:text-healthcare-dark hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-t-lg',
                        )}
                    >
                        <Settings size={16} />
                        Configuration
                    </button>
                    <button
                        onClick={() => setActiveTab('admin')}
                        className={cn(
                            'px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap',
                            activeTab === 'admin'
                                ? 'border-healthcare-primary text-healthcare-primary'
                                : 'border-transparent text-slate-500 hover:text-healthcare-dark hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-t-lg',
                        )}
                    >
                        <Shield size={16} />
                        Admin Access
                    </button>
                    <button
                        onClick={() => setActiveTab('storage')}
                        className={cn(
                            'px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap',
                            activeTab === 'storage'
                                ? 'border-healthcare-primary text-healthcare-primary'
                                : 'border-transparent text-slate-500 hover:text-healthcare-dark hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-t-lg',
                        )}
                    >
                        <Layout size={16} />
                        Storage
                    </button>
                </div>

                <div className="max-w-4xl">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                        {}
                        {activeTab === 'general' && (
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                                        <h3 className="text-lg font-black text-healthcare-dark">
                                            Basic Information
                                        </h3>
                                        <p className="text-slate-400 text-xs">
                                            Primary facility details and contact info
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">
                                                Facility Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        name: e.target.value,
                                                    }))
                                                }
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-healthcare-primary font-bold text-healthcare-dark"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">
                                                Facility Type
                                            </label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        type: e.target.value as any,
                                                    }))
                                                }
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-healthcare-primary font-bold text-healthcare-dark"
                                            >
                                                <option value="hospital">Hospital</option>
                                                <option value="clinic">Clinic</option>
                                                <option value="pharmacy_shop">Pharmacy Shop</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">
                                                Address
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.address}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        address: e.target.value,
                                                    }))
                                                }
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-healthcare-primary font-bold text-healthcare-dark"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">
                                                Phone
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        phone: e.target.value,
                                                    }))
                                                }
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-healthcare-primary font-bold text-healthcare-dark"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        email: e.target.value,
                                                    }))
                                                }
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-healthcare-primary font-bold text-healthcare-dark"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">
                                                Tax registration (TIN)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.tax_registration_number ?? ''}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        tax_registration_number: e.target.value || undefined,
                                                    }))
                                                }
                                                placeholder="Facility-level TIN for EBM/fiscal"
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-healthcare-primary font-bold text-healthcare-dark"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">
                                                Status
                                            </label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        status: e.target.value as
                                                            | 'Active'
                                                            | 'Inactive',
                                                    }))
                                                }
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-healthcare-primary font-bold text-healthcare-dark"
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {}
                                <div className="pt-8 mt-4 border-t border-slate-200 dark:border-slate-800">
                                    <h4 className="flex items-center gap-2 text-red-500 font-bold mb-4">
                                        <AlertTriangle size={18} />
                                        Danger Zone
                                    </h4>
                                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-red-700 dark:text-red-400">
                                                Delete this facility
                                            </p>
                                            <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">
                                                Once deleted, this action cannot be undone.
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleDelete}
                                            className="px-4 py-2.5 bg-white dark:bg-slate-800 text-red-500 border border-red-200 dark:border-red-900 rounded-lg text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            Delete Facility
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {}
                        {activeTab === 'config' && (
                            <div className="space-y-6">
                                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                                    <h3 className="text-lg font-black text-healthcare-dark">
                                        System Configuration
                                    </h3>
                                    <p className="text-slate-400 text-xs">
                                        Manage operational rules and thresholds
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div>
                                            <h4 className="font-bold text-healthcare-dark text-sm">
                                                Enable Departments
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Allow facility to be split into multiple departments
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!formData.departments_enabled}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        departments_enabled: e.target.checked,
                                                    }))
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-healthcare-primary"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div>
                                            <h4 className="font-bold text-healthcare-dark text-sm">
                                                Controlled Drug Rules
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Enforce strict logging for controlled substances
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!formData.controlled_drug_rules_enabled}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        controlled_drug_rules_enabled:
                                                            e.target.checked,
                                                    }))
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-healthcare-primary"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                                        <div>
                                            <h4 className="font-bold text-healthcare-dark text-sm">
                                                Active RRA EBM Integration
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Automatically submit sales to RRA EBM system
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!formData.ebm_enabled}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        ebm_enabled: e.target.checked,
                                                    }))
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-healthcare-primary"></div>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">
                                                Min Stock Threshold (%)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.min_stock_threshold_percentage}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        min_stock_threshold_percentage: Number(
                                                            e.target.value,
                                                        ),
                                                    }))
                                                }
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-healthcare-primary font-bold text-healthcare-dark"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">
                                                Expiry Alert (Days)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.expiry_alert_days}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        expiry_alert_days: Number(e.target.value),
                                                    }))
                                                }
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-healthcare-primary font-bold text-healthcare-dark"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">
                                                Expiry Warning (Days)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.expiry_warning_days}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        expiry_warning_days: Number(e.target.value),
                                                    }))
                                                }
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-healthcare-primary font-bold text-healthcare-dark"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">
                                                Expiry Critical (Days)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.expiry_critical_days}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        expiry_critical_days: Number(
                                                            e.target.value,
                                                        ),
                                                    }))
                                                }
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-healthcare-primary font-bold text-healthcare-dark"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {}
                        {activeTab === 'admin' && (
                            <div className="space-y-6">
                                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                                    <h3 className="text-lg font-black text-healthcare-dark">
                                        Facility Administrator
                                    </h3>
                                    <p className="text-slate-400 text-xs">
                                        Assign or change the primary admin for this facility
                                    </p>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <UserIcon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                                            Current Admin
                                        </p>
                                        <p className="text-base font-black text-healthcare-dark">
                                            {facility?.facility_admin
                                                ? `${facility.facility_admin.first_name || ''} ${facility.facility_admin.last_name || ''}`.trim() ||
                                                  'Admin'
                                                : facility?.admin_name || 'No Admin Assigned'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase text-slate-400">
                                        Assign New Admin
                                    </label>
                                    <input
                                        type="text"
                                        value={adminQuery}
                                        onChange={(e) => setAdminQuery(e.target.value)}
                                        placeholder="Search user by name or email..."
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-healthcare-primary font-bold"
                                    />

                                    {}
                                    {adminQuery && (
                                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                                            {searchingUsers ? (
                                                <div className="p-4 text-center text-xs text-slate-500">
                                                    Searching...
                                                </div>
                                            ) : users.length > 0 ? (
                                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {users.map((user) => (
                                                        <button
                                                            key={user.id}
                                                            onClick={() => handleAssignAdmin(user)}
                                                            className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors"
                                                        >
                                                            <div>
                                                                <div className="font-bold text-sm text-healthcare-dark">
                                                                    {user.first_name}{' '}
                                                                    {user.last_name}
                                                                </div>
                                                                <div className="text-xs text-slate-400">
                                                                    {user.email}
                                                                </div>
                                                            </div>
                                                            <div className="opacity-0 group-hover:opacity-100 text-healthcare-primary text-xs font-bold bg-teal-50 px-3 py-1 rounded-full">
                                                                Assign
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 text-center text-xs text-slate-500">
                                                    No users found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'storage' && (
                            <StorageLocationManager facilityId={Number(facilityId)} />
                        )}

                        {}
                        {activeTab !== 'admin' && (
                            <div className="flex justify-end pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-healthcare-primary text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                >
                                    {saving ? (
                                        <>Saving...</>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Package, Building2, Save, Pencil, Percent } from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { pharmacyService } from '../../services/pharmacy.service';
import type { Facility, MedicineCategory } from '../../types/pharmacy';

import { Skeleton } from '../../components/shared/Skeleton';
import { SkeletonTable } from '../../components/ui/SkeletonTable';

function PricingSkeleton() {
    return (
        <div className="space-y-8">
            <section className="glass-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-3 w-1/2" />
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-28 rounded-xl" />
                    <Skeleton className="h-8 w-20 rounded-xl" />
                </div>
            </section>

            <section className="glass-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-3 w-3/4" />
                <SkeletonTable
                    rows={5}
                    columns={4}
                    headers={['Name', 'Code', 'Default markup %']}
                    actions
                    className="border-none shadow-none"
                />
            </section>

            <section className="glass-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-3 w-full max-w-lg" />
            </section>
        </div>
    );
}

export function PricingPage() {
    const { facilityId, organizationId, user } = useAuth();
    const [facility, setFacility] = useState<Facility | null>(null);
    const [categories, setCategories] = useState<MedicineCategory[]>([]);
    const [facilityMarkup, setFacilityMarkup] = useState<string>('');
    const [savingFacility, setSavingFacility] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const [editMarkup, setEditMarkup] = useState<string>('');

    useEffect(() => {
        if (!facilityId) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        Promise.all([
            pharmacyService.getFacility(facilityId),
            pharmacyService.getCategories({ organization_id: organizationId ?? undefined }),
        ])
            .then(([fac, cats]) => {
                if (!cancelled) {
                    setFacility(fac);
                    setFacilityMarkup(String(fac.default_markup_percent ?? ''));
                    setCategories(Array.isArray(cats) ? cats : []);
                }
            })
            .catch((err) => {
                if (!cancelled)
                    setError(err?.response?.data?.message || 'Failed to load pricing data');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [facilityId, organizationId]);

    const saveFacilityMarkup = async () => {
        if (!facilityId || facility == null) return;
        const value = parseFloat(facilityMarkup);
        if (Number.isNaN(value) || value < 0) return;
        setSavingFacility(true);
        try {
            const updated = await pharmacyService.updateFacility(facilityId, {
                default_markup_percent: value,
            });
            setFacility(updated);
        } catch (err) {
            setError((err as any)?.response?.data?.message || 'Failed to save facility markup');
        } finally {
            setSavingFacility(false);
        }
    };

    const saveCategoryMarkup = async (id: number, value: number) => {
        try {
            const updated = await pharmacyService.updateCategory(id, {
                default_markup_percent: value,
            });
            setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
            setEditingCategoryId(null);
            setEditMarkup('');
        } catch (err) {
            setError((err as any)?.response?.data?.message || 'Failed to save category markup');
        }
    };

    return (
        <ProtectedRoute
            allowedRoles={['SUPER_ADMIN', 'FACILITY_ADMIN', 'OWNER', 'ADMIN', 'AUDITOR']}
            requireFacility
        >
            <div className="p-5 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div>
                    <h2 className="text-2xl font-black text-healthcare-dark tracking-tight">
                        Pricing Configuration
                    </h2>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mt-1">
                        Facility default markup, categories, and product overrides
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
                        {error}
                    </div>
                )}

                {!facilityId && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-sm">
                        Select a facility to manage pricing.
                    </div>
                )}

                {loading ? (
                    <PricingSkeleton />
                ) : (
                    <>
                        { }
                        {facility && (
                            <section className="glass-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Building2 size={20} className="text-healthcare-primary" />
                                    <h3 className="font-black text-healthcare-dark">
                                        Facility default markup
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-500 mb-3">
                                    Used when a product has no markup and no category default. (
                                    {facility.name})
                                </p>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative">
                                        <Percent
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            size={18}
                                        />
                                        <input
                                            type="number"
                                            min={0}
                                            step={0.5}
                                            value={facilityMarkup}
                                            onChange={(e) => setFacilityMarkup(e.target.value)}
                                            className="pl-10 pr-4 py-2 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold w-28"
                                        />
                                    </div>
                                    <span className="text-slate-500 text-sm">%</span>
                                    {user?.role?.toString()?.toLowerCase() !== 'auditor' && (
                                        <button
                                            onClick={saveFacilityMarkup}
                                            disabled={savingFacility}
                                            className="px-4 py-2 bg-healthcare-primary text-white rounded-xl font-black text-xs flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <Save size={14} /> Save
                                        </button>
                                    )}
                                </div>
                            </section>
                        )}

                        { }
                        <section className="glass-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Package size={20} className="text-healthcare-primary" />
                                <h3 className="font-black text-healthcare-dark">Categories</h3>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">
                                Category default markup is used for products in that category when
                                the product has no markup set.
                            </p>
                            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                            <th className="p-3 text-left font-black text-healthcare-dark uppercase text-xs">
                                                Name
                                            </th>
                                            <th className="p-3 text-left font-black text-healthcare-dark uppercase text-xs">
                                                Code
                                            </th>
                                            <th className="p-3 text-right font-black text-healthcare-dark uppercase text-xs">
                                                Default markup %
                                            </th>
                                            <th className="p-3 w-24"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((cat) => (
                                            <tr
                                                key={cat.id}
                                                className="border-b border-slate-50 dark:border-slate-800/50"
                                            >
                                                <td className="p-3 font-medium">{cat.name}</td>
                                                <td className="p-3 text-slate-500">{cat.code}</td>
                                                <td className="p-3 text-right">
                                                    {editingCategoryId === cat.id ? (
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            step={0.5}
                                                            value={editMarkup}
                                                            onChange={(e) =>
                                                                setEditMarkup(e.target.value)
                                                            }
                                                            className="w-20 text-right px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-sm"
                                                        />
                                                    ) : (
                                                        <span>
                                                            {cat.default_markup_percent ?? '—'}%
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {user?.role?.toString()?.toLowerCase() !==
                                                        'auditor' &&
                                                        (editingCategoryId === cat.id ? (
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() =>
                                                                        saveCategoryMarkup(
                                                                            cat.id,
                                                                            parseFloat(
                                                                                editMarkup,
                                                                            ) || 0,
                                                                        )
                                                                    }
                                                                    className="p-1.5 rounded-lg bg-healthcare-primary text-white"
                                                                >
                                                                    <Save size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingCategoryId(null);
                                                                        setEditMarkup('');
                                                                    }}
                                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setEditingCategoryId(cat.id);
                                                                    setEditMarkup(
                                                                        String(
                                                                            cat.default_markup_percent ??
                                                                            '',
                                                                        ),
                                                                    );
                                                                }}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                        ))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {categories.length === 0 && (
                                <p className="text-slate-500 text-sm py-4">
                                    No categories yet. Create categories from your organization
                                    settings or use the API.
                                </p>
                            )}
                        </section>

                        <section className="glass-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
                            <h3 className="font-black text-healthcare-dark mb-2">
                                Product-level markup
                            </h3>
                            <p className="text-xs text-slate-500">
                                Set markup or selling price per product in{' '}
                                <Link
                                    to={"/app/inventory" as any} search={{} as any}
                                    className="text-healthcare-primary underline"
                                >
                                    Medicines
                                </Link>
                                . Product markup overrides category and facility defaults.
                            </p>
                        </section>
                    </>
                )}
            </div>
        </ProtectedRoute>
    );
}

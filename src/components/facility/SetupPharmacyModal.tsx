import { useState } from 'react';
import { Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { pharmacyService } from '../../services/pharmacy.service';
import { useAuth } from '../../context/AuthContext';
import * as yup from 'yup';

const setupSchema = yup.object({
    organization_name: yup
        .string()
        .trim()
        .min(2, 'Organization name must be at least 2 characters')
        .required('Organization name is required'),
    organization_code: yup
        .string()
        .trim()
        .max(20, 'Organization code must be at most 20 characters')
        .optional(),
    facility_name: yup
        .string()
        .trim()
        .min(2, 'Facility name must be at least 2 characters')
        .required('Facility name is required'),
    facility_type: yup
        .mixed<'hospital' | 'clinic' | 'pharmacy_shop'>()
        .oneOf(['hospital', 'clinic', 'pharmacy_shop'])
        .required(),
    address: yup.string().trim().optional(),
    phone: yup
        .string()
        .trim()
        .matches(/^\+?[1-9]\d{1,14}$/, 'Phone number must be in international format')
        .optional(),
    email: yup.string().trim().email('Invalid email address').optional(),
});

interface SetupPharmacyModalProps {
    onSuccess: () => void;
}

export function SetupPharmacyModal({ onSuccess }: SetupPharmacyModalProps) {
    const { refreshProfile, setOrganization, setFacility } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        organization_name: '',
        organization_code: '',
        facility_name: '',
        facility_type: 'pharmacy_shop' as 'hospital' | 'clinic' | 'pharmacy_shop',
        address: '',
        phone: '',
        email: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Frontend validation aligned with backend (class-validator)
            await setupSchema.validate(form, { abortEarly: false });

            const result = await pharmacyService.setupOnboarding({
                organization_name: form.organization_name.trim(),
                organization_code: form.organization_code.trim() || undefined,
                facility_name: form.facility_name.trim(),
                facility_type: form.facility_type,
                address: form.address.trim() || undefined,
                phone: form.phone.trim() || undefined,
                email: form.email.trim() || undefined,
            });
            toast.success('Your pharmacy is set up. You can start using the app.');
            if (result.organization?.id) {
                setOrganization(result.organization.id);
                localStorage.setItem('selected_organization_id', String(result.organization.id));
            }
            if (result.facility?.id) {
                setFacility(result.facility.id);
                localStorage.setItem('selected_facility_id', String(result.facility.id));
            }
            await refreshProfile();
            onSuccess();
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Setup failed';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-healthcare-primary/10 flex items-center justify-center">
                            <Building2 className="text-healthcare-primary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-healthcare-dark">Set up your pharmacy</h2>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Create your organization and first branch (takes less than 2 minutes).
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Organization name *</label>
                        <input
                            value={form.organization_name}
                            onChange={(e) => setForm((f) => ({ ...f, organization_name: e.target.value }))}
                            placeholder="e.g. My Pharmacy Ltd"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl text-sm font-bold focus:outline-none focus:border-healthcare-primary border-slate-200 dark:border-slate-700"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Organization code (optional)</label>
                        <input
                            value={form.organization_code}
                            onChange={(e) => setForm((f) => ({ ...f, organization_code: e.target.value }))}
                            placeholder="e.g. MP"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl text-sm font-bold focus:outline-none focus:border-healthcare-primary border-slate-200 dark:border-slate-700"
                        />
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-4" />
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Branch / facility name *</label>
                        <input
                            value={form.facility_name}
                            onChange={(e) => setForm((f) => ({ ...f, facility_name: e.target.value }))}
                            placeholder="e.g. Main Branch"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl text-sm font-bold focus:outline-none focus:border-healthcare-primary border-slate-200 dark:border-slate-700"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                        <select
                            value={form.facility_type}
                            onChange={(e) => setForm((f) => ({ ...f, facility_type: e.target.value as any }))}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl text-sm font-bold focus:outline-none focus:border-healthcare-primary border-slate-200 dark:border-slate-700"
                        >
                            <option value="pharmacy_shop">Pharmacy Shop</option>
                            <option value="clinic">Clinic</option>
                            <option value="hospital">Hospital</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                        <input
                            value={form.address}
                            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                            placeholder="District, Sector, Cell"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl text-sm font-bold focus:outline-none focus:border-healthcare-primary border-slate-200 dark:border-slate-700"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                            <input
                                value={form.phone}
                                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                                placeholder="+250 7..."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl text-sm font-bold focus:outline-none focus:border-healthcare-primary border-slate-200 dark:border-slate-700"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                placeholder="contact@pharmacy.com"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl text-sm font-bold focus:outline-none focus:border-healthcare-primary border-slate-200 dark:border-slate-700"
                            />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-healthcare-primary text-white rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Create organization & branch'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

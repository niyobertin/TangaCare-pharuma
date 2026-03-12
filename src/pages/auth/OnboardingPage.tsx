import { useState } from 'react';
import { Building2, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../context/AuthContext';
import { pharmacyService } from '../../services/pharmacy.service';
import toast from 'react-hot-toast';

export function OnboardingPage() {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState<'selection' | 'create_org'>('selection');
    const [submitting, setSubmitting] = useState(false);

    // Form states for organization creation
    const [orgName, setOrgName] = useState('');
    const [legalName, setLegalName] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [medicalLicense, setMedicalLicense] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [facilityName, setFacilityName] = useState('');
    const [facilityType, setFacilityType] = useState<'pharmacy_shop' | 'hospital' | 'clinic'>(
        'pharmacy_shop',
    );

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await pharmacyService.setupOnboarding({
                organization_name: orgName,
                legal_name: legalName || undefined,
                registration_number: registrationNumber || undefined,
                medical_license: medicalLicense || undefined,
                city: city || undefined,
                country: country || undefined,
                facility_name: facilityName,
                facility_type: facilityType,
            });

            toast.success('Organization and first facility created successfully!');
            await refreshProfile();
            navigate({ to: '/app' });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to setup organization');
        } finally {
            setSubmitting(false);
        }
    };

    if (step === 'selection') {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
                <div className="max-w-4xl w-full text-center space-y-4 mb-12">
                    <h1 className="text-4xl font-black text-healthcare-dark dark:text-white tracking-tight">
                        Welcome to TangaCare, {user?.first_name}!
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                        To get started, you need to either create a new organization for your
                        business or join an existing one via invitation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    {/* Path A: Create Organization */}
                    <div
                        onClick={() => setStep('create_org')}
                        className="glass-card p-10 rounded-3xl border-2 border-transparent hover:border-healthcare-primary/30 transition-all cursor-pointer group hover:shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Building2 size={120} />
                        </div>
                        <div className="w-16 h-16 bg-healthcare-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Building2 className="text-healthcare-primary" size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-healthcare-dark dark:text-white mb-2">
                            Create Business
                        </h2>
                        <p className="text-slate-500 text-sm mb-8">
                            Register your pharmacy or clinic, setup your first branch, and start
                            managing your inventory and sales.
                        </p>
                        <div className="flex items-center gap-2 text-healthcare-primary font-bold text-sm">
                            Get Started <ArrowRight size={18} />
                        </div>
                    </div>

                    {/* Path B: Join Business */}
                    <div className="glass-card p-10 rounded-3xl border-2 border-slate-100 dark:border-slate-800 opacity-80 cursor-not-allowed grayscale relative overflow-hidden">
                        <div className="absolute top-4 right-4 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase text-slate-500">
                            Invite Only
                        </div>
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                            <Users className="text-slate-400" size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-400 dark:text-slate-500 mb-2">
                            Join Team
                        </h2>
                        <p className="text-slate-400 text-sm mb-8">
                            Already part of a pharmacy? Ask your administrator to send you an
                            invitation link to join their organization.
                        </p>
                        <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                            Waiting for Invite
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                <button
                    onClick={() => setStep('selection')}
                    className="flex items-center gap-2 text-slate-500 hover:text-healthcare-primary transition-colors font-bold mb-8 text-sm uppercase tracking-widest"
                >
                    <ArrowRight className="rotate-180" size={18} /> Back to Selection
                </button>

                <div className="glass-card p-10 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-healthcare-primary/10 rounded-xl flex items-center justify-center">
                            <Building2 className="text-healthcare-primary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-healthcare-dark dark:text-white tracking-tight">
                                Setup your Organization
                            </h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                Initial Business Configuration
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateOrg} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                    Business Name *
                                </label>
                                <input
                                    required
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    placeholder="e.g. HealthFirst Pharmacy"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:border-healthcare-primary outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                    Legal Name
                                </label>
                                <input
                                    value={legalName}
                                    onChange={(e) => setLegalName(e.target.value)}
                                    placeholder="e.g. City General Hospital Ltd"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:border-healthcare-primary outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                    Registration Number
                                </label>
                                <input
                                    value={registrationNumber}
                                    onChange={(e) => setRegistrationNumber(e.target.value)}
                                    placeholder="e.g. 123456789"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:border-healthcare-primary outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                    Medical License
                                </label>
                                <input
                                    value={medicalLicense}
                                    onChange={(e) => setMedicalLicense(e.target.value)}
                                    placeholder="e.g. MOH-8829-PH"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:border-healthcare-primary outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                    City
                                </label>
                                <input
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="e.g. Kigali"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:border-healthcare-primary outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                    Country
                                </label>
                                <input
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    placeholder="e.g. Rwanda"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:border-healthcare-primary outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 className="text-healthcare-primary" size={18} />
                                <h3 className="text-sm font-black text-healthcare-dark dark:text-white uppercase tracking-wider">
                                    Primary Facility Setup
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                        Facility (Branch) Name *
                                    </label>
                                    <input
                                        required
                                        value={facilityName}
                                        onChange={(e) => setFacilityName(e.target.value)}
                                        placeholder="e.g. Main Branch"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:border-healthcare-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                        Facility Type
                                    </label>
                                    <select
                                        value={facilityType}
                                        onChange={(e) => setFacilityType(e.target.value as any)}
                                        className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:border-healthcare-primary outline-none transition-all"
                                    >
                                        <option value="pharmacy_shop">Pharmacy Shop</option>
                                        <option value="clinic">Clinic</option>
                                        <option value="hospital">Hospital</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={submitting}
                            type="submit"
                            className="w-full py-4 bg-healthcare-primary text-white rounded-2xl font-black text-sm hover:bg-teal-700 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Complete Setup & Launch Dashboard'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

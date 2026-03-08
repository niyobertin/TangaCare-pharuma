import { useNavigate } from '@tanstack/react-router';
import {
    BookOpen,
    Bell,
    Building2,
    Lock,
    Settings as SettingsIcon,
    Users,
} from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

export function SettingsPage() {
    const navigate = useNavigate();
    const { facilityId, user } = useAuth();
    const effectiveFacilityId = facilityId ?? user?.facility_id ?? null;

    const cards = [
        {
            title: 'Facility Configuration',
            description: 'Manage storage, thresholds, and operational controls for your current facility.',
            icon: Building2,
            action: () => {
                if (!effectiveFacilityId) return;
                navigate({
                    to: '/app/facility/$facilityId/settings' as any,
                    params: { facilityId: String(effectiveFacilityId) } as any,
                    search: {} as any,
                });
            },
            disabled: !effectiveFacilityId,
            cta: effectiveFacilityId ? 'Open Facility Settings' : 'Select Facility First',
        },
        {
            title: 'Users & Roles',
            description: 'Create staff accounts, assign roles, and review access permissions.',
            icon: Users,
            action: () => navigate({ to: '/app/users' as any, search: {} as any }),
            disabled: false,
            cta: 'Manage Users',
        },
        {
            title: 'Alert Rules',
            description: 'Track stock, expiry, and risk alerts to keep operations safe and predictable.',
            icon: Bell,
            action: () => navigate({ to: '/app/alerts' as any, search: {} as any }),
            disabled: false,
            cta: 'Open Alerts',
        },
        {
            title: 'Usage Documentation',
            description: 'Read setup, inventory, dispensing, and reporting guides for your team.',
            icon: BookOpen,
            action: () => navigate({ to: '/docs' as any, search: {} as any }),
            disabled: false,
            cta: 'Open Docs',
        },
    ];

    return (
        <ProtectedRoute
            allowedRoles={['SUPER_ADMIN', 'SUPER ADMIN', 'FACILITY_ADMIN', 'FACILITY ADMIN', 'OWNER', 'ADMIN']}
            requireFacility
        >
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-healthcare-primary/10 text-healthcare-primary">
                        <SettingsIcon size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-healthcare-dark dark:text-white">
                            Settings
                        </h1>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Configuration and Access Hub
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.title}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        <Icon size={20} />
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <h2 className="text-lg font-black text-healthcare-dark dark:text-white">
                                            {card.title}
                                        </h2>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            {card.description}
                                        </p>
                                        <button
                                            onClick={card.action}
                                            disabled={card.disabled}
                                            className="mt-2 px-4 py-2 rounded-lg bg-healthcare-primary text-white text-xs font-black uppercase tracking-wider disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors"
                                        >
                                            {card.cta}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
                    <Lock className="text-amber-600 mt-0.5" size={18} />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        Security tip: review user roles monthly and revoke inactive accounts to keep controlled inventory safe.
                    </p>
                </div>
            </div>
        </ProtectedRoute>
    );
}

import { Link } from '@tanstack/react-router';
import {
    BookOpen,
    ClipboardCheck,
    Package,
    ShoppingCart,
    ShieldAlert,
    BarChart3,
    Users,
    ArrowUpRight,
} from 'lucide-react';

const sections = [
    {
        id: 'setup',
        title: '1. Initial Setup',
        icon: ClipboardCheck,
        points: [
            'Create organization and facility profile.',
            'Configure storage locations and temperature type.',
            'Invite users and assign role-based permissions.',
            'Define key thresholds: min stock, reorder points, and alert windows.',
        ],
    },
    {
        id: 'inventory',
        title: '2. Medicines and Inventory',
        icon: Package,
        points: [
            'Add medicines with code/barcode, dosage, and selling price.',
            'Receive stock using batch number, expiry date, and unit cost.',
            'Use FEFO discipline: earliest expiry must be dispensed first.',
            'Run physical counts and approve variances to keep stock accurate.',
        ],
    },
    {
        id: 'dispensing',
        title: '3. Dispensing Workflow',
        icon: ShieldAlert,
        points: [
            'Search or scan medicine barcode from the dispensing screen.',
            'Select patient and verify controlled-drug requirements.',
            'Record payments and complete sale to auto-adjust inventory.',
            'Use receipt and transaction history for traceability.',
        ],
    },
    {
        id: 'procurement',
        title: '4. Procurement and Reorder',
        icon: ShoppingCart,
        points: [
            'Review reorder suggestions daily.',
            'Create purchase orders directly from low-stock signals.',
            'Track supplier performance by lead time and fulfillment.',
            'Receive deliveries and reconcile quantity variances on arrival.',
        ],
    },
    {
        id: 'safety',
        title: '5. Safety and Compliance',
        icon: Users,
        points: [
            'Use recalls to freeze affected batch stock immediately.',
            'Keep audit logs enabled for adjustments and sensitive actions.',
            'Maintain role separation for inventory edits and approvals.',
            'Review alerts for expiry risk, stockout risk, and controlled variance.',
        ],
    },
    {
        id: 'reports',
        title: '6. Reports and KPIs',
        icon: BarChart3,
        points: [
            'Track inventory turnover, days on hand, and stock value.',
            'Monitor inventory accuracy from latest physical counts.',
            'Use movement history for investigation and audit support.',
            'Export reports for management, finance, and inspections.',
        ],
    },
];

export function DocsPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="TangaCare" className="w-9 h-9 object-contain" />
                        <span className="text-lg font-black text-slate-900 dark:text-white">TangaCare Docs</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link
                            to={'/auth/login' as any}
                            search={{} as any}
                            className="px-3 py-2 text-xs font-black uppercase tracking-wider rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Log In
                        </Link>
                        <Link
                            to={'/app' as any}
                            search={{} as any}
                            className="px-3 py-2 text-xs font-black uppercase tracking-wider rounded-lg bg-healthcare-primary text-white hover:bg-teal-700"
                        >
                            Open App
                        </Link>
                    </div>
                </div>
            </header>

            <main id="top" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-healthcare-primary/10 text-healthcare-primary">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-healthcare-dark dark:text-white">
                                How To Use TangaCare
                            </h1>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
                                Practical guide for owners, pharmacists, and store teams to run setup, inventory, dispensing,
                                procurement, and compliance workflows correctly.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {sections.map((section) => (
                        <a
                            key={section.id}
                            href={`#${section.id}`}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:border-healthcare-primary hover:text-healthcare-primary transition-colors"
                        >
                            {section.title}
                        </a>
                    ))}
                </section>

                <section className="space-y-4">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <article
                                id={section.id}
                                key={section.id}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
                            >
                                <h2 className="text-lg font-black text-healthcare-dark dark:text-white flex items-center gap-2">
                                    <Icon size={18} className="text-healthcare-primary" />
                                    {section.title}
                                </h2>
                                <ul className="mt-3 space-y-2">
                                    {section.points.map((point) => (
                                        <li key={point} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-healthcare-primary" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        );
                    })}
                </section>

                <section className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h3 className="text-base font-black text-teal-800 dark:text-teal-200">
                            Need team onboarding?
                        </h3>
                        <p className="text-sm text-teal-700 dark:text-teal-300">
                            Use this page as your SOP baseline and train every new user before access is granted.
                        </p>
                    </div>
                    <a
                        href="#top"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-700 text-white text-xs font-black uppercase tracking-wider hover:bg-teal-800"
                    >
                        Back to Top
                        <ArrowUpRight size={14} />
                    </a>
                </section>
            </main>
        </div>
    );
}

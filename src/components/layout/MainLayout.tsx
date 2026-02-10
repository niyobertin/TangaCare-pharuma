import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import {
    BarChart3,
    Package,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    Menu,
    Search,
    Bell,
    Moon,
    Sun,
    Zap,
    TrendingUp,
    ShoppingCart,
    Factory,
    Database,
    Building2,
    ChevronDown,
    FileText,
    Activity,
    AlertTriangle,
    ArrowRightLeft,
} from 'lucide-react';
import logo from '../../assets/tanga-logo.png';
import { useAuth } from '../../context/AuthContext';
import { isSuperAdmin } from '../../types/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../context/ThemeContext';
import { NotificationBell } from '../ui/NotificationBell'; // Correct path
import { FacilityEmptyState } from '../facility/FacilityEmptyState';
import { CreateFacilityModal } from '../facility/CreateFacilityModal';
import { SetupPharmacyModal } from '../facility/SetupPharmacyModal';
import { AlertBadge } from '../alerts/AlertBadge';
import { AlertPanel } from '../alerts/AlertPanel';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NavItem {
    to: string;
    icon: React.ComponentType<{ size: number }>;
    label: string;
    allowedRoles?: string[];
    allowedPermissions?: string[];
    children?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
    {
        to: '/app',
        icon: BarChart3,
        label: 'Dashboard',
        allowedRoles: [
            'SUPER_ADMIN',
            'SUPER ADMIN',
            'FACILITY_ADMIN',
            'FACILITY ADMIN',
            'OWNER',
            'CASHIER',
            'PHARMACIST',
            'STORE_MANAGER',
            'STORE MANAGER',
            'AUDITOR',
            'ADMIN',
        ],
    },
    {
        to: '/app/organizations',
        icon: Building2,
        label: 'Organizations',
        allowedRoles: ['SUPER_ADMIN', 'SUPER ADMIN'],
        allowedPermissions: ['organization:manage'],
    },
    {
        to: '/app/users',
        icon: Users,
        label: 'Users',
        allowedRoles: [
            'SUPER_ADMIN',
            'SUPER ADMIN',
            'OWNER',
            'FACILITY_ADMIN',
            'FACILITY ADMIN',
            'AUDITOR',
        ],
        allowedPermissions: ['users:read', 'users:manage'],
    },
    {
        to: '/app/facilities',
        icon: Factory,
        label: 'Facilities',
        allowedRoles: ['SUPER_ADMIN', 'SUPER ADMIN', 'OWNER', 'AUDITOR'],
        allowedPermissions: ['facility:read', 'facility:manage'],
    },
    {
        to: '/app/procurement',
        icon: ShoppingCart,
        label: 'Procurement',
        allowedRoles: [
            'SUPER_ADMIN',
            'FACILITY_ADMIN',
            'FACILITY ADMIN',
            'OWNER',
            'STORE_MANAGER',
            'STORE MANAGER',
            'AUDITOR',
            'ADMIN',
        ],
    },
    {
        to: '/app/dispensing',
        icon: Zap,
        label: 'Dispensing',
        allowedRoles: [
            'SUPER_ADMIN',
            'FACILITY_ADMIN',
            'FACILITY ADMIN',
            'OWNER',
            'CASHIER',
            'PHARMACIST',
            'AUDITOR',
            'ADMIN',
        ],
    },
    {
        to: '/app/inventory',
        icon: Package,
        label: 'Medicines',
        allowedRoles: [
            'SUPER_ADMIN',
            'FACILITY_ADMIN',
            'FACILITY ADMIN',
            'OWNER',
            'CASHIER',
            'STORE_MANAGER',
            'STORE MANAGER',
            'PHARMACIST',
            'AUDITOR',
            'ADMIN',
            'DOCTOR',
        ],
    },
    {
        to: '/app/stock',
        icon: Database,
        label: 'Stock & Batches',
        allowedRoles: [
            'SUPER_ADMIN',
            'FACILITY_ADMIN',
            'FACILITY ADMIN',
            'OWNER',
            'STORE_MANAGER',
            'STORE MANAGER',
            'PHARMACIST',
            'AUDITOR',
            'ADMIN',
        ],
    },
    {
        to: '/app/alerts',
        icon: Bell,
        label: 'Alerts',
        allowedRoles: [
            'SUPER_ADMIN',
            'FACILITY_ADMIN',
            'FACILITY ADMIN',
            'OWNER',
            'STORE_MANAGER',
            'STORE MANAGER',
            'PHARMACIST',
            'AUDITOR',
            'ADMIN',
        ],
    },
    {
        to: '/app/patients',
        icon: Users,
        label: 'Customers',
        allowedRoles: [
            'SUPER_ADMIN',
            'FACILITY_ADMIN',
            'FACILITY ADMIN',
            'OWNER',
            'PHARMACIST',
            'AUDITOR',
            'ADMIN',
        ],
    },
    {
        to: '/app/analytics',
        icon: FileText,
        label: 'Reports',
        allowedRoles: [
            'SUPER_ADMIN',
            'SUPER ADMIN',
            'FACILITY_ADMIN',
            'FACILITY ADMIN',
            'OWNER',
            'STORE_MANAGER',
            'STORE MANAGER',
            'AUDITOR',
            'ADMIN',
        ],
        allowedPermissions: ['reports:read'],
        children: [
            { to: '/app/analytics/sales', label: 'Sales Report', icon: TrendingUp },
            { to: '/app/analytics/profit', label: 'Profit Report', icon: Activity },
            { to: '/app/analytics/inventory', label: 'Stock Report', icon: ShoppingCart },
            { to: '/app/analytics/low-stock', label: 'Low Stock & Reorder', icon: Package },
            { to: '/app/analytics/recall', label: 'Expiry Report', icon: AlertTriangle },
            { to: '/app/analytics/movement', label: 'Item Movement', icon: ArrowRightLeft },
            { to: '/app/analytics/tax', label: 'Tax & Compliance', icon: FileText },
            { to: '/app/analytics/loyalty', label: 'Customer Report', icon: Users },
            { to: '/app/analytics/procurement', label: 'Purchase Report', icon: Factory },
            { to: '/app/analytics/performance', label: 'Staff Performance', icon: Users },
        ],
    },
    {
        to: '/app/audit-logs',
        icon: TrendingUp,
        label: 'Audit Logs',
        allowedRoles: [
            'SUPER_ADMIN',
            'FACILITY_ADMIN',
            'FACILITY ADMIN',
            'OWNER',
            'AUDITOR',
            'ADMIN',
            'STORE_MANAGER',
        ],
        allowedPermissions: ['audit:read'],
    },
    {
        to: '/app/stock-movements',
        icon: Database,
        label: 'Stock Movement History',
        allowedRoles: [
            'SUPER_ADMIN',
            'FACILITY_ADMIN',
            'FACILITY ADMIN',
            'OWNER',
            'AUDITOR',
            'PHARMACIST',
            'STORE_MANAGER',
            'ADMIN',
        ],
        allowedPermissions: ['stock_movements:read'],
    },
    {
        to: '/app/pricing',
        icon: TrendingUp,
        label: 'Pricing',
        allowedRoles: [
            'SUPER_ADMIN',
            'FACILITY_ADMIN',
            'FACILITY ADMIN',
            'OWNER',
            'ADMIN',
            'AUDITOR',
        ],
        allowedPermissions: ['pricing:read', 'pricing:manage'],
    },
    {
        to: '/app/settings',
        icon: Settings,
        label: 'Settings',
        allowedRoles: ['SUPER_ADMIN', 'FACILITY_ADMIN', 'FACILITY ADMIN', 'OWNER', 'ADMIN'],
    },
];

interface SidebarLinkProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    isCollapsed: boolean;
    children?: NavItem[];
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, isCollapsed, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = children && children.length > 0;

    const handleClick = (e: React.MouseEvent) => {
        if (hasChildren) {
            e.preventDefault();
            setIsOpen(!isOpen);
        }
    };

    return (
        <div>
            <Link
                to={to}
                onClick={handleClick}
                activeProps={{
                    className:
                        'bg-healthcare-primary/10 text-healthcare-primary dark:bg-healthcare-primary dark:text-white shadow-none',
                }}
                className={cn(
                    'flex items-center px-4 py-2.5 text-slate-500 hover:bg-teal-50 dark:hover:bg-teal-900 hover:text-healthcare-primary rounded-lg transition-all group justify-between',
                    isCollapsed ? 'justify-center px-0 mx-auto w-10' : 'gap-3',
                )}
            >
                <div
                    className={cn(
                        'flex items-center gap-3',
                        isCollapsed && 'justify-center w-full',
                    )}
                >
                    <span className="group-hover:scale-105 transition-transform flex-shrink-0">
                        {icon}
                    </span>
                    {!isCollapsed && (
                        <span className="font-bold text-sm whitespace-nowrap">{label}</span>
                    )}
                </div>
                {!isCollapsed && hasChildren && (
                    <ChevronDown
                        size={14}
                        className={cn('transition-transform', isOpen ? 'rotate-180' : '')}
                    />
                )}
            </Link>
            {!isCollapsed && isOpen && hasChildren && (
                <div className="ml-9 mt-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 pl-2">
                    {children.map((child) => (
                        <Link
                            key={child.to}
                            to={child.to}
                            activeProps={{
                                className:
                                    'text-healthcare-primary font-bold bg-teal-50/50 dark:bg-teal-900/20',
                            }}
                            className="block px-3 py-2 text-sm text-slate-500 hover:text-healthcare-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                        >
                            {child.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export function MainLayout() {
    const {
        logout,
        user,
        facilities,
        currentFacility,
        setFacility,
        organizations,
        currentOrg,
        setOrganization,
        refreshProfile,
        facilityId,
        organizationId,
    } = useAuth();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [showAlertPanel, setShowAlertPanel] = useState(false);

    // Filter logic for navigation items...
    const filteredNavItems = NAV_ITEMS.filter((item) => {
        if (
            item.allowedPermissions &&
            !item.allowedPermissions.some((perm) => user?.permissions?.includes(perm))
        ) {
            return false;
        }

        if (item.allowedRoles) {
            const userRole = (user?.role || '').toString().toUpperCase();
            const hasRole = item.allowedRoles.some(
                (role) =>
                    role.toUpperCase() === userRole ||
                    role.toUpperCase().replace('_', ' ') === userRole.replace('_', ' '),
            );
            // Also checking for standard normalization just in case
            if (!hasRole) return false;
        }

        return true;
    });

    const handleLogout = () => {
        logout();
        navigate({ to: '/login' });
    };

    const isSuperAdminUser = isSuperAdmin(user?.role);

    // Logic to determine if we show facility switcher
    // Show switcher if user has access to multiple facilities OR organizations
    // OR if they are a super admin (who can see everything)
    const showSwitcher = organizations.length > 0 || facilities.length > 0 || isSuperAdminUser;

    // Logic to determine the label of the switcher
    const switcherLabel =
        currentFacility?.name ??
        facilities[0]?.name ??
        (user as any)?.facility?.name ??
        'Select Facility';

    // Logic to check if user needs to run onboarding
    // If user has NO organization AND is an admin/owner type role
    // they should be prompted to create one.
    const needsOnboarding =
        !organizationId &&
        !currentOrg &&
        ['OWNER', 'SUPER_ADMIN', 'SUPER ADMIN'].includes(user?.role || '');

    // Logic for unassigned admin
    // User belongs to org but has no facility assigned/created yet
    const isUnassignedAdmin =
        organizationId &&
        facilities.length === 0 &&
        ['OWNER', 'FACILITY_ADMIN', 'FACILITY ADMIN'].includes(user?.role || '');

    // Determine if we should show "All Facilities" option
    // Only for Owners/Super Admins who want an aggregate view
    const showAllFacilitiesOption = ['OWNER', 'SUPER_ADMIN', 'SUPER ADMIN'].includes(
        user?.role || '',
    );

    // If a user only has access to exactly one facility and one org,
    // we might just show the static name instead of a dropdown, unless they create more.
    const showFacilityNameOnly =
        !isSuperAdminUser && facilities.length <= 1 && organizations.length <= 1;

    // Logic to determine if we show facility switcher

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Sidebar */}
            <aside
                className={cn(
                    'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out shadow-lg z-20 m-3 rounded-2xl h-[calc(100vh-24px)]',
                    isCollapsed ? 'w-20' : 'w-72',
                )}
            >
                <div className="h-20 flex items-center px-6 border-b border-slate-50 dark:border-slate-800/50">
                    <div className="flex items-center gap-3 w-full">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-healthcare-primary/20 rounded-xl blur-lg group-hover:bg-healthcare-primary/30 transition-all duration-500" />
                            <img
                                src={logo}
                                alt="TangaCare"
                                className="h-10 w-10 relative z-10 rounded-xl shadow-sm transform group-hover:scale-105 transition-transform duration-300 object-cover bg-white"
                            />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="font-black text-xl tracking-tight text-healthcare-dark dark:text-white font-display">
                                    Tanga<span className="text-healthcare-primary">Care</span>
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">
                                    Pharmacy OS
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                    {filteredNavItems.map((item) => (
                        <SidebarLink
                            key={item.to}
                            to={item.to}
                            icon={<item.icon size={18} />}
                            label={item.label}
                            isCollapsed={isCollapsed}
                            children={item.children}
                        />
                    ))}
                </nav>

                <div className="p-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            'flex items-center gap-3 px-4 py-2.5 w-full text-left text-healthcare-danger hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-all group font-bold text-sm',
                            isCollapsed && 'justify-center px-0',
                        )}
                    >
                        <LogOut
                            size={18}
                            className="group-hover:translate-x-0.5 transition-transform"
                        />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col overflow-hidden relative p-3 pl-0">
                <header className="glass-header rounded-xl mb-3 px-5 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-5 flex-1">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-1.5 hover:bg-teal-50 dark:hover:bg-teal-900 rounded-lg text-healthcare-primary transition-colors border border-teal-50 dark:border-teal-900"
                        >
                            {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
                        </button>

                        <div className="relative max-w-sm lg:max-w-md w-full hidden md:block">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                            />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-900/50 border border-transparent dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-healthcare-primary/10 focus:border-healthcare-primary transition-all text-sm dark:text-white dark:placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 font-sans">
                        {showFacilityNameOnly ? (
                            <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 min-w-0 max-w-[180px]">
                                <span
                                    className="truncate block text-xs font-bold text-healthcare-dark dark:text-white"
                                    title={
                                        currentFacility?.name ??
                                        facilities[0]?.name ??
                                        user?.facility?.name ??
                                        'Facility'
                                    }
                                >
                                    {currentFacility?.name ??
                                        facilities[0]?.name ??
                                        (user as any)?.facility?.name ??
                                        '—'}
                                </span>
                            </div>
                        ) : (
                            showSwitcher && (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setSwitcherOpen(!switcherOpen)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-left min-w-0 max-w-[180px]"
                                    >
                                        <Building2
                                            size={16}
                                            className="text-healthcare-primary flex-shrink-0"
                                        />
                                        <span className="truncate text-xs font-bold text-healthcare-dark dark:text-white">
                                            {facilityId == null && isSuperAdminUser
                                                ? 'All Facilities (System)'
                                                : facilities.length > 0
                                                    ? switcherLabel
                                                    : (currentOrg?.name ?? 'Select context')}
                                        </span>
                                        <ChevronDown
                                            size={14}
                                            className="flex-shrink-0 text-slate-400"
                                        />
                                    </button>
                                    {switcherOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setSwitcherOpen(false)}
                                            />
                                            <div className="absolute right-0 top-full mt-1 z-20 w-64 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                                                {organizations.length > 1 && (
                                                    <div className="px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                        Organization
                                                    </div>
                                                )}
                                                {organizations.map((org) => (
                                                    <button
                                                        key={org.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setOrganization(org.id);
                                                            setSwitcherOpen(false);
                                                            refreshProfile();
                                                        }}
                                                        className={`w-full px-4 py-2 text-left text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 ${organizationId === org.id ? 'text-healthcare-primary bg-teal-50 dark:bg-teal-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                                                    >
                                                        {org.name} {org.code && `(${org.code})`}
                                                    </button>
                                                ))}
                                                {facilities.length > 0 && (
                                                    <div className="px-3 py-1.5 mt-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-t border-slate-200 dark:border-slate-700">
                                                        Facility
                                                    </div>
                                                )}
                                                {showAllFacilitiesOption && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFacility(null);
                                                            setSwitcherOpen(false);
                                                            refreshProfile();
                                                        }}
                                                        className={`w-full px-4 py-2 text-left text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 ${facilityId == null ? 'text-healthcare-primary bg-teal-50 dark:bg-teal-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                                                    >
                                                        🌐 All Facilities{' '}
                                                        {isSuperAdminUser && '(System-Wide)'}
                                                    </button>
                                                )}
                                                {facilities.map((fac) => (
                                                    <button
                                                        key={fac.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setFacility(fac.id);
                                                            setSwitcherOpen(false);
                                                            refreshProfile();
                                                        }}
                                                        className={`w-full px-4 py-2 text-left text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 ${facilityId === fac.id ? 'text-healthcare-primary bg-teal-50 dark:bg-teal-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                                                    >
                                                        {fac.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        )}
                        <div className="flex items-center gap-1.5 mr-1">
                            {/* Replaced static bell with smart component */}
                            <NotificationBell />

                            {/* Alert Badge with Panel */}
                            <div onClick={() => setShowAlertPanel(!showAlertPanel)}>
                                <AlertBadge />
                            </div>

                            <button
                                onClick={toggleTheme}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                            >
                                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                        </div>

                        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-healthcare-dark dark:text-white text-xs uppercase tracking-tight">
                                    {user
                                        ? `${user.firstName || user.first_name} ${user.lastName || user.last_name}`
                                        : 'Loading...'}
                                </span>
                                <span className="text-[9px] text-healthcare-primary font-black uppercase tracking-widest">
                                    {user?.role || 'User'}
                                </span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-healthcare-primary/10 border border-healthcare-primary/20 flex items-center justify-center text-healthcare-primary text-xs font-black shadow-sm uppercase">
                                {user
                                    ? `${(user.firstName || user.first_name || '?')[0]}${(user.lastName || user.last_name || '?')[0]}`
                                    : '??'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto rounded-xl">
                    <div className="max-w-screen-2xl mx-auto h-full">
                        {needsOnboarding ? (
                            <>
                                <FacilityEmptyState
                                    onCreateClick={() => setShowSetupModal(true)}
                                    noOrganization
                                />
                                {showSetupModal && (
                                    <SetupPharmacyModal
                                        onSuccess={() => {
                                            setShowSetupModal(false);
                                            refreshProfile();
                                        }}
                                    />
                                )}
                            </>
                        ) : isUnassignedAdmin ? (
                            <>
                                <FacilityEmptyState
                                    onCreateClick={() => setShowCreateModal(true)}
                                />
                                {showCreateModal && (
                                    <CreateFacilityModal
                                        onClose={() => setShowCreateModal(false)}
                                    />
                                )}
                            </>
                        ) : (
                            <Outlet />
                        )}
                    </div>
                </div>
            </main>

            {/* Alert Panel */}
            <AlertPanel isOpen={showAlertPanel} onClose={() => setShowAlertPanel(false)} />
        </div>
    );
}

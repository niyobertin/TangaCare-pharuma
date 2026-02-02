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
} from 'lucide-react';
import logo from '../../assets/tanga-logo.png';
import { useAuth } from '../../context/AuthContext';
import { isSuperAdmin } from '../../types/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NavItem {
    to: string;
    icon: React.ComponentType<{ size: number }>;
    label: string;
    /** Show if user has any of these roles (fallback when no allowedPermissions) */
    allowedRoles?: string[];
    /** Show if user has any of these permissions (from /me). Takes precedence when both set. */
    allowedPermissions?: string[];
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
        allowedRoles: ['SUPER_ADMIN', 'SUPER ADMIN', 'OWNER', 'FACILITY_ADMIN', 'FACILITY ADMIN'],
        allowedPermissions: ['users:manage'],
    },
    {
        to: '/app/facilities',
        icon: Factory,
        label: 'Facilities',
        allowedRoles: ['SUPER_ADMIN', 'SUPER ADMIN', 'OWNER'],
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
            'STORE_MANAGER',
            'STORE MANAGER',
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
            'STORE_MANAGER',
        ],
        allowedPermissions: ['pricing:manage'],
    },
    {
        to: '/app/settings',
        icon: Settings,
        label: 'Settings',
        allowedRoles: ['SUPER_ADMIN', 'FACILITY_ADMIN', 'FACILITY ADMIN', 'OWNER', 'ADMIN'],
    },
];

import { CreateFacilityModal } from '../facility/CreateFacilityModal';
import { FacilityEmptyState } from '../facility/FacilityEmptyState';
import { SetupPharmacyModal } from '../facility/SetupPharmacyModal';

const PHARMACY_ROLES = [
    'FACILITY_ADMIN',
    'FACILITY ADMIN',
    'OWNER',
    'CASHIER',
    'PHARMACIST',
    'STORE_MANAGER',
    'STORE MANAGER',
    'AUDITOR',
];

export const MainLayout: React.FC = () => {
    const {
        user,
        logout,
        organizationId,
        facilityId,
        organizations,
        facilities,
        setOrganization,
        setFacility,
        refreshProfile,
        can,
    } = useAuth();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const role = user?.role?.toUpperCase();
    const currentOrg = organizations.find((o) => o.id === organizationId) ?? organizations[0];
    const currentFacility =
        facilityId != null ? (facilities.find((f) => f.id === facilityId) ?? null) : null;
    const isOwner = role === 'OWNER';
    const isSuperAdminUser = isSuperAdmin(user?.role);
    const showFacilityNameOnly = !isOwner && !isSuperAdminUser;
    const showAllFacilitiesOption = isSuperAdminUser || (isOwner && facilities.length >= 1);
    const switcherLabel =
        facilityId == null && (facilities.length > 0 || isSuperAdminUser)
            ? 'All facilities'
            : (currentFacility?.name ?? facilities[0]?.name ?? 'Select context');

    const isPharmacyRole = role && PHARMACY_ROLES.includes(role);
    const needsOnboarding = isPharmacyRole && !user?.organization_id;
    const isUnassignedAdmin =
        isPharmacyRole && user?.organization_id && !user?.facility_id && !user?.facility;

    const handleLogout = async () => {
        await logout();
        navigate({ to: '/auth/login' });
    };

    const toggleTheme = () => {
        setIsDark(!isDark);
        if (!isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <div
            className={cn(
                'flex h-screen bg-healthcare-surface font-sans transition-colors duration-300',
                isDark && 'dark',
            )}
        >
            {/* Sidebar */}
            <aside
                className={cn(
                    'glass-card m-3 rounded-xl flex flex-col overflow-hidden border-slate-200 transition-all duration-300 ease-in-out shadow-sm',
                    isCollapsed ? 'w-20' : 'w-60 lg:w-64 xl:w-72',
                )}
            >
                <div
                    className={cn(
                        'p-5 flex items-center transition-all duration-300',
                        isCollapsed ? 'justify-center px-0' : 'gap-3',
                    )}
                >
                    <div className="bg-white dark:bg-slate-800 p-1 rounded-lg flex-shrink-0 border border-teal-50 dark:border-slate-700 overflow-hidden shadow-sm">
                        <img src={logo} alt="TangaCare Logo" className="w-7 h-7 object-contain" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-lg font-black text-healthcare-dark whitespace-nowrap overflow-hidden transition-all duration-300 tracking-tight">
                            TangaCare
                        </span>
                    )}
                </div>

                <nav className="flex-1 px-2 space-y-1 py-4 overflow-y-auto custom-scrollbar">
                    {user &&
                        NAV_ITEMS.map((item) => {
                            const perms = item.allowedPermissions || [];
                            const roles = item.allowedRoles || [];
                            const hasPermission = perms.length > 0 && perms.some((p) => can(p));
                            const normalizedRole = (typeof role === 'string' ? role : '').toUpperCase().replace(/\s+/g, ' ');
                            const normalizedAllowed = roles.map((r) =>
                                (typeof r === 'string' ? r : String(r)).toUpperCase().replace(/\s+/g, ' '),
                            );
                            const hasRole =
                                roles.length === 0 || normalizedAllowed.includes(normalizedRole);
                            const isAllowed = hasPermission || hasRole;
                            if (!isAllowed) return null;

                            if (needsOnboarding || isUnassignedAdmin) return null;

                            return (
                                <SidebarLink
                                    key={item.to}
                                    to={item.to}
                                    icon={<item.icon size={18} />}
                                    label={item.label}
                                    isCollapsed={isCollapsed}
                                />
                            );
                        })}
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

            {/* Main Content */}
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
                                className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-healthcare-primary/10 focus:border-healthcare-primary transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 font-sans">
                        {showFacilityNameOnly ? (
                            <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-w-0 max-w-[180px]">
                                <span
                                    className="truncate block text-xs font-bold text-healthcare-dark"
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
                            (organizations.length > 0 || facilities.length > 0 || isSuperAdminUser) && (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setSwitcherOpen(!switcherOpen)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left min-w-0 max-w-[180px]"
                                    >
                                        <Building2
                                            size={16}
                                            className="text-healthcare-primary flex-shrink-0"
                                        />
                                        <span className="truncate text-xs font-bold text-healthcare-dark">
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
                                                        🌐 All Facilities {isSuperAdminUser && '(System-Wide)'}
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
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors relative">
                                <Bell size={18} />
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
                            </button>
                            <button
                                onClick={toggleTheme}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                            >
                                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                        </div>

                        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-healthcare-dark text-xs uppercase tracking-tight">
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
        </div>
    );
};

interface SidebarLinkProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    isCollapsed: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, isCollapsed }) => {
    return (
        <Link
            to={to}
            activeProps={{
                className:
                    'bg-healthcare-primary/10 text-healthcare-primary dark:bg-healthcare-primary shadow-none',
            }}
            className={cn(
                'flex items-center px-4 py-2.5 text-slate-500 hover:bg-teal-50 dark:hover:bg-teal-900 hover:text-healthcare-primary rounded-lg transition-all group',
                isCollapsed ? 'justify-center px-0 mx-auto w-10' : 'gap-3',
            )}
        >
            <span className="group-hover:scale-105 transition-transform flex-shrink-0">{icon}</span>
            {!isCollapsed && <span className="font-bold text-sm whitespace-nowrap">{label}</span>}
        </Link>
    );
};

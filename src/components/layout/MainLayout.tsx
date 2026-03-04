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
    ArrowLeft,
    ShieldCheck,
} from 'lucide-react';
import logo from '../../assets/tanga-logo.png';
import { useAuth } from '../../context/AuthContext';
import { GlobalLoading } from '../ui/GlobalLoading';
import { isSuperAdmin } from '../../types/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../context/ThemeContext';
import { NotificationBell } from '../ui/NotificationBell';
import { FacilityEmptyState } from '../facility/FacilityEmptyState';
import { CreateFacilityModal } from '../facility/CreateFacilityModal';
import { SetupPharmacyModal } from '../facility/SetupPharmacyModal';
import { JoinOrganizationModal } from '../facility/JoinOrganizationModal';

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
        to: '/app/insurance',
        icon: ShieldCheck,
        label: 'Insurance',
        allowedRoles: [
            'SUPER_ADMIN',
            'FACILITY_ADMIN',
            'OWNER',
            'ADMIN',
            'PHARMACIST',
            'AUDITOR',
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
                to={to as any}
                search={{} as any}
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
                            to={child.to as any}
                            search={{} as any}
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
        setOrganization,
        refreshProfile,
        organizationId,
        facilityId,
        hasOrganization,
        isOwner,
        isLoading,
    } = useAuth();
    if (isLoading) return <GlobalLoading />;
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            if (!hasRole) return false;
        }

        return true;
    });

    const handleLogout = () => {
        logout();
        navigate({ to: '/auth/login' as any, search: {} as any });
    };

    const isSuperAdminUser = isSuperAdmin(user?.role);

    const showSwitcher = organizations.length > 0 || facilities.length > 0 || isSuperAdminUser || isOwner;

    const switcherLabel =
        currentFacility?.name ??
        facilities[0]?.name ??
        (user as any)?.facility?.name ??
        'Select Facility';

    const normalizedRole = (user?.role || '').toLowerCase().replace(/[\s_]+/g, '');

    const isOwnerOrAdmin = ['owner', 'superadmin', 'facilityadmin'].includes(normalizedRole);

    const needsOnboarding = !hasOrganization && (isOwnerOrAdmin || normalizedRole === 'user');

    const isUnassignedAdmin =
        hasOrganization &&
        facilities.length === 0 &&
        !user?.facility_id &&
        !user?.facility &&
        isOwnerOrAdmin;


    React.useEffect(() => {
        const path = window.location.pathname;
        if ((needsOnboarding || isUnassignedAdmin) && path !== '/app/facilities') {
            navigate({ to: '/app/facilities' as any, replace: true, search: {} as any } as any);
        }
    }, [needsOnboarding, isUnassignedAdmin, navigate]);

    const showAllFacilitiesOption = ['OWNER', 'SUPER_ADMIN', 'SUPER ADMIN'].includes(
        user?.role || '',
    );

    const showFacilityNameOnly =
        !isSuperAdminUser && !isOwner && facilities.length <= 1 && organizations.length <= 1;

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
            {/* Backdrop for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside
                className={cn(
                    'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out shadow-lg z-40 lg:z-20 m-3 rounded-2xl h-[calc(100vh-24px)]',
                    'lg:static fixed top-0 bottom-0 left-0',
                    isCollapsed ? 'lg:w-20' : 'lg:w-72',
                    isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0',
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
                        {(!isCollapsed || isMobileMenuOpen) && (
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
                    <Link
                        to="/"
                        className={cn(
                            'flex items-center gap-3 px-4 py-2.5 w-full text-left text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20 rounded-xl transition-all group font-bold text-sm mb-4 border border-teal-100 dark:border-teal-900/30 shadow-sm',
                            isCollapsed && !isMobileMenuOpen && 'lg:justify-center lg:px-0',
                        )}
                    >
                        <ArrowLeft
                            size={18}
                            className="group-hover:-translate-x-1 transition-transform"
                        />
                        {(!isCollapsed || isMobileMenuOpen) && <span>Back to Website</span>}
                    </Link>

                    {filteredNavItems.map((item) => (
                        <SidebarLink
                            key={item.to}
                            to={item.to}
                            icon={<item.icon size={18} />}
                            label={item.label}
                            isCollapsed={isCollapsed && !isMobileMenuOpen}
                            children={item.children}
                        />
                    ))}
                </nav>

                <div className="p-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            'flex items-center gap-3 px-4 py-2.5 w-full text-left text-healthcare-danger hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-all group font-bold text-sm',
                            isCollapsed && !isMobileMenuOpen && 'lg:justify-center lg:px-0',
                        )}
                    >
                        <LogOut
                            size={18}
                            className="group-hover:translate-x-0.5 transition-transform"
                        />
                        {(!isCollapsed || isMobileMenuOpen) && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden relative p-2 md:p-3 lg:pl-0">
                <header className="glass-header rounded-xl mb-3 px-3 md:px-5 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3 md:gap-5 flex-1 min-w-0">
                        <button
                            onClick={() => {
                                if (window.innerWidth < 1024) {
                                    setIsMobileMenuOpen(!isMobileMenuOpen);
                                } else {
                                    setIsCollapsed(!isCollapsed);
                                }
                            }}
                            className="p-1.5 md:p-2 hover:bg-teal-50 dark:hover:bg-teal-900 rounded-lg text-healthcare-primary transition-colors border border-teal-50 dark:border-teal-900 flex-shrink-0"
                        >
                            <span className="lg:block hidden">
                                {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
                            </span>
                            <span className="lg:hidden block">
                                <Menu size={20} />
                            </span>
                        </button>

                        <div className="relative max-w-sm lg:max-w-md w-full hidden sm:block">
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

                    <div className="flex items-center gap-2 md:gap-3 font-sans ml-2">
                        <div className="hidden xs:flex items-center">
                            {showFacilityNameOnly ? (
                                <div className="px-2 md:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 min-w-0 max-w-[120px] md:max-w-[180px]">
                                    <span
                                        className="truncate block text-[10px] md:text-xs font-bold text-healthcare-dark dark:text-white"
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
                                            className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-left min-w-0 max-w-[120px] md:max-w-[180px]"
                                        >
                                            <Building2
                                                size={14}
                                                className="text-healthcare-primary flex-shrink-0 md:size-4"
                                            />
                                            <span className="truncate text-[10px] md:text-xs font-bold text-healthcare-dark dark:text-white">
                                                {facilityId == null
                                                    ? 'All Facilities'
                                                    : switcherLabel}
                                            </span>
                                            <ChevronDown
                                                size={12}
                                                className="flex-shrink-0 text-slate-400 md:size-3.5"
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
                        </div>

                        <div className="flex items-center gap-1 md:gap-1.5">
                            <NotificationBell />

                            <button
                                onClick={toggleTheme}
                                className="p-1.5 md:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                            >
                                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                        </div>

                        <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-3 border-l border-slate-200 dark:border-slate-800">
                            <div className="hidden lg:flex flex-col items-end">
                                <span className="font-bold text-healthcare-dark dark:text-white text-xs uppercase tracking-tight">
                                    {user
                                        ? `${user.firstName || user.first_name} ${user.lastName || user.last_name}`
                                        : 'Loading...'}
                                </span>
                                <span className="text-[9px] text-healthcare-primary font-black uppercase tracking-widest">
                                    {user?.role || 'User'}
                                </span>
                            </div>
                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-healthcare-primary/10 border border-healthcare-primary/20 flex items-center justify-center text-healthcare-primary text-xs font-black shadow-sm uppercase flex-shrink-0">
                                {user
                                    ? `${(user.firstName || user.first_name || '?')[0]}${(user.lastName || user.last_name || '?')[0]}`
                                    : '??'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto rounded-xl">
                    <div className="max-w-screen-2xl mx-auto h-full px-0.5">
                        {needsOnboarding && !window.location.pathname.includes('/onboarding') ? (
                            <>
                                <FacilityEmptyState
                                    onCreateClick={() => setShowSetupModal(true)}
                                    onJoinClick={() => setShowJoinModal(true)}
                                    noOrganization
                                />
                                {showSetupModal && (
                                    <SetupPharmacyModal
                                        onSuccess={() => {
                                            setShowSetupModal(false);
                                            refreshProfile();
                                        }}
                                        onClose={() => setShowSetupModal(false)}
                                    />
                                )}
                                <JoinOrganizationModal
                                    isOpen={showJoinModal}
                                    onClose={() => setShowJoinModal(false)}
                                />
                            </>
                        ) : isUnassignedAdmin && !window.location.pathname.includes('/onboarding') ? (
                            <>
                                <FacilityEmptyState
                                    onCreateClick={() => setShowCreateModal(true)}
                                    onJoinClick={() => setShowJoinModal(true)}
                                />
                                {showCreateModal && (
                                    <CreateFacilityModal
                                        onClose={() => setShowCreateModal(false)}
                                    />
                                )}
                                <JoinOrganizationModal
                                    isOpen={showJoinModal}
                                    onClose={() => setShowJoinModal(false)}
                                />
                            </>
                        ) : (
                            <Outlet key={facilityId ?? 'all'} />
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}

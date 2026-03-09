import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from '@tanstack/react-router';
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
import type { GlobalSearchResultItem, GlobalSearchResults } from '../../types/pharmacy';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../context/ThemeContext';
import { NotificationBell } from '../ui/NotificationBell';
import { FacilityEmptyState } from '../facility/FacilityEmptyState';
import { CreateFacilityModal } from '../facility/CreateFacilityModal';
import { SetupPharmacyModal } from '../facility/SetupPharmacyModal';
import { JoinOrganizationModal } from '../facility/JoinOrganizationModal';
import { pharmacyService } from '../../services/pharmacy.service';

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

interface NavSection {
    id: string;
    label: string;
    items: NavItem[];
}

type GlobalSearchGroupKey =
    | 'medicines'
    | 'batches'
    | 'suppliers'
    | 'purchaseOrders'
    | 'stockMovements';

const EMPTY_GLOBAL_SEARCH_RESULTS: GlobalSearchResults = {
    medicines: [],
    batches: [],
    suppliers: [],
    purchaseOrders: [],
    stockMovements: [],
};

const GLOBAL_SEARCH_GROUPS: Array<{ key: GlobalSearchGroupKey; label: string }> = [
    { key: 'medicines', label: 'Medicines' },
    { key: 'batches', label: 'Batches' },
    { key: 'suppliers', label: 'Suppliers' },
    { key: 'purchaseOrders', label: 'Purchase Orders' },
    { key: 'stockMovements', label: 'Stock Movements' },
];

const NAV_SECTIONS: NavSection[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        items: [
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
        ],
    },
    {
        id: 'inventory',
        label: 'Inventory',
        items: [
            {
                to: '/app/inventory',
                icon: Package,
                label: 'Inventory',
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
                children: [
                    { to: '/app/inventory', icon: Package, label: 'Medicines' },
                    { to: '/app/stock', icon: Database, label: 'Batches' },
                    { to: '/app/analytics/recall', icon: Bell, label: 'Expiry Monitoring' },
                    { to: '/app/analytics/low-stock', icon: Bell, label: 'Low Stock' },
                    { to: '/app/stocktaking', icon: Database, label: 'Stock Adjustments' },
                    { to: '/app/stock-movements', icon: Database, label: 'Stock Movements' },
                ],
            },
        ],
    },
    {
        id: 'procurement',
        label: 'Procurement',
        items: [
            {
                to: '/app/procurement/orders',
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
                children: [
                    { to: '/app/procurement/suppliers', icon: Factory, label: 'Suppliers' },
                    { to: '/app/procurement/orders', icon: ShoppingCart, label: 'Purchase Orders' },
                    { to: '/app/procurement/receiving', icon: Database, label: 'Receiving' },
                ],
            },
        ],
    },
    {
        id: 'sales',
        label: 'Sales / Dispensing',
        items: [
            {
                to: '/app/dispensing',
                icon: Zap,
                label: 'Sales & Dispensing',
                allowedRoles: [
                    'SUPER_ADMIN',
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
                children: [
                    { to: '/app/dispensing', icon: Zap, label: 'Dispensing' },
                    { to: '/app/patients', icon: Users, label: 'Customers' },
                    { to: '/app/insurance', icon: ShieldCheck, label: 'Insurance' },
                ],
            },
        ],
    },
    {
        id: 'reports',
        label: 'Reports',
        items: [
            {
                to: '/app/analytics/operations',
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
                    { to: '/app/analytics/operations', icon: FileText, label: 'Operations' },
                    {
                        to: '/app/analytics/intelligence',
                        icon: FileText,
                        label: 'Inventory Intelligence',
                    },
                    {
                        to: '/app/analytics/compliance',
                        icon: FileText,
                        label: 'Business & Compliance',
                    },
                ],
            },
        ],
    },
    {
        id: 'management',
        label: 'Management',
        items: [
            {
                to: '/app/organizations',
                icon: Building2,
                label: 'Organizations',
                allowedRoles: ['SUPER_ADMIN', 'SUPER ADMIN'],
                allowedPermissions: ['organization:manage'],
            },
            {
                to: '/app/facilities',
                icon: Factory,
                label: 'Branches',
                allowedRoles: ['SUPER_ADMIN', 'SUPER ADMIN', 'OWNER', 'AUDITOR'],
                allowedPermissions: ['facility:read', 'facility:manage'],
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
                to: '/app/settings',
                icon: Settings,
                label: 'Settings',
                allowedRoles: ['SUPER_ADMIN', 'FACILITY_ADMIN', 'FACILITY ADMIN', 'OWNER', 'ADMIN'],
            },
        ],
    },
];

interface SidebarLinkProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    isCollapsed: boolean;
    children?: NavItem[];
    currentPath: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
    to,
    icon,
    label,
    isCollapsed,
    children,
    currentPath,
}) => {
    const hasChildren = children && children.length > 0;
    const shouldBeOpen =
        !!hasChildren &&
        (currentPath === to || currentPath.startsWith(`${to}/`) || children.some((child) => currentPath.startsWith(child.to)));
    const [isOpen, setIsOpen] = useState(shouldBeOpen);

    React.useEffect(() => {
        if (!isCollapsed) {
            setIsOpen(shouldBeOpen);
        }
    }, [isCollapsed, shouldBeOpen]);

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
                            className="block px-3 py-2 text-sm text-slate-500 hover:text-healthcare-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
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
    const [globalSearchQuery, setGlobalSearchQuery] = useState('');
    const [globalSearchLoading, setGlobalSearchLoading] = useState(false);
    const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
    const [globalSearchResults, setGlobalSearchResults] = useState<GlobalSearchResults>(
        EMPTY_GLOBAL_SEARCH_RESULTS,
    );
    const globalSearchRef = useRef<HTMLDivElement | null>(null);

    const location = useLocation();
    const effectiveFacilityId = facilityId ?? user?.facility_id ?? undefined;

    const isItemAllowed = (item: NavItem): boolean => {
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
    };

    const filteredSections = useMemo(() => {
        return NAV_SECTIONS.map((section) => {
            const items = section.items
                .filter(isItemAllowed)
                .map((item) => {
                    const filteredChildren = item.children?.filter((child) => isItemAllowed(child));
                    return {
                        ...item,
                        children: filteredChildren,
                    };
                });
            return {
                ...section,
                items,
            };
        }).filter((section) => section.items.length > 0);
    }, [user?.permissions, user?.role]);

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                globalSearchRef.current &&
                !globalSearchRef.current.contains(event.target as Node)
            ) {
                setGlobalSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const query = globalSearchQuery.trim();
        if (query.length < 2) {
            setGlobalSearchResults(EMPTY_GLOBAL_SEARCH_RESULTS);
            setGlobalSearchLoading(false);
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            setGlobalSearchLoading(true);
            try {
                const [medicinesResponse, suppliersResponse, purchaseOrdersResponse, movementsResponse] =
                    await Promise.all([
                        pharmacyService.getMedicines({
                            search: query,
                            limit: 5,
                            ...(effectiveFacilityId ? { facility_id: effectiveFacilityId } : {}),
                        }),
                        pharmacyService.getSuppliers({
                            search: query,
                            limit: 5,
                        }),
                        pharmacyService.getProcurementOrders({
                            search: query,
                            limit: 5,
                            ...(effectiveFacilityId ? { facility_id: effectiveFacilityId } : {}),
                        }),
                        effectiveFacilityId
                            ? pharmacyService.getStockMovements({
                                  facilityId: effectiveFacilityId,
                                  search: query,
                                  limit: 8,
                                  page: 1,
                              })
                            : Promise.resolve({ data: [] as any[] }),
                    ]);

                if (cancelled) return;

                const movementRows = Array.isArray((movementsResponse as any).data)
                    ? (movementsResponse as any).data
                    : [];
                const lowerQuery = query.toLowerCase();
                const batchMap = new Map<string, GlobalSearchResultItem>(
                    movementRows
                        .filter((row: any) =>
                            String(row.batch_number || row.batch?.batch_number || row.batch_code || '')
                                .toLowerCase()
                                .includes(lowerQuery),
                        )
                        .map((row: any) => {
                            const batchNumber = String(
                                row.batch_number || row.batch?.batch_number || row.batch_code || '',
                            );
                            return [
                                batchNumber,
                                {
                                    id: batchNumber,
                                    label: batchNumber,
                                    meta: String(
                                        row.medicine_name || row.medicine?.name || 'Batch result',
                                    ),
                                    to: '/app/stock',
                                },
                            ] as [string, GlobalSearchResultItem];
                        }),
                );
                const uniqueBatches = Array.from(batchMap.values()).slice(0, 5);

                setGlobalSearchResults({
                    medicines: (medicinesResponse.data || []).slice(0, 5).map((medicine: any) => ({
                        id: String(medicine.id),
                        label: String(medicine.name || 'Unknown medicine'),
                        meta: String(
                            medicine.generic_name ||
                                medicine.code ||
                                medicine.category?.name ||
                                'Medicine',
                        ),
                        to: `/app/inventory/${medicine.id}`,
                    })),
                    batches: uniqueBatches,
                    suppliers: (suppliersResponse.data || []).slice(0, 5).map((supplier: any) => ({
                        id: String(supplier.id),
                        label: String(supplier.name || 'Unknown supplier'),
                        meta: String(supplier.contact_person || supplier.phone || 'Supplier'),
                        to: '/app/procurement/suppliers',
                    })),
                    purchaseOrders: (purchaseOrdersResponse.data || [])
                        .slice(0, 5)
                        .map((order: any) => ({
                            id: String(order.id),
                            label: `PO-${String(order.id).padStart(4, '0')}`,
                            meta: String(
                                order.supplier?.name ||
                                    order.status ||
                                    order.order_number ||
                                    'Purchase order',
                            ),
                            to: `/app/procurement/orders/${order.id}`,
                        })),
                    stockMovements: movementRows.slice(0, 5).map((movement: any) => ({
                        id: String(movement.id),
                        label: String(
                            movement.medicine_name ||
                                movement.medicine?.name ||
                                movement.reference ||
                                'Stock movement',
                        ),
                        meta: String(
                            movement.movement_subtype ||
                                movement.movement_type ||
                                movement.reference ||
                                'Movement',
                        ),
                        to: '/app/stock-movements',
                    })),
                });
                setGlobalSearchOpen(true);
            } catch (error) {
                if (!cancelled) {
                    setGlobalSearchResults(EMPTY_GLOBAL_SEARCH_RESULTS);
                }
            } finally {
                if (!cancelled) setGlobalSearchLoading(false);
            }
        }, 250);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [globalSearchQuery, effectiveFacilityId]);

    const globalSearchResultCount = useMemo(
        () =>
            Object.values(globalSearchResults).reduce(
                (count, items) => count + (Array.isArray(items) ? items.length : 0),
                0,
            ),
        [globalSearchResults],
    );

    const flattenedGlobalSearchResults = useMemo(
        () => GLOBAL_SEARCH_GROUPS.flatMap((group) => globalSearchResults[group.key]),
        [globalSearchResults],
    );

    const handleGlobalSearchSelect = (item: GlobalSearchResultItem) => {
        setGlobalSearchOpen(false);
        setGlobalSearchQuery('');
        navigate({ to: item.to as any, search: {} as any });
    };

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

                    {filteredSections.map((section) => (
                        <div key={section.id} className="space-y-1.5">
                            {(!isCollapsed || isMobileMenuOpen) && (
                                <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {section.label}
                                </p>
                            )}
                            {section.items.map((item) => (
                                <SidebarLink
                                    key={item.to}
                                    to={item.to}
                                    icon={<item.icon size={18} />}
                                    label={item.label}
                                    isCollapsed={isCollapsed && !isMobileMenuOpen}
                                    children={item.children}
                                    currentPath={location.pathname}
                                />
                            ))}
                        </div>
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

                        <div
                            ref={globalSearchRef}
                            className="relative max-w-sm lg:max-w-md w-full hidden sm:block"
                        >
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                            />
                            <input
                                type="text"
                                placeholder="Search medicine, batch, supplier, PO, movement..."
                                value={globalSearchQuery}
                                onFocus={() => setGlobalSearchOpen(true)}
                                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === 'Enter' &&
                                        flattenedGlobalSearchResults.length > 0
                                    ) {
                                        event.preventDefault();
                                        handleGlobalSearchSelect(flattenedGlobalSearchResults[0]);
                                    }
                                    if (event.key === 'Escape') {
                                        setGlobalSearchOpen(false);
                                    }
                                }}
                                className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-900/50 border border-transparent dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-healthcare-primary/10 focus:border-healthcare-primary transition-all text-sm dark:text-white dark:placeholder:text-slate-500"
                            />
                            {globalSearchOpen && globalSearchQuery.trim().length >= 2 && (
                                <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                                    {globalSearchLoading ? (
                                        <div className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                            Searching...
                                        </div>
                                    ) : globalSearchResultCount === 0 ? (
                                        <div className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                            No results found
                                        </div>
                                    ) : (
                                        <div className="max-h-[360px] overflow-y-auto p-2">
                                            {GLOBAL_SEARCH_GROUPS.map((group) => {
                                                const items = globalSearchResults[group.key];
                                                if (!items || items.length === 0) return null;

                                                return (
                                                    <div key={group.key} className="mb-2 last:mb-0">
                                                        <p className="px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            {group.label}
                                                        </p>
                                                        <div className="space-y-1">
                                                            {items.map((item) => (
                                                                <button
                                                                    key={`${group.key}-${item.id}`}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleGlobalSearchSelect(item)
                                                                    }
                                                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                                >
                                                                    <p className="text-xs font-black text-healthcare-dark dark:text-white truncate">
                                                                        {item.label}
                                                                    </p>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                                                                        {item.meta}
                                                                    </p>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
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

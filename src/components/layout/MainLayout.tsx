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
} from 'lucide-react';
import logo from '../../assets/tanga-logo.png';
import { useAuth } from '../../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NavItem {
    to: string;
    icon: React.ComponentType<{ size: number }>;
    label: string;
    allowedRoles?: string[];
}

const NAV_ITEMS: NavItem[] = [
    { to: '/app', icon: BarChart3, label: 'Dashboard' },
    {
        to: '/app/facilities',
        icon: Factory,
        label: 'Facilities',
        allowedRoles: ['SUPER_ADMIN', 'SUPER ADMIN', 'AUDITOR'],
    },
    {
        to: '/app/procurement',
        icon: ShoppingCart,
        label: 'Procurement',
        allowedRoles: [
            'SUPER_ADMIN',
            'FACILITY_ADMIN',
            'FACILITY ADMIN',
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
            'STORE_MANAGER',
            'STORE MANAGER',
            'PHARMACIST',
            'AUDITOR',
            'ADMIN',
            'DOCTOR',
        ], // All except Patient
    },
    {
        to: '/app/stock',
        icon: Database,
        label: 'Stock & Batches',
        allowedRoles: [
            'SUPER_ADMIN',
            'FACILITY_ADMIN',
            'FACILITY ADMIN',
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
            'PHARMACIST',
            'STORE_MANAGER',
            'STORE MANAGER',
            'AUDITOR',
            'ADMIN',
        ],
    },
    {
        to: '/app/audit-logs',
        icon: TrendingUp,
        label: 'Audit Logs',
        allowedRoles: ['SUPER_ADMIN', 'FACILITY_ADMIN', 'FACILITY ADMIN', 'AUDITOR', 'ADMIN'],
    },
    {
        to: '/app/settings',
        icon: Settings,
        label: 'Settings',
        allowedRoles: ['SUPER_ADMIN', 'FACILITY_ADMIN', 'FACILITY ADMIN', 'ADMIN'],
    },
];

export const MainLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const role = user?.role?.toUpperCase();

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
                    isCollapsed ? 'w-20' : 'w-60',
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
                            const isAllowed =
                                !item.allowedRoles || item.allowedRoles.includes(role || '');
                            if (!isAllowed) return null;

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

                        <div className="relative max-w-sm w-full hidden md:block">
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
                    <Outlet />
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

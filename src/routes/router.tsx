import {
    createRootRoute,
    createRoute,
    createRouter,
    Outlet,
    Navigate,
} from '@tanstack/react-router';
import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { InventoryPage } from '../pages/dashboard/InventoryPage';
import { DispensingPage } from '../pages/dashboard/DispensingPage';

import { BatchStockPage } from '../pages/dashboard/BatchStockPage';
import { AuditLogsPage } from '../pages/dashboard/AuditLogsPage';
import { StockMovementsPage } from '../pages/dashboard/StockMovementsPage';
import { PricingPage } from '../pages/dashboard/PricingPage';
import { ModulePlaceholder } from '../pages/shared/ModulePlaceholder';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { VerifyOtpPage } from '../pages/auth/VerifyOtpPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { SetPasswordPage } from '../pages/auth/SetPasswordPage';
import { z } from 'zod';

const RootComponent = () => {
    return (
        <React.Fragment>
            <Outlet />
        </React.Fragment>
    );
};

const AppLayoutComponent = () => {
    return <MainLayout />;
};

const AuthLayoutComponent = () => {
    return <Outlet />;
};

const rootRoute = createRootRoute({
    component: RootComponent,
    notFoundComponent: () => (
        <div className="h-screen w-full flex items-center justify-center bg-healthcare-surface p-10">
            <div className="glass-card p-10 max-w-md w-full text-center space-y-4 rounded-2xl border-2">
                <h2 className="text-xl font-black text-healthcare-dark">404 - Not Found</h2>
                <p className="text-slate-500 text-sm">
                    The page you are looking for does not exist.
                </p>
                <button
                    onClick={() => (window.location.href = '/')}
                    className="px-6 py-2 bg-healthcare-primary text-white rounded-lg text-xs font-black hover:bg-teal-700 transition-all shadow-md"
                >
                    Go Dashboard
                </button>
            </div>
        </div>
    ),
});

const appLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/app',
    component: AppLayoutComponent,
});

const rootIndexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <Navigate to="/app" />,
});

const authLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth',
    component: AuthLayoutComponent,
});

import { AlertsPage } from '../pages/dashboard/AlertsPage';
import { ReportsPage } from '../pages/dashboard/ReportsPage';
import { StockRegisterReportPage } from '../pages/dashboard/StockRegisterReportPage';
import { ProcurementPage } from '../pages/procurement/ProcurementPage';
import { ProcurementLayout } from '../pages/procurement/ProcurementLayout';
import { FacilitiesPage } from '../pages/facilities/FacilitiesPage';
import { OrganizationsPage } from '../pages/organizations/OrganizationsPage';
import { FacilitySettingsPage } from '../pages/dashboard/FacilitySettingsPage';
import { UsersPage } from '../pages/dashboard/UsersPage';
import { ViewOrderPage } from '../pages/procurement/ViewOrderPage';

const indexRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: '/',
    component: DashboardPage,
});
const inventoryRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'inventory',
    component: InventoryPage,
});
const dispensingRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'dispensing',
    component: DispensingPage,
});
const organizationsRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'organizations',
    component: OrganizationsPage,
});

const facilitiesRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'facilities',
    component: FacilitiesPage,
});
const usersRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'users',
    component: UsersPage,
});
const procurementRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'procurement',
    component: ProcurementLayout,
});
const procurementIndexRoute = createRoute({
    getParentRoute: () => procurementRoute,
    path: '/',
    component: ProcurementPage,
});
const ordersRoute = createRoute({
    getParentRoute: () => procurementRoute,
    path: 'orders',
    component: ProcurementPage,
});
const suppliersRoute = createRoute({
    getParentRoute: () => procurementRoute,
    path: 'suppliers',
    component: ProcurementPage,
});
const viewOrderRoute = createRoute({
    getParentRoute: () => procurementRoute,
    path: 'orders/$orderId',
    component: ViewOrderPage,
});
const stockRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'stock',
    component: BatchStockPage,
});
const auditLogsRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'audit-logs',
    component: AuditLogsPage,
    validateSearch: (search: Record<string, unknown>) => {
        return z
            .object({
                search: z.string().optional(),
            })
            .parse(search);
    },
});
const stockMovementsRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'stock-movements',
    component: StockMovementsPage,
});
const pricingRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'pricing',
    component: PricingPage,
});
const stockRegisterRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'stock-register',
    component: StockRegisterReportPage,
});

const alertsRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'alerts',
    component: AlertsPage,
});

const prescriptionsRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'prescriptions',
    component: () => (
        <ModulePlaceholder
            title="Prescriptions"
            description="View and process electronic prescriptions from doctors."
        />
    ),
});
const patientsRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'patients',
    component: () => (
        <ModulePlaceholder
            title="Customer Records"
            description="Lookup customer history and profiles."
        />
    ),
});
const analyticsRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'analytics',
    component: ReportsPage,
});
const employeeRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'employees',
    component: () => (
        <ModulePlaceholder
            title="Employee Directory"
            description="Manage pharmacy staff and permissions."
        />
    ),
});
const settingsRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'settings',
    component: () => (
        <ModulePlaceholder
            title="General Settings"
            description="Configure system-wide pharmacy preferences."
        />
    ),
});

const loginRoute = createRoute({
    getParentRoute: () => authLayoutRoute,
    path: 'login',
    component: LoginPage,
    validateSearch: (search: Record<string, unknown>) => {
        return z
            .object({
                redirect: z.string().optional(),
            })
            .parse(search);
    },
});

const registerRoute = createRoute({
    getParentRoute: () => authLayoutRoute,
    path: 'register',
    component: RegisterPage,
});

const forgotPasswordRoute = createRoute({
    getParentRoute: () => authLayoutRoute,
    path: 'forgot-password',
    component: ForgotPasswordPage,
});

const verifyOtpRoute = createRoute({
    getParentRoute: () => authLayoutRoute,
    path: 'verify-otp',
    component: VerifyOtpPage,
    validateSearch: (search: Record<string, unknown>) => {
        return z
            .object({
                email: z.string().optional(),
            })
            .parse(search);
    },
});

const resetPasswordRoute = createRoute({
    getParentRoute: () => authLayoutRoute,
    path: 'reset-password',
    component: ResetPasswordPage,
    validateSearch: (search: Record<string, unknown>) => {
        return z
            .object({
                email: z.string().optional(),
                otp: z.string().optional(),
            })
            .parse(search);
    },
});

const setPasswordRoute = createRoute({
    getParentRoute: () => authLayoutRoute,
    path: 'set-password',
    component: SetPasswordPage,
});

const facilitySettingsRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'facility/$facilityId/settings',
    component: FacilitySettingsPage,
});

const appRouteTree = appLayoutRoute.addChildren([
    indexRoute,
    inventoryRoute,
    dispensingRoute,
    organizationsRoute,
    facilitiesRoute,
    usersRoute,
    facilitySettingsRoute,
    procurementRoute.addChildren([
        procurementIndexRoute,
        ordersRoute,
        suppliersRoute,
        viewOrderRoute,
    ]),
    stockRoute,
    auditLogsRoute,
    stockMovementsRoute,
    pricingRoute,
    stockRegisterRoute,
    prescriptionsRoute,
    patientsRoute,
    analyticsRoute,
    employeeRoute,
    settingsRoute,
    alertsRoute,
]);

const authRouteTree = authLayoutRoute.addChildren([
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
    verifyOtpRoute,
    resetPasswordRoute,
    setPasswordRoute,
]);

const routeTree = rootRoute.addChildren([rootIndexRoute, appRouteTree, authRouteTree]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

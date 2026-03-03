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
import { GlobalLoading } from '../components/ui/GlobalLoading';
import { AuthLayout } from '../components/layout/AuthLayout';
import { LandingPage } from '../pages/marketing/LandingPage';
import { PublicPurchaseOrder } from '../pages/public/PublicPurchaseOrder';
import { ModulePlaceholder } from '../pages/shared/ModulePlaceholder';
import { OnboardingPage } from '../pages/auth/OnboardingPage';
import { AlertsPage } from '../pages/dashboard/AlertsPage';
import { z } from 'zod';
import { RequirePermission } from '../components/auth/RequirePermission';
import { PERMISSIONS } from '../types/auth';

// Modular Route Creators
import { createInventoryRoutes } from './modules/inventory.routes';
import { createAuthRoutes } from './modules/auth.routes';
import { createSalesRoutes } from './modules/sales.routes';
import { createProcurementRoutes } from './modules/procurement.routes';
import { createAdminRoutes } from './modules/admin.routes';
import { createAnalyticsRoutes } from './modules/analytics.routes';

const RootComponent = () => (
    <React.Fragment>
        <Outlet />
    </React.Fragment>
);

const rootRoute = createRootRoute({
    component: RootComponent,
    notFoundComponent: () => (
        <div className="h-screen w-full flex items-center justify-center bg-healthcare-surface p-10">
            <div className="glass-card p-10 max-w-md w-full text-center space-y-4 rounded-2xl border-2">
                <h2 className="text-xl font-black text-healthcare-dark">404 - Not Found</h2>
                <p className="text-slate-500 text-sm">The page you are looking for does not exist.</p>
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

const rootIndexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: LandingPage,
});

const loginFallbackRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: () => <Navigate to={"/auth/login" as any} search={{} as any} />,
});

// App Layout
const appLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/app',
    component: () => <MainLayout />,
});

const indexRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: '/',
    component: DashboardPage,
});

const alertsRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'alerts',
    component: () => (
        <RequirePermission permission={PERMISSIONS.ALERTS_READ}>
            <AlertsPage />
        </RequirePermission>
    ),
    validateSearch: (search: Record<string, unknown>) => {
        return z.object({
            search: z.string().optional(),
            type: z.enum(['all', 'low_stock', 'expiry']).optional(),
            status: z.enum(['active', 'resolved']).optional(),
        }).parse(search);
    },
});

const employeeRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'employees',
    component: () => <ModulePlaceholder title="Employee Directory" description="Manage pharmacy staff and permissions." />,
});

const settingsRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'settings',
    component: () => <ModulePlaceholder title="General Settings" description="Configure system-wide pharmacy preferences." />,
});

const onboardingRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: 'onboarding',
    component: OnboardingPage,
});

// Compose App Route Tree
const appRouteTree = appLayoutRoute.addChildren([
    indexRoute,
    alertsRoute,
    employeeRoute,
    settingsRoute,
    onboardingRoute,
    ...createInventoryRoutes(appLayoutRoute),
    ...createSalesRoutes(appLayoutRoute),
    ...createProcurementRoutes(appLayoutRoute),
    ...createAdminRoutes(appLayoutRoute),
    ...createAnalyticsRoutes(appLayoutRoute),
]);

// Auth Layout
const authLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth',
    component: () => <AuthLayout />,
});

const authRouteTree = authLayoutRoute.addChildren(createAuthRoutes(authLayoutRoute, rootRoute));

// Public Routes
const publicRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/public',
    component: () => <Outlet />,
});

const publicPORoute = createRoute({
    getParentRoute: () => publicRoute,
    path: 'po/$token',
    component: PublicPurchaseOrder,
});

const publicRouteTree = publicRoute.addChildren([publicPORoute]);

// Final Route Tree
const routeTree = rootRoute.addChildren([
    rootIndexRoute,
    loginFallbackRoute,
    appRouteTree,
    authRouteTree,
    publicRouteTree,
]);

export const router = createRouter({
    routeTree,
    defaultPendingComponent: GlobalLoading,
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

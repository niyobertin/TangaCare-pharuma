import { createRoute, Outlet, Navigate } from '@tanstack/react-router';
import { RequirePermission } from '../../components/auth/RequirePermission';
import { PERMISSIONS } from '../../types/auth';
import { ReportsPage } from '../../pages/dashboard/ReportsPage';
// import React from 'react';

export const createAnalyticsRoutes = (parentRoute: any) => {
    const analyticsRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'analytics',
        component: () => (
            <RequirePermission permission={PERMISSIONS.REPORTS_READ}>
                <Outlet />
            </RequirePermission>
        ),
    });

    const analyticsIndexRoute = createRoute({
        getParentRoute: () => analyticsRoute,
        path: '/',
        component: () => {
            const Nav = Navigate as any;
            return <Nav to="/app/analytics/sales" search={{}} />;
        },
    });

    const analyticsSalesRoute = createRoute({
        getParentRoute: () => analyticsRoute,
        path: 'sales',
        component: () => <ReportsPage defaultTab="sales" />,
    });

    const analyticsReturnsRoute = createRoute({
        getParentRoute: () => analyticsRoute,
        path: 'returns',
        component: () => <ReportsPage defaultTab="returns" />,
    });

    const analyticsInventoryRoute = createRoute({
        getParentRoute: () => analyticsRoute,
        path: 'inventory',
        component: () => <ReportsPage defaultTab="stock" />,
    });

    const analyticsPerformanceRoute = createRoute({
        getParentRoute: () => analyticsRoute,
        path: 'performance',
        component: () => <ReportsPage defaultTab="performance" />,
    });

    const analyticsProcurementRoute = createRoute({
        getParentRoute: () => analyticsRoute,
        path: 'procurement',
        component: () => <ReportsPage defaultTab="procurement" />,
    });

    const analyticsLoyaltyRoute = createRoute({
        getParentRoute: () => analyticsRoute,
        path: 'loyalty',
        component: () => <ReportsPage defaultTab="loyalty" />,
    });

    const analyticsTaxRoute = createRoute({
        getParentRoute: () => analyticsRoute,
        path: 'tax',
        component: () => <ReportsPage defaultTab="tax" />,
    });

    const analyticsRecallRoute = createRoute({
        getParentRoute: () => analyticsRoute,
        path: 'recall',
        component: () => <ReportsPage defaultTab="recall" />,
    });

    const analyticsProfitRoute = createRoute({
        getParentRoute: () => analyticsRoute,
        path: 'profit',
        component: () => {
            const Nav = Navigate as any;
            return <Nav to="/app/analytics/sales" search={{}} />;
        },
    });

    const analyticsLowStockRoute = createRoute({
        getParentRoute: () => analyticsRoute,
        path: 'low-stock',
        component: () => <ReportsPage defaultTab="low-stock" />,
    });

    const analyticsMovementRoute = createRoute({
        getParentRoute: () => analyticsRoute,
        path: 'movement',
        component: () => <ReportsPage defaultTab="movement" />,
    });

    return [
        analyticsRoute.addChildren([
            analyticsIndexRoute,
            analyticsSalesRoute,
            analyticsReturnsRoute,
            analyticsInventoryRoute,
            analyticsPerformanceRoute,
            analyticsProcurementRoute,
            analyticsLoyaltyRoute,
            analyticsTaxRoute,
            analyticsRecallRoute,
            analyticsProfitRoute,
            analyticsLowStockRoute,
            analyticsMovementRoute,
        ]),
    ];
};

import { createRoute } from '@tanstack/react-router';
import { RequirePermission } from '../../components/auth/RequirePermission';
import { PERMISSIONS } from '../../types/auth';
import { InventoryPage } from '../../pages/dashboard/InventoryPage';
import { BatchStockPage } from '../../pages/dashboard/BatchStockPage';
import { StockMovementsPage } from '../../pages/dashboard/StockMovementsPage';
import { PhysicalCountPage } from '../../pages/dashboard/PhysicalCountPage';
import { VarianceTrackingPage } from '../../pages/dashboard/VarianceTrackingPage';
import { BatchRecallPage } from '../../pages/dashboard/BatchRecallPage';
import { ReorderDashboardPage } from '../../pages/dashboard/ReorderDashboardPage';
import { StockRegisterReportPage } from '../../pages/dashboard/StockRegisterReportPage';
// import React from 'react';

// This will be attached to the appLayoutRoute in the main router
export const createInventoryRoutes = (parentRoute: any) => {
    const inventoryRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'inventory',
        component: () => (
            <RequirePermission permission={PERMISSIONS.INVENTORY_READ}>
                <InventoryPage />
            </RequirePermission>
        ),
    });

    const stockRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'stock',
        component: () => (
            <RequirePermission permission={PERMISSIONS.INVENTORY_READ}>
                <BatchStockPage />
            </RequirePermission>
        ),
    });

    const stockMovementsRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'stock-movements',
        component: () => (
            <RequirePermission permission={PERMISSIONS.STOCK_MOVEMENTS_READ}>
                <StockMovementsPage />
            </RequirePermission>
        ),
    });

    const stocktakingRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'stocktaking',
        component: () => (
            <RequirePermission permission={PERMISSIONS.INVENTORY_WRITE}>
                <PhysicalCountPage />
            </RequirePermission>
        ),
    });

    const variancesRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'variances',
        component: () => (
            <RequirePermission permission={PERMISSIONS.INVENTORY_READ}>
                <VarianceTrackingPage />
            </RequirePermission>
        ),
    });

    const recallsRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'recalls',
        component: () => (
            <RequirePermission permission={PERMISSIONS.INVENTORY_READ}>
                <BatchRecallPage />
            </RequirePermission>
        ),
    });

    const reorderRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'reorder-dashboard',
        component: () => (
            <RequirePermission permission={PERMISSIONS.PROCUREMENT_READ}>
                <ReorderDashboardPage />
            </RequirePermission>
        ),
    });

    const stockRegisterRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'stock-register',
        component: () => (
            <RequirePermission permission={PERMISSIONS.REPORTS_READ}>
                <StockRegisterReportPage />
            </RequirePermission>
        ),
    });

    return [
        inventoryRoute,
        stockRoute,
        stockMovementsRoute,
        stocktakingRoute,
        variancesRoute,
        recallsRoute,
        reorderRoute,
        stockRegisterRoute,
    ];
};

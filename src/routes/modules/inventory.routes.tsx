import { createRoute, Navigate } from '@tanstack/react-router';
import { RequirePermission } from '../../components/auth/RequirePermission';
import { PERMISSIONS } from '../../types/auth';
import { lazyNamed, withRouteSuspense } from '../lazy';
// import React from 'react';

const InventoryPage = lazyNamed(
    () => import('../../pages/dashboard/InventoryPage'),
    'InventoryPage',
);
const MedicineDetailsPage = lazyNamed(
    () => import('../../pages/dashboard/MedicineDetailsPage'),
    'MedicineDetailsPage',
);
const BatchStockPage = lazyNamed(
    () => import('../../pages/dashboard/BatchStockPage'),
    'BatchStockPage',
);
const StockMovementsPage = lazyNamed(
    () => import('../../pages/dashboard/StockMovementsPage'),
    'StockMovementsPage',
);
const PhysicalCountPage = lazyNamed(
    () => import('../../pages/dashboard/PhysicalCountPage'),
    'PhysicalCountPage',
);
const VarianceTrackingPage = lazyNamed(
    () => import('../../pages/dashboard/VarianceTrackingPage'),
    'VarianceTrackingPage',
);
const BatchRecallPage = lazyNamed(
    () => import('../../pages/dashboard/BatchRecallPage'),
    'BatchRecallPage',
);
const ReorderDashboardPage = lazyNamed(
    () => import('../../pages/dashboard/ReorderDashboardPage'),
    'ReorderDashboardPage',
);

// This will be attached to the appLayoutRoute in the main router
export const createInventoryRoutes = (parentRoute: any) => {
    const inventoryRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'inventory',
        component: () =>
            withRouteSuspense(
                <RequirePermission permission={PERMISSIONS.INVENTORY_READ}>
                    <InventoryPage />
                </RequirePermission>,
            ),
    });

    const stockRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'stock',
        component: () =>
            withRouteSuspense(
                <RequirePermission permission={PERMISSIONS.INVENTORY_READ}>
                    <BatchStockPage />
                </RequirePermission>,
            ),
    });

    const medicineDetailsRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'inventory/$medicineId',
        component: () =>
            withRouteSuspense(
                <RequirePermission permission={PERMISSIONS.INVENTORY_READ}>
                    <MedicineDetailsPage />
                </RequirePermission>,
            ),
    });

    const stockMovementsRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'stock-movements',
        component: () =>
            withRouteSuspense(
                <RequirePermission permission={PERMISSIONS.STOCK_MOVEMENTS_READ}>
                    <StockMovementsPage />
                </RequirePermission>,
            ),
    });

    const stocktakingRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'stocktaking',
        component: () =>
            withRouteSuspense(
                <RequirePermission permission={PERMISSIONS.INVENTORY_WRITE}>
                    <PhysicalCountPage />
                </RequirePermission>,
            ),
    });

    const variancesRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'variances',
        component: () =>
            withRouteSuspense(
                <RequirePermission permission={PERMISSIONS.INVENTORY_READ}>
                    <VarianceTrackingPage />
                </RequirePermission>,
            ),
    });

    const recallsRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'recalls',
        component: () =>
            withRouteSuspense(
                <RequirePermission permission={PERMISSIONS.INVENTORY_READ}>
                    <BatchRecallPage />
                </RequirePermission>,
            ),
    });

    const reorderRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'reorder-dashboard',
        component: () =>
            withRouteSuspense(
                <RequirePermission permission={PERMISSIONS.PROCUREMENT_READ}>
                    <ReorderDashboardPage />
                </RequirePermission>,
            ),
    });

    const stockRegisterRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'stock-register',
        component: () => <Navigate to={'/app/stock-movements' as any} search={{} as any} />,
    });

    return [
        inventoryRoute,
        medicineDetailsRoute,
        stockRoute,
        stockMovementsRoute,
        stocktakingRoute,
        variancesRoute,
        recallsRoute,
        reorderRoute,
        stockRegisterRoute,
    ];
};

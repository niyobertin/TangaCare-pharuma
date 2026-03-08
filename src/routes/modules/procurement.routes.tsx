import { createRoute } from '@tanstack/react-router';
import { RequirePermission } from '../../components/auth/RequirePermission';
import { PERMISSIONS } from '../../types/auth';
import { lazyNamed, withRouteSuspense } from '../lazy';
// import { ReorderDashboardPage } from '../../pages/dashboard/ReorderDashboardPage';
// import React from 'react';

const ProcurementLayout = lazyNamed(() => import('../../pages/procurement/ProcurementLayout'), 'ProcurementLayout');
const ProcurementPage = lazyNamed(() => import('../../pages/procurement/ProcurementPage'), 'ProcurementPage');
const ViewOrderPage = lazyNamed(() => import('../../pages/procurement/ViewOrderPage'), 'ViewOrderPage');

export const createProcurementRoutes = (parentRoute: any) => {
    const procurementRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'procurement',
        component: () => (
            withRouteSuspense(
                <RequirePermission permission={PERMISSIONS.PROCUREMENT_READ}>
                    <ProcurementLayout />
                </RequirePermission>,
            )
        ),
    });

    const procurementIndexRoute = createRoute({
        getParentRoute: () => procurementRoute,
        path: '/',
        component: () => withRouteSuspense(<ProcurementPage />),
    });

    const ordersRoute = createRoute({
        getParentRoute: () => procurementRoute,
        path: 'orders',
        component: () => withRouteSuspense(<ProcurementPage />),
    });

    const suppliersRoute = createRoute({
        getParentRoute: () => procurementRoute,
        path: 'suppliers',
        component: () => withRouteSuspense(<ProcurementPage />),
    });

    const viewOrderRoute = createRoute({
        getParentRoute: () => procurementRoute,
        path: 'orders/$orderId',
        component: () => withRouteSuspense(<ViewOrderPage />),
    });

    return [
        procurementRoute.addChildren([
            procurementIndexRoute,
            ordersRoute,
            suppliersRoute,
            viewOrderRoute,
        ]),
    ];
};

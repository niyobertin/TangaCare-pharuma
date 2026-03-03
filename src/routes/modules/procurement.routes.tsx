import { createRoute } from '@tanstack/react-router';
import { RequirePermission } from '../../components/auth/RequirePermission';
import { PERMISSIONS } from '../../types/auth';
import { ProcurementLayout } from '../../pages/procurement/ProcurementLayout';
import { ProcurementPage } from '../../pages/procurement/ProcurementPage';
import { ViewOrderPage } from '../../pages/procurement/ViewOrderPage';
// import { ReorderDashboardPage } from '../../pages/dashboard/ReorderDashboardPage';
// import React from 'react';

export const createProcurementRoutes = (parentRoute: any) => {
    const procurementRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'procurement',
        component: () => (
            <RequirePermission permission={PERMISSIONS.PROCUREMENT_READ}>
                <ProcurementLayout />
            </RequirePermission>
        ),
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

    return [
        procurementRoute.addChildren([
            procurementIndexRoute,
            ordersRoute,
            suppliersRoute,
            viewOrderRoute,
        ]),
    ];
};

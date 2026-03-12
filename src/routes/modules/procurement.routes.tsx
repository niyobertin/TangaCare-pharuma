import { createRoute, Navigate } from '@tanstack/react-router';
import { RequirePermission } from '../../components/auth/RequirePermission';
import { PERMISSIONS } from '../../types/auth';
import { lazyNamed, withRouteSuspense } from '../lazy';
// import { ReorderDashboardPage } from '../../pages/dashboard/ReorderDashboardPage';
// import React from 'react';

const ProcurementLayout = lazyNamed(
    () => import('../../pages/procurement/ProcurementLayout'),
    'ProcurementLayout',
);
const ProcurementPage = lazyNamed(
    () => import('../../pages/procurement/ProcurementPage'),
    'ProcurementPage',
);
const GoodsReceiptsPage = lazyNamed(
    () => import('../../pages/procurement/GoodsReceiptsPage'),
    'GoodsReceiptsPage',
);
const ViewOrderPage = lazyNamed(
    () => import('../../pages/procurement/ViewOrderPage'),
    'ViewOrderPage',
);
const ViewGoodsReceiptPage = lazyNamed(
    () => import('../../pages/procurement/ViewGoodsReceiptPage'),
    'ViewGoodsReceiptPage',
);

export const createProcurementRoutes = (parentRoute: any) => {
    const procurementRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'procurement',
        component: () =>
            withRouteSuspense(
                <RequirePermission permission={PERMISSIONS.PROCUREMENT_READ}>
                    <ProcurementLayout />
                </RequirePermission>,
            ),
    });

    const procurementIndexRoute = createRoute({
        getParentRoute: () => procurementRoute,
        path: '/',
        component: () => <Navigate to={'/app/procurement/orders' as any} search={{} as any} />,
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

    const receivingRoute = createRoute({
        getParentRoute: () => procurementRoute,
        path: 'receiving',
        component: () => withRouteSuspense(<ProcurementPage />),
    });

    const receiptsRoute = createRoute({
        getParentRoute: () => procurementRoute,
        path: 'receipts',
        component: () => withRouteSuspense(<GoodsReceiptsPage />),
    });

    const viewOrderRoute = createRoute({
        getParentRoute: () => procurementRoute,
        path: 'orders/$orderId',
        component: () => withRouteSuspense(<ViewOrderPage />),
    });

    const viewGoodsReceiptRoute = createRoute({
        getParentRoute: () => procurementRoute,
        path: 'receipts/$receiptId',
        component: () => withRouteSuspense(<ViewGoodsReceiptPage />),
    });

    return [
        procurementRoute.addChildren([
            procurementIndexRoute,
            ordersRoute,
            suppliersRoute,
            receivingRoute,
            receiptsRoute,
            viewOrderRoute,
            viewGoodsReceiptRoute,
        ]),
    ];
};

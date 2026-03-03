import { createRoute } from '@tanstack/react-router';
import { RequirePermission } from '../../components/auth/RequirePermission';
import { PERMISSIONS } from '../../types/auth';
import { DispensingPage } from '../../pages/dashboard/DispensingPage';
import { InsurancePage } from '../../pages/dashboard/InsurancePage';
import { ModulePlaceholder } from '../../pages/shared/ModulePlaceholder';
// import React from 'react';

export const createSalesRoutes = (parentRoute: any) => {
    const dispensingRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'dispensing',
        component: () => (
            <RequirePermission permission={PERMISSIONS.DISPENSING_READ}>
                <DispensingPage />
            </RequirePermission>
        ),
    });

    const insuranceRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'insurance',
        component: () => (
            <RequirePermission permission={PERMISSIONS.DISPENSING_READ}>
                <InsurancePage />
            </RequirePermission>
        ),
    });

    const prescriptionsRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'prescriptions',
        component: () => (
            <ModulePlaceholder
                title="Prescriptions"
                description="View and process electronic prescriptions from doctors."
            />
        ),
    });

    return [
        dispensingRoute,
        insuranceRoute,
        prescriptionsRoute,
    ];
};

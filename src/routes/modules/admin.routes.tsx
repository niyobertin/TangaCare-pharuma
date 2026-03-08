import { createRoute } from '@tanstack/react-router';
import { RequirePermission } from '../../components/auth/RequirePermission';
import { PERMISSIONS } from '../../types/auth';
import { lazyNamed, withRouteSuspense } from '../lazy';
import { z } from 'zod';
// import React from 'react';

const OrganizationsPage = lazyNamed(
    () => import('../../pages/organizations/OrganizationsPage'),
    'OrganizationsPage',
);
const FacilitiesPage = lazyNamed(() => import('../../pages/facilities/FacilitiesPage'), 'FacilitiesPage');
const UsersPage = lazyNamed(() => import('../../pages/dashboard/UsersPage'), 'UsersPage');
const AuditLogsPage = lazyNamed(() => import('../../pages/dashboard/AuditLogsPage'), 'AuditLogsPage');
const FacilitySettingsPage = lazyNamed(
    () => import('../../pages/dashboard/FacilitySettingsPage'),
    'FacilitySettingsPage',
);
const PatientsPage = lazyNamed(() => import('../../pages/dashboard/PatientsPage'), 'PatientsPage');

export const createAdminRoutes = (parentRoute: any) => {
    const organizationsRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'organizations',
        component: () => (
            withRouteSuspense(
                <RequirePermission permission={PERMISSIONS.ORGANIZATION_MANAGE}>
                    <OrganizationsPage />
                </RequirePermission>,
            )
        ),
    });

    const facilitiesRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'facilities',
        component: () => (
            withRouteSuspense(
                <RequirePermission permissions={[PERMISSIONS.FACILITY_READ, PERMISSIONS.FACILITY_MANAGE]}>
                    <FacilitiesPage />
                </RequirePermission>,
            )
        ),
    });

    const usersRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'users',
        component: () => (
            withRouteSuspense(
                <RequirePermission permissions={[PERMISSIONS.USERS_READ, PERMISSIONS.USERS_MANAGE]}>
                    <UsersPage />
                </RequirePermission>,
            )
        ),
    });

    const auditLogsRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'audit-logs',
        component: () => (
            withRouteSuspense(
                <RequirePermission permission={PERMISSIONS.AUDIT_READ}>
                    <AuditLogsPage />
                </RequirePermission>,
            )
        ),
        validateSearch: (search: Record<string, unknown>) => {
            return z
                .object({
                    search: z.string().optional(),
                })
                .parse(search);
        },
    });

    const facilitySettingsRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'facility/$facilityId/settings',
        component: () => (
            withRouteSuspense(
                <RequirePermission permission={PERMISSIONS.FACILITY_MANAGE}>
                    <FacilitySettingsPage />
                </RequirePermission>,
            )
        ),
    });

    const patientsRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'patients',
        component: () => (
            withRouteSuspense(
                <RequirePermission permissions={[PERMISSIONS.USERS_READ, PERMISSIONS.USERS_MANAGE]}>
                    <PatientsPage />
                </RequirePermission>,
            )
        ),
    });

    return [
        organizationsRoute,
        facilitiesRoute,
        usersRoute,
        auditLogsRoute,
        facilitySettingsRoute,
        patientsRoute,
    ];
};

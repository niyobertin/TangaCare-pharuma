import { createRoute } from '@tanstack/react-router';
import { RequirePermission } from '../../components/auth/RequirePermission';
import { PERMISSIONS } from '../../types/auth';
import { OrganizationsPage } from '../../pages/organizations/OrganizationsPage';
import { FacilitiesPage } from '../../pages/facilities/FacilitiesPage';
import { UsersPage } from '../../pages/dashboard/UsersPage';
import { AuditLogsPage } from '../../pages/dashboard/AuditLogsPage';
import { FacilitySettingsPage } from '../../pages/dashboard/FacilitySettingsPage';
import { PatientsPage } from '../../pages/dashboard/PatientsPage';
import { z } from 'zod';
// import React from 'react';

export const createAdminRoutes = (parentRoute: any) => {
    const organizationsRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'organizations',
        component: () => (
            <RequirePermission permission={PERMISSIONS.ORGANIZATION_MANAGE}>
                <OrganizationsPage />
            </RequirePermission>
        ),
    });

    const facilitiesRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'facilities',
        component: () => (
            <RequirePermission permissions={[PERMISSIONS.FACILITY_READ, PERMISSIONS.FACILITY_MANAGE]}>
                <FacilitiesPage />
            </RequirePermission>
        ),
    });

    const usersRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'users',
        component: () => (
            <RequirePermission permissions={[PERMISSIONS.USERS_READ, PERMISSIONS.USERS_MANAGE]}>
                <UsersPage />
            </RequirePermission>
        ),
    });

    const auditLogsRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'audit-logs',
        component: () => (
            <RequirePermission permission={PERMISSIONS.AUDIT_READ}>
                <AuditLogsPage />
            </RequirePermission>
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
            <RequirePermission permission={PERMISSIONS.FACILITY_MANAGE}>
                <FacilitySettingsPage />
            </RequirePermission>
        ),
    });

    const patientsRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'patients',
        component: () => (
            <RequirePermission permissions={[PERMISSIONS.USERS_READ, PERMISSIONS.USERS_MANAGE]}>
                <PatientsPage />
            </RequirePermission>
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

import { Outlet } from '@tanstack/react-router';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export function ProcurementLayout() {
    return (
        <ProtectedRoute
            allowedRoles={['admin', 'super_admin', 'store_manager', 'facility_admin', 'owner']}
            requireFacility
        >
            <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>
            </div>
        </ProtectedRoute>
    );
}

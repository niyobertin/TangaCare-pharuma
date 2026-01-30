import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, LoginCredentials, RegisterCredentials, Organization } from '../types/auth';
import { authService } from '../services/auth.service';

const ORG_KEY = 'selected_organization_id';
const FACILITY_KEY = 'selected_facility_id';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    organizationId: number | null;
    facilityId: number | null;
    organizations: Organization[];
    facilities: Array<{ id: number; name: string; type?: string }>;
    setOrganization: (id: number | null) => void;
    setFacility: (id: number | null) => void;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    /** Check if current user has a permission (from /me permissions array). */
    can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [organizationId, setOrganizationIdState] = useState<number | null>(() => {
        const v = localStorage.getItem(ORG_KEY);
        return v ? parseInt(v, 10) : null;
    });
    const [facilityId, setFacilityIdState] = useState<number | null>(() => {
        const v = localStorage.getItem(FACILITY_KEY);
        return v ? parseInt(v, 10) : null;
    });
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [facilities, setFacilities] = useState<
        Array<{ id: number; name: string; type?: string }>
    >([]);

    const setOrganization = useCallback((id: number | null) => {
        if (id !== null) localStorage.setItem(ORG_KEY, String(id));
        else localStorage.removeItem(ORG_KEY);
        setOrganizationIdState(id);
    }, []);

    const setFacility = useCallback((id: number | null) => {
        if (id !== null) localStorage.setItem(FACILITY_KEY, String(id));
        else localStorage.removeItem(FACILITY_KEY);
        setFacilityIdState(id);
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user_data');

        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                if (parsed.organizations) setOrganizations(parsed.organizations);
                if (parsed.facilities) setFacilities(parsed.facilities);
            } catch {
                setUser(null);
            }
        }

        if (token) {
            try {
                const profile = await authService.getProfile();
                setUser(profile);
                localStorage.setItem('user_data', JSON.stringify(profile));
                if (profile.organizations) setOrganizations(profile.organizations);
                if (profile.facilities) setFacilities(profile.facilities);
                let oid = localStorage.getItem(ORG_KEY);
                let fid = localStorage.getItem(FACILITY_KEY);
                // Facility admin / owner: default to their single facility and org when not yet selected.
                // OWNER with multiple facilities: do not set default facility (show "All facilities" / aggregated view).
                const isOwner = (profile as any).role?.toUpperCase() === 'OWNER';
                const multiFacilityOwner = isOwner && (profile.facilities?.length ?? 0) > 1;
                const defaultFacility = multiFacilityOwner
                    ? null
                    : ((profile as any).facility ??
                      (profile.facilities?.length === 1 ? profile.facilities[0] : null));
                const defaultOrgId =
                    defaultFacility?.organization_id ?? profile.organizations?.[0]?.id ?? null;
                if (!fid && defaultFacility?.id) {
                    fid = String(defaultFacility.id);
                    localStorage.setItem(FACILITY_KEY, fid);
                }
                if (!oid && defaultOrgId != null) {
                    oid = String(defaultOrgId);
                    localStorage.setItem(ORG_KEY, oid);
                }
                if (oid) setOrganizationIdState(parseInt(oid, 10));
                if (fid) setFacilityIdState(parseInt(fid, 10));
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                await authService.logout();
                localStorage.removeItem('user_data');
                setUser(null);
                setOrganizations([]);
                setFacilities([]);
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            const response = await authService.login(credentials);
            const payload = response?.data ?? response;
            const u = payload?.user ?? payload?.data?.user;
            setUser(u);
            const orgs = payload?.organizations ?? u?.organizations ?? [];
            const facs = payload?.facilities ?? u?.facilities ?? [];
            setOrganizations(Array.isArray(orgs) ? orgs : []);
            setFacilities(Array.isArray(facs) ? facs : []);
            // Facility admin / owner: default to their single facility and org when not yet selected
            const isOwner = (u?.role ?? payload?.user?.role)?.toString().toUpperCase() === 'OWNER';
            const multiFacilityOwner = isOwner && Array.isArray(facs) && facs.length > 1;
            const defaultFacility = multiFacilityOwner
                ? null
                : (payload?.facility ??
                  u?.facility ??
                  (Array.isArray(facs) && facs.length === 1 ? facs[0] : null));
            let oid = localStorage.getItem(ORG_KEY);
            let fid = localStorage.getItem(FACILITY_KEY);
            if (!fid && defaultFacility?.id) {
                fid = String(defaultFacility.id);
                localStorage.setItem(FACILITY_KEY, fid);
            }
            if (!oid && (defaultFacility?.organization_id ?? orgs?.[0]?.id)) {
                oid = String(defaultFacility?.organization_id ?? orgs?.[0]?.id);
                localStorage.setItem(ORG_KEY, oid);
            }
            if (oid) setOrganizationIdState(parseInt(oid, 10));
            if (fid) setFacilityIdState(parseInt(fid, 10));
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
        setIsLoading(false);
    };

    const register = async (credentials: RegisterCredentials) => {
        setIsLoading(true);
        try {
            await authService.register(credentials);
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
        setIsLoading(false);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setOrganizations([]);
        setFacilities([]);
        setOrganizationIdState(null);
        setFacilityIdState(null);
    };

    const refreshProfile = async () => {
        const profile = await authService.getProfile();
        setUser(profile);
        localStorage.setItem('user_data', JSON.stringify(profile));
        if (profile.organizations) setOrganizations(profile.organizations);
        if (profile.facilities) setFacilities(profile.facilities);
        // Keep tenant in sync for facility admin / owner. OWNER with multiple facilities: do not set default.
        const isOwner = (profile as any).role?.toUpperCase() === 'OWNER';
        const multiFacilityOwner = isOwner && (profile.facilities?.length ?? 0) > 1;
        const defaultFacility = multiFacilityOwner
            ? null
            : ((profile as any).facility ??
              (profile.facilities?.length === 1 ? profile.facilities[0] : null));
        if (defaultFacility?.id && !localStorage.getItem(FACILITY_KEY)) {
            localStorage.setItem(FACILITY_KEY, String(defaultFacility.id));
            setFacilityIdState(defaultFacility.id);
        }
        if (
            (defaultFacility?.organization_id ?? profile.organizations?.[0]?.id) != null &&
            !localStorage.getItem(ORG_KEY)
        ) {
            const oid = defaultFacility?.organization_id ?? profile.organizations?.[0]?.id;
            localStorage.setItem(ORG_KEY, String(oid));
            setOrganizationIdState(oid);
        }
    };

    const can = useCallback(
        (permission: string) => {
            const u = user;
            if (!u?.permissions || !Array.isArray(u.permissions)) return false;
            return u.permissions.includes(permission);
        },
        [user],
    );

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                organizationId,
                facilityId,
                organizations,
                facilities,
                setOrganization,
                setFacility,
                login,
                register,
                logout,
                refreshProfile,
                can,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

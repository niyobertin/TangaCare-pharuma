import api from '../lib/api';
import type {
    DashboardStats,
    Transaction,
    Medicine,
    CreateMedicineDto,
    Facility,
    Organization,
    CreateOrganizationDto,
    Batch,
    Stock,
    Supplier,
    ProcurementOrder,
    Alert,
    PaginatedResponse,
    Sale,
    CreateSaleDto,
} from '../types/pharmacy';

// Helper to normalize backend responses that might be wrapped in { success, data, ... } or { data: [], total, ... }
const normalizePaginatedResponse = <T>(body: any): PaginatedResponse<T> => {
    const result: PaginatedResponse<T> = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
    };

    if (!body) return result;

    // 1. Direct match?
    if (Array.isArray(body.data) && body.meta) {
        return body as PaginatedResponse<T>;
    }

    // 2. Wrap in success/data?
    let payload = body.success && body.data ? body.data : body;

    // 3. Extract items
    if (Array.isArray(payload.data)) {
        result.data = payload.data;
    } else if (Array.isArray(payload)) {
        result.data = payload;
    }

    // 4. Extract meta
    result.meta.total = typeof payload.total === 'number' ? payload.total : result.data.length;
    result.meta.page = typeof payload.page === 'number' ? payload.page : 1;
    result.meta.limit = typeof payload.limit === 'number' ? payload.limit : 10;
    result.meta.totalPages =
        typeof payload.totalPages === 'number'
            ? payload.totalPages
            : Math.ceil(result.meta.total / result.meta.limit) || 1;

    return result;
};

export const pharmacyService = {
    // Dashboard
    async getDashboardStats(): Promise<DashboardStats> {
        const response = await api.get<{ data: DashboardStats }>('/pharmacy/stats');
        // backend wraps responses as { success, data, ... }
        return (response.data as any).data ?? (response.data as any);
    },

    async getRecentSales(): Promise<Transaction[]> {
        const response = await api.get<{ data: Transaction[] }>('/pharmacy/transactions');
        return (response.data as any).data ?? (response.data as any);
    },

    // Reports
    async getStockReport(facilityId: number): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/stock/${facilityId}`);
        return (response.data as any).data ?? response.data;
    },

    async getSalesReport(
        facilityId: number,
        params?: { start_date?: string; end_date?: string }
    ): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/sales/${facilityId}`, { params });
        return (response.data as any).data ?? response.data;
    },

    async getProfitReport(
        facilityId: number,
        params?: { start_date?: string; end_date?: string }
    ): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/profit/${facilityId}`, { params });
        return (response.data as any).data ?? response.data;
    },

    async getDeadStockReport(facilityId: number, params?: { days?: number }): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/dead-stock/${facilityId}`, { params });
        return (response.data as any).data ?? response.data;
    },

    async getControlledDrugReport(
        facilityId: number,
        params?: { start_date?: string; end_date?: string }
    ): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/controlled-drugs/${facilityId}`, { params });
        return (response.data as any).data ?? response.data;
    },

    async getExpiryReport(facilityId: number, params?: { days?: number }): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/expiry/${facilityId}`, { params });
        return (response.data as any).data ?? response.data;
    },

    // Sales (POS)
    async createSale(payload: CreateSaleDto): Promise<Sale> {
        const response = await api.post<any>('/pharmacy/sales', payload);
        return (response.data as any).data ?? response.data;
    },

    // Medicines
    async getMedicines(params?: {
        page?: number;
        limit?: number;
        search?: string;
        facility_id?: number;
    }): Promise<PaginatedResponse<Medicine>> {
        const response = await api.get<any>('/pharmacy/medicines', { params });
        return normalizePaginatedResponse<Medicine>(response.data);
    },

    async createMedicine(data: CreateMedicineDto): Promise<Medicine> {
        const response = await api.post<{ data: Medicine }>('/pharmacy/medicines', data);
        return response.data.data;
    },

    // Organizations
    async getOrganizations(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<PaginatedResponse<Organization>> {
        const response = await api.get<any>('/pharmacy/organizations', { params });
        return normalizePaginatedResponse<Organization>(response.data);
    },

    async getOrganization(id: number): Promise<Organization> {
        const response = await api.get<{ data: Organization }>(`/pharmacy/organizations/${id}`);
        return (response.data as any).data ?? response.data;
    },

    async createOrganization(data: CreateOrganizationDto): Promise<Organization> {
        const response = await api.post<any>('/pharmacy/organizations', data);
        return (response.data as any).data ?? response.data;
    },

    async updateOrganization(id: number, data: Partial<Organization>): Promise<Organization> {
        const response = await api.put<any>(`/pharmacy/organizations/${id}`, data);
        return (response.data as any).data ?? response.data;
    },

    async deleteOrganization(id: number): Promise<void> {
        await api.delete(`/pharmacy/organizations/${id}`);
    },

    /** First-time setup: create Organization + first Facility (for users with no org yet). */
    async setupOnboarding(data: {
        organization_name: string;
        organization_code?: string;
        facility_name: string;
        facility_type: 'hospital' | 'clinic' | 'pharmacy_shop';
        address?: string;
        phone?: string;
        email?: string;
    }): Promise<{ organization: Organization; facility: Facility }> {
        const response = await api.post<any>('/pharmacy/onboarding/setup', data);
        return (response.data as any).data ?? response.data;
    },

    // Facilities
    async getFacilities(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<PaginatedResponse<Facility>> {
        const response = await api.get<any>('/pharmacy/facilities', { params });
        return normalizePaginatedResponse<Facility>(response.data);
    },

    async getFacility(id: number): Promise<Facility> {
        const response = await api.get<{ data: Facility }>(`/pharmacy/facilities/${id}`);
        return response.data.data;
    },

    async createFacility(data: import('../types/pharmacy').CreateFacilityDto): Promise<Facility> {
        const response = await api.post<{ data: Facility }>('/pharmacy/facilities', data);
        return response.data.data;
    },

    async updateFacility(id: number, data: Partial<Facility>): Promise<Facility> {
        const response = await api.put<{ data: Facility }>(`/pharmacy/facilities/${id}`, data);
        return response.data.data;
    },

    async deleteFacility(id: number): Promise<void> {
        await api.delete(`/pharmacy/facilities/${id}`);
    },

    // Departments
    async getDepartments(params?: { facility_id: number }): Promise<import('../types/pharmacy').Department[]> {
        const response = await api.get<{ data: import('../types/pharmacy').Department[] }>('/pharmacy/departments', { params });
        return response.data.data;
    },

    async createDepartment(data: Partial<import('../types/pharmacy').Department>): Promise<import('../types/pharmacy').Department> {
        const response = await api.post<{ data: import('../types/pharmacy').Department }>('/pharmacy/departments', data);
        return response.data.data;
    },

    async updateDepartment(id: number, data: Partial<import('../types/pharmacy').Department>): Promise<import('../types/pharmacy').Department> {
        const response = await api.put<{ data: import('../types/pharmacy').Department }>(`/pharmacy/departments/${id}`, data);
        return response.data.data;
    },

    async deleteDepartment(id: number): Promise<void> {
        await api.delete(`/pharmacy/departments/${id}`);
    },

    // Batches
    async getBatches(params?: { medicine_id?: number; facility_id?: number }): Promise<Batch[]> {
        const response = await api.get<{ data: Batch[] }>('/pharmacy/batches', { params });
        return response.data.data;
    },

    // Stock
    async getStock(params?: {
        facility_id?: number;
        page?: number;
        limit?: number;
        low_stock_only?: boolean;
    }): Promise<PaginatedResponse<Stock>> {
        const response = await api.get<any>('/pharmacy/stock', { params });
        return normalizePaginatedResponse<Stock>(response.data);
    },

    // Suppliers
    async getSuppliers(params?: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Supplier>> {
        const response = await api.get<any>('/pharmacy/suppliers', { params });
        return normalizePaginatedResponse<Supplier>(response.data);
    },

    async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
        const response = await api.post<{ data: Supplier }>('/pharmacy/suppliers', data);
        return response.data.data;
    },

    async updateSupplier(id: number, data: Partial<Supplier>): Promise<Supplier> {
        const response = await api.put<{ data: Supplier }>(`/pharmacy/suppliers/${id}`, data);
        return response.data.data;
    },

    // Procurement
    async getProcurementOrders(params?: {
        facility_id?: number;
        status?: string;
    }): Promise<PaginatedResponse<ProcurementOrder>> {
        const response = await api.get<any>('/pharmacy/procurement', { params });
        return normalizePaginatedResponse<ProcurementOrder>(response.data);
    },

    async createProcurementOrder(data: any): Promise<ProcurementOrder> {
        const response = await api.post<{ data: ProcurementOrder }>('/pharmacy/procurement', data);
        return response.data.data;
    },

    async updateProcurementOrder(id: number, data: any): Promise<ProcurementOrder> {
        const response = await api.put<{ data: ProcurementOrder }>(`/pharmacy/procurement/${id}`, data);
        return response.data.data;
    },

    async receiveProcurementOrder(id: number, data: { items: any[] }): Promise<ProcurementOrder> {
        const response = await api.post<{ data: ProcurementOrder }>(`/pharmacy/procurement/${id}/receive`, data);
        return response.data.data;
    },

    // Alerts
    async getAlerts(params?: {
        facility_id?: number;
        status?: string;
    }): Promise<PaginatedResponse<Alert>> {
        const response = await api.get<any>('/pharmacy/alerts', { params });
        return normalizePaginatedResponse<Alert>(response.data);
    },

    // Dispensing
    async dispenseMedicine(data: {
        facility_id: number;
        medicine_id: number;
        batch_id: number;
        quantity: number;
        dispense_type: string;
        patient_id?: number;
        prescription_id?: number;
        unit_price: number;
    }): Promise<any> {
        const response = await api.post('/pharmacy/dispensing', data);
        return response.data;
    },

    async transferStock(data: {
        facility_id: number;
        medicine_id: number;
        batch_id: number;
        source_department_id: number | null; // null = central/main
        target_department_id: number;
        quantity: number;
        notes?: string;
    }): Promise<any> {
        const response = await api.post('/pharmacy/stock/transfer', data);
        return response.data;
    },

    async adjustStock(data: {
        facility_id: number;
        batch_id: number;
        type: 'increase' | 'decrease' | 'damage' | 'expired' | 'return';
        quantity: number;
        reason: string;
    }): Promise<any> {
        const response = await api.post('/pharmacy/stock/adjust', data);
        return response.data;
    },

    // Global Search / Users
    async getPatients(query: string): Promise<import('../types/auth').User[]> {
        const response = await api.get<{ data: import('../types/auth').User[] }>('/users', {
            params: {
                role: 'patient',
                search: query,
                limit: 10
            }
        });
        // Handle both simple array or paginated response
        const data = response.data.data || response.data;
        return Array.isArray(data) ? data : (data as any)?.users || [];
    },
};

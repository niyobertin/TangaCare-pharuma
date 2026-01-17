import api from '../lib/api';
import type {
    DashboardStats,
    Transaction,
    Medicine,
    CreateMedicineDto,
    Facility,
    Batch,
    Stock,
    Supplier,
    ProcurementOrder,
    Alert,
    PaginatedResponse
} from '../types/pharmacy';

// Helper to normalize backend responses that might be wrapped in { success, data, ... } or { data: [], total, ... }
const normalizePaginatedResponse = <T>(body: any): PaginatedResponse<T> => {
    const result: PaginatedResponse<T> = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 }
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
    result.meta.totalPages = typeof payload.totalPages === 'number' ? payload.totalPages : Math.ceil(result.meta.total / result.meta.limit) || 1;

    return result;
};

export const pharmacyService = {
    // Dashboard
    async getDashboardStats(): Promise<DashboardStats> {
        const response = await api.get<{ data: DashboardStats }>('/pharmacy/stats');
        return response.data.data;
    },

    async getRecentSales(): Promise<Transaction[]> {
        const response = await api.get<{ data: Transaction[] }>('/pharmacy/transactions');
        return response.data.data;
    },

    // Medicines
    async getMedicines(params?: { page?: number, limit?: number, search?: string }): Promise<PaginatedResponse<Medicine>> {
        const response = await api.get<any>('/pharmacy/medicines', { params });
        return normalizePaginatedResponse<Medicine>(response.data);
    },

    async createMedicine(data: CreateMedicineDto): Promise<Medicine> {
        const response = await api.post<{ data: Medicine }>('/pharmacy/medicines', data);
        return response.data.data;
    },

    // Facilities
    async getFacilities(params?: { page?: number, limit?: number }): Promise<PaginatedResponse<Facility>> {
        const response = await api.get<any>('/pharmacy/facilities', { params });
        return normalizePaginatedResponse<Facility>(response.data);
    },

    // Batches
    async getBatches(params?: { medicine_id?: number }): Promise<Batch[]> {
        const response = await api.get<{ data: Batch[] }>('/pharmacy/batches', { params });
        return response.data.data;
    },

    // Stock
    async getStock(params?: { facility_id?: number, page?: number, limit?: number, low_stock_only?: boolean }): Promise<PaginatedResponse<Stock>> {
        const response = await api.get<any>('/pharmacy/stock', { params });
        return normalizePaginatedResponse<Stock>(response.data);
    },

    // Suppliers
    async getSuppliers(params?: { page?: number, limit?: number }): Promise<PaginatedResponse<Supplier>> {
        const response = await api.get<any>('/pharmacy/suppliers', { params });
        return normalizePaginatedResponse<Supplier>(response.data);
    },

    // Procurement
    async getProcurementOrders(params?: { facility_id?: number, status?: string }): Promise<PaginatedResponse<ProcurementOrder>> {
        const response = await api.get<any>('/pharmacy/procurement', { params });
        return normalizePaginatedResponse<ProcurementOrder>(response.data);
    },

    // Alerts
    async getAlerts(params?: { facility_id?: number, status?: string }): Promise<PaginatedResponse<Alert>> {
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
    }
};

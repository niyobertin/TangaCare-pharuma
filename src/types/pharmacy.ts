export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface DashboardStats {
    medicinesInStock: string;
    lowStockWarning: number;
    expiringSoon: number;
    dailySales: string;
    trends: {
        medicines: string;
        lowStock: string;
        expiring: string;
        sales: string;
    };
    isPositive: {
        medicines: boolean;
        lowStock: boolean;
        expiring: boolean;
        sales: boolean;
    };
}

export interface Medicine {
    id: number;
    code: string;
    name: string;
    brand_name?: string;
    strength: string;
    dosage_form: string;
    unit: string;
    cost_price: number;
    selling_price: number;
    is_controlled_drug: boolean;
    stock_quantity?: number;
}

export interface Facility {
    id: number;
    name: string;
    type: 'hospital' | 'clinic' | 'pharmacy_shop';
    address: string;
    phone: string;
    email: string;
    status: 'Active' | 'Inactive';
    admin_name?: string;
}

// ... (skipping unchanged parts)

export interface CreateFacilityDto {
    name: string;
    type: 'hospital' | 'clinic' | 'pharmacy_shop';
    address: string;
    phone: string;
    email: string;
}

export interface Batch {
    id: number;
    medicine_id: number;
    batch_number: string;
    expiry_date: string;
    manufacturing_date: string;
    initial_quantity: number;
    current_quantity: number;
    unit_cost: number;
}

export interface Stock {
    id: number;
    facility_id: number;
    medicine_id: number;
    quantity: number;
    min_threshold: number;
    medicine?: Medicine;
}

export interface Supplier {
    id: number;
    name: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
}

export interface ProcurementOrder {
    id: number;
    facility_id: number;
    supplier_id: number;
    order_date: string;
    status: 'pending' | 'ordered' | 'received' | 'cancelled';
    total_amount: number;
    items_count: number;
    supplier?: Supplier;
}

export interface Alert {
    id: number;
    facility_id: number;
    type: 'low_stock' | 'expiry' | 'system';
    message: string;
    status: 'active' | 'acknowledged';
    created_at: string;
}

export interface Transaction {
    id: string;
    name: string;
    category: string;
    qty: string;
    status: 'Completed' | 'In Process' | 'Restocked';
    date: string;
    sku: string;
}

export interface CreateMedicineDto {
    code: string;
    name: string;
    brand_name?: string;
    strength: string;
    dosage_form: string;
    unit: string;
    cost_price: number;
    selling_price: number;
}



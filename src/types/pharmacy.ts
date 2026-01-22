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
    facility_admin?: import('./auth').User;
    // Configuration fields
    departments_enabled: boolean;
    controlled_drug_rules_enabled: boolean;
    min_stock_threshold_percentage: number;
    expiry_alert_days: number;
}

export interface Department {
    id: number;
    facility_id: number;
    name: string;
    type: 'store' | 'dispensary' | 'ward' | 'theatre' | 'other';
    head_user_id?: number;
    description?: string;
    is_main_store: boolean;
    status: 'active' | 'inactive';
}

// ... (skipping unchanged parts)

export interface CreateFacilityDto {
    name: string;
    type: 'hospital' | 'clinic' | 'pharmacy_shop';
    address: string;
    phone: string;
    email: string;
    // Configuration fields
    departments_enabled?: boolean;
    controlled_drug_rules_enabled?: boolean;
    min_stock_threshold_percentage?: number;
    expiry_alert_days?: number;
    status?: 'Active' | 'Inactive';
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
    status: 'active' | 'expired' | 'depleted' | 'quarantined';
}

export interface Stock {
    id: number;
    facility_id: number;
    department_id?: number | null; // Null indicates Central Store (for Hospitals) or Main Stock (for others)
    medicine_id: number;
    quantity: number;
    min_threshold: number;
    medicine?: Medicine;
    department?: Department;
}

export interface Supplier {
    id: number;
    name: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    tax_id?: string;
    is_active: boolean;
}

export interface ProcurementOrderItem {
    id: number;
    medicine_id: number;
    quantity_ordered: number;
    quantity_received?: number;
    unit_price: number;
    total_price: number;
    medicine?: Medicine;
}

export interface ProcurementOrder {
    id: number;
    order_number: string;
    facility_id: number;
    supplier_id: number;
    order_date: string;
    status: 'PENDING' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED';
    total_amount: number; // Used interchangeably with total_cost, keeping total_amount as db field
    total_cost?: number; // Frontend alias if needed
    items_count: number;
    supplier?: Supplier;
    items?: ProcurementOrderItem[];
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



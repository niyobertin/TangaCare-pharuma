import type { User } from './auth';

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
    totalSalesAllTime?: number;

    dailySalesChart?: Array<{ date: string; sales: number }>;

    staffCount?: number;
    totalInventoryValue?: number;

    activeAlertsCount?: number;
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
    barcode?: string;
    name: string;
    brand_name?: string;
    strength: string;
    dosage_form: string;
    unit: string;
    cost_price: number;
    selling_price: number;
    markup_percent?: number;
    category_id?: number;
    category?: MedicineCategory;
    is_controlled_drug: boolean;
    stock_quantity?: number;
    expiry_date?: string;
    created_at?: string;
}

export interface Organization {
    id: number;
    name: string;
    code?: string;
    type?: string;
    subscription_status?: string;
    is_active?: boolean;
}

export interface Facility {
    id: number;
    name: string;
    type: 'hospital' | 'clinic' | 'pharmacy_shop';
    address?: string;
    phone?: string;
    email?: string;
    organization_id?: number;
    organization?: Organization;
    admin_name?: string;
    facility_admin_id?: number;
    facility_admin?: import('./auth').User;
    departments_enabled?: boolean;
    controlled_drug_rules_enabled?: boolean;
    min_stock_threshold_percentage?: number;
    expiry_alert_days?: number;
    default_markup_percent?: number;
    status?: string | 'Active' | 'Inactive';
    is_active?: boolean;
}

export interface MedicineCategory {
    id: number;
    name: string;
    code: string;
    default_markup_percent?: number;
    organization_id?: number;
}

export interface CreateOrganizationDto {
    name: string;
    code?: string;
    type?: string;
    address?: string;
    phone?: string;
    email?: string;
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

export interface CreateFacilityDto {
    name: string;
    type: 'hospital' | 'clinic' | 'pharmacy_shop';
    address?: string;
    phone?: string;
    email?: string;
    organization_id?: number;

    departments_enabled?: boolean;
    controlled_drug_rules_enabled?: boolean;
    min_stock_threshold_percentage?: number;
    expiry_alert_days?: number;
    status?: string;
    is_active?: boolean;
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
    department_id?: number | null;
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
    created_at?: string;
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
    organization_id: number;
    supplier_id: number;
    order_date: string;
    expected_delivery_date?: string;
    received_date?: string;
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED';
    subtotal_amount: number;
    discount_percent: number;
    discount_amount: number;
    vat_rate: number;
    vat_amount: number;
    total_amount: number;
    notes?: string;
    items_count: number;
    supplier?: Supplier;
    facility?: Facility;
    created_by?: User;
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

export type SaleStatus = 'paid' | 'partially_paid' | 'unpaid' | 'voided';
export type SalePaymentMethod = 'cash' | 'mobile_money' | 'bank' | 'card';

export interface SalePayment {
    id: number;
    sale_id: number;
    method: SalePaymentMethod;
    amount: number;
    reference?: string | null;
    created_at?: string;
}

export interface SaleItem {
    id: number;
    sale_id: number;
    medicine_id: number;
    batch_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at?: string;
}

export interface Sale {
    id: number;
    sale_number: string;
    facility_id: number;
    patient_id?: number | null;
    cashier_id: number;
    subtotal: number;
    vat_rate: number;
    vat_amount: number;
    total_amount: number;
    paid_amount: number;
    balance_amount: number;
    status: SaleStatus;
    created_at?: string;
    items?: SaleItem[];
    payments?: SalePayment[];
}

export interface CreateSaleDto {
    patient_id?: number;
    dispense_type?: 'otc' | 'prescription' | 'internal' | 'transfer';
    vat_rate?: number;
    items: Array<{
        medicine_id: number;
        batch_id: number;
        quantity: number;
        unit_price: number;
    }>;
    payments: Array<{
        method: SalePaymentMethod;
        amount: number;
        reference?: string;
    }>;
}

// Advanced Analytics Types
export interface AdvancedKPIs {
    inventory_turnover: {
        ratio: number;
        period: string;
        target: number;
    };
    days_on_hand: {
        average: number;
        critical_items: number;
        target: number;
    };
    inventory_accuracy: {
        rate: number;
        last_count_date: string | null;
        target: number;
    };
    controlled_drug_variance: {
        status: 'compliant' | 'variance';
        variance_count: number;
    };
}

export interface CriticalMedicine {
    id: number;
    name: string;
    current_quantity: number;
    min_threshold: number;
    status: 'adequate' | 'low_stock' | 'critical';
    expiry_risk: 'safe' | 'warning' | 'critical';
    last_dispensed: string | null;
}

export interface ExpiryHeatMapData {
    dates: Array<{
        date: string;
        batches: Array<{
            batch_number: string;
            medicine_name: string;
            quantity: number;
        }>;
        total_value: number;
    }>;
}

export interface FEFOComplianceData {
    compliance_rate: number;
    total_transactions: number;
    compliant_transactions: number;
    violations: Array<{
        transaction_id: number;
        date: string;
        medicine_name: string;
        batch_used: string;
        batch_expiry: string;
        earlier_batch_available: string;
        earlier_expiry: string;
    }>;
}

export interface ABCAnalysisData {
    class_a: Array<ABCAnalysisItem>;
    class_b: Array<ABCAnalysisItem>;
    class_c: Array<ABCAnalysisItem>;
    all_items: Array<ABCAnalysisItem>;
    summary: {
        totalValue: number;
        classes: {
            A: { itemCount: number; totalValue: number; percentage: number };
            B: { itemCount: number; totalValue: number; percentage: number };
            C: { itemCount: number; totalValue: number; percentage: number };
        };
    };
}

export interface ABCAnalysisItem {
    medicine_id: number;
    medicine_name: string;
    consumption_value: number;
    cumulative_percentage: number;
    classification: 'A' | 'B' | 'C';
}

export interface MultiLocationData {
    facilities: Array<{
        facility_id: number;
        facility_name: string;
        metric_value: number;
        rank: number;
    }>;
}

export interface OverstockData {
    items: Array<{
        medicine_id: number;
        medicine_name: string;
        current_quantity: number;
        target_quantity: number;
        excess: number;
        excess_value: number;
    }>;
}

export interface ReorderSuggestion {
    medicine_id: number;
    medicine_name: string;
    current_quantity: number;
    reorder_point: number;
    suggested_quantity: number;
    urgency: 'low' | 'medium' | 'high';
}

export interface SupplierPerformanceItem {
    supplier_id: number;
    supplier_name: string;
    total_orders: number;
    avg_lead_time_days: number;
    fulfillment_rate: number;
    on_time_delivery_rate: number;
}

export interface BatchTraceabilityRow {
    transaction_id: number;
    transaction_number: string;
    date: string;
    patient_id: number | null;
    patient_name: string;
    quantity: number;
    dispensed_by: string;
}

export interface BatchTraceabilityReport {
    batch_id: number;
    batch_number: string;
    medicine_name: string;
    expiry_date: string;
    total_dispensed: number;
    patients: BatchTraceabilityRow[];
}

export interface ControlledDrugRegisterRow {
    id: number;
    date: string;
    type: string;
    reference: string;
    quantity_in: number;
    quantity_out: number;
    balance: number;
    user_name: string;
    notes: string;
}

export interface ControlledDrugRegisterReport {
    medicine_id: number;
    medicine_name: string;
    current_balance: number;
    movements: ControlledDrugRegisterRow[];
}

export type PhysicalCountStatus = 'in_progress' | 'completed' | 'approved' | 'cancelled';

export interface PhysicalCountItem {
    id: number;
    physical_count_id: number;
    medicine_id: number;
    batch_id: number;
    system_quantity: number;
    counted_quantity: number;
    variance: number;
    notes?: string;
    medicine?: Medicine;
    batch?: Batch;
}

export interface PhysicalCount {
    id: number;
    facility_id: number;
    count_date: string;
    status: PhysicalCountStatus;
    counted_by_id: number;
    approved_by_id?: number;
    approved_at?: string;
    notes?: string;
    created_at: string;
    items?: PhysicalCountItem[];
    counted_by?: import('./auth').User;
    approved_by?: import('./auth').User;
}

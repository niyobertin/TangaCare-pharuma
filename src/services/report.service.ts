import api from '../lib/api';
import type {
    DashboardStats,
    Transaction,
    PaginatedResponse,
    ComprehensiveKPIs,
    FinancialKPIs,
    InventoryKPIs,
    OperationalKPIs,
    DashboardSummary,
    DailySalesReport,
    MonthlySalesReport,
    SalesByMedicineReport,
    AdvancedKPIs,
    CriticalMedicine,
    ExpiryHeatMapData,
    FEFOComplianceData,
    ABCAnalysisData,
    MultiLocationData,
    OverstockData,
    SupplierPerformanceItem,
    BatchTraceabilityReport,
    ControlledDrugRegisterReport,
    Alert,
} from '../types/pharmacy';
import { normalizePaginatedResponse } from './utils';

export const reportService = {
    async getDashboardStats(): Promise<DashboardStats> {
        const response = await api.get<{ data: DashboardStats }>('/pharmacy/stats');
        return (response.data as any).data ?? (response.data as any);
    },

    async getRecentSales(): Promise<Transaction[]> {
        const response = await api.get<{ data: Transaction[] }>('/pharmacy/transactions');
        return (response.data as any).data ?? (response.data as any);
    },

    async getTopSellingMedicines(
        order: 'ASC' | 'DESC' = 'DESC',
    ): Promise<{ name: string; value: number }[]> {
        const response = await api.get('/pharmacy/top-selling', { params: { order } });
        return (response.data as any).data ?? (response.data as any);
    },

    async getInventoryStatus(): Promise<any> {
        const response = await api.get('/pharmacy/inventory-status');
        return (response.data as any).data ?? (response.data as any);
    },

    async getConsumptionTrends(days: number = 30): Promise<any> {
        const response = await api.get('/pharmacy/consumption-trends', { params: { days } });
        return (response.data as any).data ?? (response.data as any);
    },

    async getExpiryRisk(days: number = 90): Promise<any> {
        const response = await api.get('/pharmacy/expiry-risk', { params: { days } });
        return (response.data as any).data ?? (response.data as any);
    },

    async getStockReport(facilityId: number): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/stock/${facilityId}`);
        return (response.data as any).data ?? response.data;
    },

    async getSalesReport(
        facilityId: number,
        params?: { start_date?: string; end_date?: string },
    ): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/sales-summary/${facilityId}`, {
            params,
        });
        return (response.data as any).data ?? response.data;
    },

    async getProfitReport(
        facilityId: number,
        params?: { start_date?: string; end_date?: string },
    ): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/profit/${facilityId}`, { params });
        return (response.data as any).data ?? response.data;
    },

    async getDeadStockReport(facilityId: number, params?: { days?: number }): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/dead-stock/${facilityId}`, {
            params,
        });
        return (response.data as any).data ?? response.data;
    },

    async getControlledDrugReport(
        facilityId: number,
        params?: { start_date?: string; end_date?: string },
    ): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/controlled-drugs/${facilityId}`, {
            params,
        });
        return (response.data as any).data ?? response.data;
    },

    async getExpiryReport(facilityId: number, params?: { days?: number }): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/expiry/${facilityId}`, { params });
        return (response.data as any).data ?? response.data;
    },

    async getAuditLogs(params?: {
        facilityId?: number;
        entityType?: string;
        action?: string;
        page?: number;
        limit?: number;
    }): Promise<{ data: any[]; total: number; page: number; limit: number }> {
        const response = await api.get<any>('/pharmacy/audit-logs', { params });
        const payload = (response.data as any).data ?? response.data;
        return {
            data: Array.isArray(payload.data) ? payload.data : [],
            total: payload.total ?? 0,
            page: payload.page ?? 1,
            limit: payload.limit ?? 50,
        };
    },

    async getStockMovements(params: {
        facilityId: number;
        start_date?: string;
        end_date?: string;
        page?: number;
        limit?: number;
    }): Promise<{ data: any[]; total: number; page: number; limit: number }> {
        const response = await api.get<any>('/pharmacy/audit-logs/stock-movements', { params });
        const payload = (response.data as any).data ?? response.data;
        return {
            data: Array.isArray(payload.data) ? payload.data : [],
            total: payload.total ?? 0,
            page: payload.page ?? 1,
            limit: payload.limit ?? 50,
        };
    },

    async getStockRegisterReport(params: {
        facilityId: number;
        start_date?: string;
        end_date?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        period?: { start: string; end: string };
    }> {
        const { facilityId, ...rest } = params;
        const response = await api.get<any>(`/pharmacy/reports/stock-register/${facilityId}`, {
            params: rest,
        });
        const payload = (response.data as any).data ?? response.data;
        return {
            data: Array.isArray(payload.data) ? payload.data : [],
            total: payload.total ?? 0,
            page: payload.page ?? 1,
            limit: payload.limit ?? 100,
            period: payload.period,
        };
    },

    async getTaxSummary(
        facilityId: number,
        params?: { start_date?: string; end_date?: string },
    ): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/tax-summary/${facilityId}`, {
            params,
        });
        return (response.data as any).data ?? response.data;
    },

    async getCustomerLoyaltyReport(facilityId: number): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/customer-loyalty/${facilityId}`);
        return (response.data as any).data ?? response.data;
    },

    async getEmployeePerformanceReport(
        facilityId: number,
        params?: { start_date?: string; end_date?: string },
    ): Promise<any> {
        const response = await api.get<any>(
            `/pharmacy/reports/employee-performance/${facilityId}`,
            {
                params,
            },
        );
        return (response.data as any).data ?? response.data;
    },

    async getVendorReturnsReport(facilityId: number): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/vendor-returns/${facilityId}`);
        return (response.data as any).data ?? response.data;
    },

    async getPurchaseReport(
        facilityId: number,
        params?: { start_date?: string; end_date?: string },
    ): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/purchase/${facilityId}`, {
            params,
        });
        return (response.data as any).data ?? response.data;
    },

    async downloadReport(
        type: string,
        format: 'excel' | 'pdf',
        params?: { start_date?: string; end_date?: string; days?: number },
    ): Promise<void> {
        const response = await api.get(`/pharmacy/reports/export/${type}/${format}`, {
            params,
            responseType: 'blob',
        });

        const blob = new Blob([response.data], {
            type:
                format === 'excel'
                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    : 'application/pdf',
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `${type}_report_${timestamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`;

        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },

    async getAdvancedKPIs(): Promise<AdvancedKPIs> {
        const response = await api.get<{ data: AdvancedKPIs }>(
            '/pharmacy/analytics/kpis',
        );
        return (response.data as any).data ?? response.data;
    },

    async getCriticalMedicines(): Promise<{
        medicines: CriticalMedicine[];
    }> {
        const response = await api.get<any>('/pharmacy/analytics/critical-medicines');
        return (response.data as any).data ?? response.data;
    },

    async getExpiryHeatMap(params: {
        start: string;
        end: string;
    }): Promise<ExpiryHeatMapData> {
        const response = await api.get<any>('/pharmacy/analytics/expiry-heatmap', { params });
        return (response.data as any).data ?? response.data;
    },

    async getFEFOCompliance(
        days?: number,
    ): Promise<FEFOComplianceData> {
        const response = await api.get<any>('/pharmacy/analytics/fefo-compliance', {
            params: { days },
        });
        return (response.data as any).data ?? response.data;
    },

    async getABCAnalysis(period?: number): Promise<ABCAnalysisData> {
        const response = await api.get<any>('/pharmacy/analytics/abc-analysis', {
            params: { period },
        });
        return (response.data as any).data ?? response.data;
    },

    async getMultiLocationComparison(
        metric: string,
    ): Promise<MultiLocationData> {
        const response = await api.get<any>('/pharmacy/analytics/multi-location', {
            params: { metric },
        });
        return (response.data as any).data ?? response.data;
    },

    async getOverstockReport(): Promise<OverstockData> {
        const response = await api.get<any>('/pharmacy/analytics/overstock');
        return (response.data as any).data ?? response.data;
    },

    async recalculateConsumption(
        days?: number,
    ): Promise<{ updated_count: number; results: any[] }> {
        const response = await api.post<any>('/pharmacy/analytics/recalculate-consumption', {
            days,
        });
        return (response.data as any).data ?? response.data;
    },

    async getReorderSuggestions(facilityId: number | null): Promise<any[]> {
        const url = facilityId
            ? `/pharmacy/analytics/reorder-suggestions/${facilityId}`
            : '/pharmacy/analytics/reorder-suggestions';
        const response = await api.get<any>(url);
        const data = (response.data as any).data ?? response.data;
        return Array.isArray(data) ? data : data.suggestions || [];
    },

    async createDraftPOsFromSuggestions(facilityId: number): Promise<{ count: number }> {
        const response = await api.post<any>(`/pharmacy/procurement/auto-draft-pos`, {
            facility_id: facilityId,
        });
        return (response.data as any).data ?? response.data;
    },

    async getSupplierPerformance(): Promise<SupplierPerformanceItem[]> {
        const response = await api.get<any>('/pharmacy/analytics/supplier-performance');
        return (response.data as any).data ?? response.data;
    },

    async getBatchTraceability(
        batchId: number,
    ): Promise<BatchTraceabilityReport> {
        const response = await api.get<any>(`/pharmacy/reports/batch-traceability/${batchId}`);
        return (response.data as any).data ?? response.data;
    },

    async getControlledDrugRegister(
        facilityId: number,
        medicineId: number,
    ): Promise<ControlledDrugRegisterReport> {
        const response = await api.get<any>(
            `/pharmacy/reports/controlled-drug-register/${facilityId}/${medicineId}`,
        );
        return (response.data as any).data ?? response.data;
    },

    async getDailySalesReport(
        facilityId: number,
        params: { date: string },
    ): Promise<DailySalesReport> {
        const response = await api.get<any>(`/pharmacy/reports/sales/daily/${facilityId}`, {
            params,
        });
        return (response.data as any).data ?? response.data;
    },

    async getMonthlySalesReport(
        facilityId: number,
        params: { year: number; month: number },
    ): Promise<MonthlySalesReport> {
        const response = await api.get<any>(`/pharmacy/reports/sales/monthly/${facilityId}`, {
            params,
        });
        return (response.data as any).data ?? response.data;
    },

    async getSalesByMedicineReport(
        facilityId: number,
        params?: { start_date?: string; end_date?: string },
    ): Promise<SalesByMedicineReport> {
        const response = await api.get<any>(`/pharmacy/reports/sales/by-medicine/${facilityId}`, {
            params,
        });
        return (response.data as any).data ?? response.data;
    },

    async getSalesByCategoryReport(
        facilityId: number,
        params?: { start_date?: string; end_date?: string },
    ): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/sales/by-category/${facilityId}`, {
            params,
        });
        return (response.data as any).data ?? response.data;
    },

    async getSalesByCashierReport(
        facilityId: number,
        params?: { start_date?: string; end_date?: string },
    ): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/sales/by-cashier/${facilityId}`, {
            params,
        });
        return (response.data as any).data ?? response.data;
    },

    async getPaymentMethodSummary(
        facilityId: number,
        params?: { start_date?: string; end_date?: string },
    ): Promise<any> {
        const response = await api.get<any>(
            `/pharmacy/reports/sales/payment-methods/${facilityId}`,
            {
                params,
            },
        );
        return (response.data as any).data ?? response.data;
    },

    async getGrossVsNetSalesReport(
        facilityId: number,
        params?: { start_date?: string; end_date?: string },
    ): Promise<any> {
        const response = await api.get<any>(`/pharmacy/reports/sales/gross-vs-net/${facilityId}`, {
            params,
        });
        return (response.data as any).data ?? response.data;
    },

    async getComprehensiveKPIs(
        facilityId: number | null,
        params?: { start_date?: string; end_date?: string },
    ): Promise<ComprehensiveKPIs> {
        const url = facilityId
            ? `/pharmacy/kpis/comprehensive/${facilityId}`
            : '/pharmacy/kpis/comprehensive';
        const response = await api.get<any>(url, { params });
        return (response.data as any).data ?? response.data;
    },

    async getFinancialKPIs(
        facilityId: number,
        params?: { start_date?: string; end_date?: string },
    ): Promise<FinancialKPIs> {
        const response = await api.get<any>(`/pharmacy/kpis/financial/${facilityId}`, { params });
        return (response.data as any).data ?? response.data;
    },

    async getInventoryKPIs(facilityId: number): Promise<InventoryKPIs> {
        const response = await api.get<any>(`/pharmacy/kpis/inventory/${facilityId}`);
        return (response.data as any).data ?? response.data;
    },

    async getOperationalKPIs(
        facilityId: number,
        params?: { start_date?: string; end_date?: string },
    ): Promise<OperationalKPIs> {
        const response = await api.get<any>(`/pharmacy/kpis/operational/${facilityId}`, {
            params,
        });
        return (response.data as any).data ?? response.data;
    },

    async getDashboardSummary(facilityId: number | null): Promise<DashboardSummary> {
        const url = facilityId
            ? `/pharmacy/kpis/summary/${facilityId}`
            : '/pharmacy/kpis/summary';
        const response = await api.get<any>(url);
        return (response.data as any).data ?? response.data;
    },

    async getAlerts(params?: {
        facility_id?: number;
        status?: string;
        limit?: number;
    }): Promise<PaginatedResponse<Alert>> {
        const response = await api.get<any>('/pharmacy/alerts', { params });
        return normalizePaginatedResponse<Alert>(response.data);
    },

    async getAlertSummary(): Promise<any> {
        const response = await api.get<any>('/pharmacy/alerts/summary');
        return response.data;
    },

    async acknowledgeAlert(alertId: number): Promise<any> {
        const response = await api.post<any>(`/pharmacy/alerts/${alertId}/acknowledge`);
        return response.data;
    },

    async generateAlerts(): Promise<any> {
        const response = await api.post<any>('/pharmacy/alerts/generate');
        return response.data;
    },

    async resolveAlert(
        id: number,
        data: { action_taken: string; action_reason: string },
    ): Promise<Alert> {
        const response = await api.put<{ data: Alert }>(`/pharmacy/alerts/${id}/resolve`, data);
        return (response.data as any).data ?? (response.data as any);
    },
};

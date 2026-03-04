import api from '../lib/api';
import type { AxiosRequestConfig } from 'axios';
import type {
    Sale,
    CreateSaleDto,
    PaginatedResponse,
} from '../types/pharmacy';
import { normalizePaginatedResponse } from './utils';

export const saleService = {
    async createSale(payload: CreateSaleDto, config?: AxiosRequestConfig): Promise<Sale> {
        const response = await api.post<any>('/pharmacy/sales', payload, config);
        return (response.data as any).data ?? response.data;
    },

    async getSale(id: number): Promise<Sale> {
        const response = await api.get<any>(`/pharmacy/sales/${id}`);
        return (response.data as any).data ?? response.data;
    },

    async getSaleReceipt(id: number, facilityId: number): Promise<void> {
        const response = await api.get(`/pharmacy/sales/${id}/receipt`, {
            params: { facilityId },
            responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `receipt_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },

    async downloadReceipt(saleId: number): Promise<void> {
        const response = await api.get(`/pharmacy/sales/${saleId}/receipt`, {
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `receipt_${saleId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },

    async getPatientSales(patientId: number, limit = 3): Promise<Sale[]> {
        const response = await api.get<any>('/pharmacy/sales', {
            params: { patient_id: patientId, limit },
        });
        const payload = (response.data as any).data ?? response.data;
        const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
        return items.slice(0, limit) as Sale[];
    },

    async getFacilityMedicinePrice(medicineId: number): Promise<number | null> {
        try {
            const response = await api.get<any>(`/pharmacy/facility-settings/medicine/${medicineId}/price`);
            const payload = (response.data as any).data ?? response.data;
            return typeof payload?.selling_price === 'number' ? payload.selling_price : null;
        } catch {
            return null;
        }
    },

    // Return Management
    async getReturns(params?: {
        facility_id?: number;
        status?: any;
        sale_number?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<any>> {
        const response = await api.get<any>('/pharmacy/returns', { params });
        return normalizePaginatedResponse<any>(response.data);
    },

    async getReturn(id: number): Promise<any> {
        const response = await api.get<any>(`/pharmacy/returns/${id}`);
        return (response.data as any).data ?? response.data;
    },

    async createReturn(payload: any): Promise<any> {
        const response = await api.post<any>('/pharmacy/returns', payload);
        return (response.data as any).data ?? response.data;
    },

    async approveReturn(id: number): Promise<any> {
        const response = await api.post<any>(`/pharmacy/returns/${id}/approve`);
        return (response.data as any).data ?? response.data;
    },

    async rejectReturn(id: number, reason: string): Promise<any> {
        const response = await api.post<any>(`/pharmacy/returns/${id}/reject`, { reason });
        return (response.data as any).data ?? response.data;
    },

    async processRefund(id: number): Promise<any> {
        const response = await api.post<any>(`/pharmacy/returns/${id}/process-refund`);
        return (response.data as any).data ?? response.data;
    },
};

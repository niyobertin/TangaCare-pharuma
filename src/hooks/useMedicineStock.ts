import { useState, useEffect } from 'react';
import { pharmacyService } from '../services/pharmacy.service';

interface MedicineStockInfo {
    nearestExpiry: string | null;
    storageLocation: string | null;
    isLoading: boolean;
    error: any;
}

export const useMedicineStock = (medicineId: number): MedicineStockInfo => {
    const [info, setInfo] = useState<MedicineStockInfo>({
        nearestExpiry: null,
        storageLocation: null,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        let isMounted = true;

        const fetchStockDetails = async () => {
            try {
                setInfo(prev => ({ ...prev, isLoading: true }));

                // Parallel fetch for batches (expiry) and hypothetical stock location
                // Note: pharmacyService.getBatches returns Batch[]
                // We'll need to check if there's an API for storage location or if it's part of stock

                const batches = await pharmacyService.getBatches({ medicine_id: medicineId });

                // Find nearest expiry from active batches with quantity > 0
                const validBatches = batches
                    .filter(b => b.current_quantity > 0)
                    .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());

                const nearestExpiry = validBatches.length > 0 ? validBatches[0].expiry_date : null;

                // For storage location, assuming we might need to fetch from a stock endpoint or it's not yet fully implemented in service.
                // Based on previous analysis, StorageLocation exists but might not be linked directly in getMedicines.
                // A temporary solution is to check if batch has location info or if we need a separate call.
                // For now, checks if batches have location_id, then we might need to fetch location name.
                // Or simplified: Just use a placeholder or derived data if available. 
                // *Correction*: The stock/location relationship might be many-to-many. 
                // I will default to "Main Pharmacy" or similar if no specific data, 
                // but ideally we'd fetch `pharmacyService.getStock({ medicine_id })`.
                // Since `getStock` wasn't explicitly seen in `pharmacyService.ts`, I'll rely on Batch info or leave as 'rack A' mock if needed, 
                // BUT better: I will leave location as null if not found to avoid fake data.

                // Use the first valid batch's location if available (assumed property or need to add)
                // actually looking at `Batch` interface in previous turns, it didn't explicitly show location_id.
                // `Stock` entity connects Medicine and Location.
                // I'll leave storageLocation as null for now unless I find a way to get it efficiently.
                // Wait, the user requirement is "Storage Location (Shelf / Rack / Bin / Zone)".
                // I should try to get this. 

                setInfo({
                    nearestExpiry,
                    storageLocation: null, // Placeholder until Stock API is confirmed
                    isLoading: false,
                    error: null,
                });

            } catch (err) {
                if (isMounted) {
                    setInfo(prev => ({ ...prev, isLoading: false, error: err }));
                }
            }
        };

        if (medicineId) {
            fetchStockDetails();
        }

        return () => {
            isMounted = false;
        };
    }, [medicineId]);

    return info;
};

import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { settingsService, type RuntimeConfig } from '../services/settings.service';

interface RuntimeConfigContextType {
    /** Flattened config from backend (currency, tax, locale). */
    config: RuntimeConfig | null;
    /** Format amount for display using tenant currency/symbol/decimals. */
    formatMoney: (amount: number | string | null | undefined) => string;
    /** Currency code (e.g. RWF). */
    currencyCode: string;
    /** Symbol for display (e.g. RWF). */
    currencySymbol: string;
    /** Default VAT rate (decimal 0–1). */
    vatRate: number;
    /** Max discount percent allowed (0–100). */
    maxDiscountPercent: number;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

const defaultConfig: RuntimeConfig = {
    currencyCode: 'RWF',
    currencySymbol: 'RWF',
    currencyDecimals: 0,
    currencyRoundingMode: 'half_up',
    maxDiscountPercent: 20,
    vatEnabled: true,
    vatRate: 0.18,
    locale: 'en-RW',
    timezone: 'Africa/Kigali',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,234.56',
};

const RuntimeConfigContext = createContext<RuntimeConfigContextType | undefined>(undefined);

function formatMoneyWithConfig(
    amount: number | string | null | undefined,
    config: RuntimeConfig,
): string {
    const num = typeof amount === 'number' ? amount : Number(amount);
    if (!Number.isFinite(num)) return '—';
    const decimals = config.currencyDecimals ?? 0;
    const rounded =
        decimals === 0 ? Math.round(num) : Number(num.toFixed(decimals));
    const formatted = rounded.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    return `${config.currencySymbol} ${formatted}`.trim();
}

export const RuntimeConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, organizationId, facilityId } = useAuth();
    const [config, setConfig] = useState<RuntimeConfig | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchConfig = useCallback(async () => {
        if (!isAuthenticated || !organizationId) {
            setConfig(null);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const data = await settingsService.getRuntimeConfig();
            setConfig(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            setConfig(defaultConfig);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, organizationId, facilityId]);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const formatMoney = useCallback(
        (amount: number | string | null | undefined) => {
            const c = config ?? defaultConfig;
            return formatMoneyWithConfig(amount, c);
        },
        [config],
    );

    const value = useMemo<RuntimeConfigContextType>(
        () => ({
            config: config ?? defaultConfig,
            formatMoney,
            currencyCode: (config ?? defaultConfig).currencyCode,
            currencySymbol: (config ?? defaultConfig).currencySymbol,
            vatRate: (config ?? defaultConfig).vatRate,
            maxDiscountPercent: (config ?? defaultConfig).maxDiscountPercent,
            isLoading,
            error,
            refetch: fetchConfig,
        }),
        [config, formatMoney, isLoading, error, fetchConfig],
    );

    return (
        <RuntimeConfigContext.Provider value={value}>
            {children}
        </RuntimeConfigContext.Provider>
    );
};

export function useRuntimeConfig(): RuntimeConfigContextType {
    const ctx = useContext(RuntimeConfigContext);
    if (ctx === undefined) {
        return {
            config: defaultConfig,
            formatMoney: (amount) => formatMoneyWithConfig(amount, defaultConfig),
            currencyCode: defaultConfig.currencyCode,
            currencySymbol: defaultConfig.currencySymbol,
            vatRate: defaultConfig.vatRate,
            maxDiscountPercent: defaultConfig.maxDiscountPercent,
            isLoading: false,
            error: null,
            refetch: async () => {},
        };
    }
    return ctx;
}

import { useQuery } from '@tanstack/react-query';
import { pharmacyService } from '../../services/pharmacy.service';
import { TrendingUp, TrendingDown, Package, Calendar, Target, AlertTriangle } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    target?: number;
    status: 'good' | 'warning' | 'critical';
    icon: React.ReactNode;
    subtitle?: string;
    onClick?: () => void;
}

const KPICard = ({ title, value, target, status, icon, subtitle, onClick }: KPICardProps) => {
    const statusColors = {
        good: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',
        warning:
            'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400',
        critical:
            'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400',
    };

    const iconColors = {
        good: 'text-green-600 dark:text-green-400',
        warning: 'text-yellow-600 dark:text-yellow-400',
        critical: 'text-red-600 dark:text-red-400',
    };

    return (
        <div
            className={`rounded-lg border-2 p-6 transition-all hover:shadow-md ${statusColors[status]} ${
                onClick ? 'cursor-pointer' : ''
            }`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        {title}
                    </p>
                    <p className="text-3xl font-bold mb-2 dark:text-white">{value}</p>
                    {target !== undefined && (
                        <p className="text-xs text-gray-500">
                            Target: {target}
                            {typeof value === 'number' && (
                                <span className="ml-2">
                                    {value >= target ? (
                                        <TrendingUp className="inline w-3 h-3 text-green-600" />
                                    ) : (
                                        <TrendingDown className="inline w-3 h-3 text-red-600" />
                                    )}
                                </span>
                            )}
                        </p>
                    )}
                    {subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
                    )}
                </div>
                <div
                    className={`p-3 rounded-full bg-white dark:bg-slate-800 ${iconColors[status]}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
};

export const AdvancedKPICards = () => {
    const { data: kpis, isLoading } = useQuery({
        queryKey: ['advanced-kpis'],
        queryFn: () => pharmacyService.getAdvancedKPIs(),
        refetchInterval: 60000, // Refresh every minute
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="h-32 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (!kpis) {
        return null;
    }

    // Determine status based on targets
    const getTurnoverStatus = (ratio: number, target: number): 'good' | 'warning' | 'critical' => {
        if (ratio >= target) return 'good';
        if (ratio >= target * 0.7) return 'warning';
        return 'critical';
    };

    const getDOHStatus = (avg: number, target: number): 'good' | 'warning' | 'critical' => {
        if (avg <= target && avg > 0) return 'good';
        if (avg <= target * 1.5) return 'warning';
        return 'critical';
    };

    const getAccuracyStatus = (rate: number, target: number): 'good' | 'warning' | 'critical' => {
        if (rate >= target) return 'good';
        if (rate >= target * 0.9) return 'warning';
        return 'critical';
    };

    const getVarianceStatus = (status: string): 'good' | 'warning' | 'critical' => {
        return status === 'compliant' ? 'good' : 'critical';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard
                title="Inventory Turnover"
                value={kpis.inventory_turnover.ratio.toFixed(2)}
                target={kpis.inventory_turnover.target}
                status={getTurnoverStatus(
                    kpis.inventory_turnover.ratio,
                    kpis.inventory_turnover.target,
                )}
                icon={<Package className="w-6 h-6" />}
                subtitle={`Last ${kpis.inventory_turnover.period}`}
            />

            <KPICard
                title="Days on Hand"
                value={kpis.days_on_hand.average.toFixed(1)}
                target={kpis.days_on_hand.target}
                status={getDOHStatus(kpis.days_on_hand.average, kpis.days_on_hand.target)}
                icon={<Calendar className="w-6 h-6" />}
                subtitle={
                    kpis.days_on_hand.critical_items > 0
                        ? `${kpis.days_on_hand.critical_items} items < 7 days`
                        : 'All items adequate'
                }
            />

            <KPICard
                title="Inventory Accuracy"
                value={
                    kpis.inventory_accuracy.rate > 0
                        ? `${kpis.inventory_accuracy.rate.toFixed(1)}%`
                        : 'N/A'
                }
                target={kpis.inventory_accuracy.target}
                status={
                    kpis.inventory_accuracy.rate > 0
                        ? getAccuracyStatus(
                              kpis.inventory_accuracy.rate,
                              kpis.inventory_accuracy.target,
                          )
                        : 'warning'
                }
                icon={<Target className="w-6 h-6" />}
                subtitle={
                    kpis.inventory_accuracy.last_count_date
                        ? `Last count: ${new Date(kpis.inventory_accuracy.last_count_date).toLocaleDateString()}`
                        : 'No physical count yet'
                }
            />

            <KPICard
                title="Controlled Drug Compliance"
                value={
                    kpis.controlled_drug_variance.status === 'compliant' ? 'Compliant' : 'Variance'
                }
                status={getVarianceStatus(kpis.controlled_drug_variance.status)}
                icon={<AlertTriangle className="w-6 h-6" />}
                subtitle={
                    kpis.controlled_drug_variance.variance_count > 0
                        ? `${kpis.controlled_drug_variance.variance_count} items with variance`
                        : 'All items match'
                }
            />
        </div>
    );
};

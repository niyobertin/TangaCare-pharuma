import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell,
    Line,
    LineChart,
    ReferenceLine,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

// --- Types ---
export interface InventoryData {
    category: string;
    count: number;
    value: number;
}

export interface TrendData {
    date: string;
    dispensed: number;
    received: number;
}

export interface ColdChainTrendData {
    timestamp: string;
    average_temperature_c: number;
    readings: number;
    excursion_readings: number;
}

// --- Components ---

export const InventoryStatusChart: React.FC<{ data: InventoryData[] }> = ({ data }) => {
    const { isDark } = useTheme();
    const axisColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const tooltipStyle = {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        color: isDark ? '#f8fafc' : '#0f172a',
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke={gridColor}
                />
                <XAxis type="number" stroke={axisColor} tick={{ fontSize: 10 }} />
                <YAxis
                    dataKey="category"
                    type="category"
                    width={80}
                    stroke={axisColor}
                    tick={{ fontSize: 10 }}
                />
                <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: any, name: any) => [
                        name === 'value' && typeof value === 'number'
                            ? `$${value.toLocaleString()}`
                            : value,
                        name === 'value' ? 'Stock Value' : 'Item Count',
                    ]}
                />
                <Legend />
                <Bar dataKey="count" name="Items" fill="#8884d8" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export const ConsumptionTrendChart: React.FC<{ data: TrendData[] }> = ({ data }) => {
    const { isDark } = useTheme();
    const axisColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const tooltipStyle = {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        color: isDark ? '#f8fafc' : '#0f172a',
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <defs>
                    <linearGradient id="colorDispensed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="date"
                    stroke={axisColor}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(str) => {
                        const date = new Date(str);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                />
                <YAxis stroke={axisColor} tick={{ fontSize: 10 }} width={35} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <Tooltip
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    contentStyle={tooltipStyle}
                />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="dispensed"
                    stackId="1"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorDispensed)"
                    name="Dispensed"
                />
                <Area
                    type="monotone"
                    dataKey="received"
                    stackId="1"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#colorReceived)"
                    name="Received"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export const ExpiryRiskChart: React.FC<{ data: any }> = ({ data }) => {
    const { isDark } = useTheme();
    const axisColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const tooltipStyle = {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        color: isDark ? '#f8fafc' : '#0f172a',
    };

    // Transform backend data to chart format if needed, or assume data is ready
    // Expected data: { "0-30 days": 10, "30-60 days": 5, ... } array or object
    // Adapting to generic array for now
    const chartData = [
        { name: '0-30 Days', count: data?.days_30 || 0, fill: '#ff4d4f' }, // Red for immediate risk
        { name: '31-60 Days', count: data?.days_60 || 0, fill: '#faad14' }, // Orange
        { name: '61-90 Days', count: data?.days_90 || 0, fill: '#fadb14' }, // Yellow
    ];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke={axisColor} tick={{ fontSize: 10 }} />
                <YAxis stroke={axisColor} tick={{ fontSize: 10 }} width={30} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="count" name="Batches Expiring" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export const ColdChainTelemetryChart: React.FC<{ data: ColdChainTrendData[] }> = ({ data }) => {
    const { isDark } = useTheme();
    const axisColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const tooltipStyle = {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        color: isDark ? '#f8fafc' : '#0f172a',
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis
                    dataKey="timestamp"
                    stroke={axisColor}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => {
                        const d = new Date(value);
                        return `${d.getHours().toString().padStart(2, '0')}:00`;
                    }}
                />
                <YAxis stroke={axisColor} tick={{ fontSize: 10 }} width={35} />
                <Tooltip
                    contentStyle={tooltipStyle}
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                    formatter={(value: any, name: any) => {
                        if (name === 'average_temperature_c') {
                            return [`${Number(value).toFixed(1)}°C`, 'Avg Temperature'];
                        }
                        return [value, 'Excursion Readings'];
                    }}
                />
                <ReferenceLine y={8} stroke="#f59e0b" strokeDasharray="4 4" />
                <ReferenceLine y={-15} stroke="#f59e0b" strokeDasharray="4 4" />
                <Line
                    type="monotone"
                    dataKey="average_temperature_c"
                    name="average_temperature_c"
                    stroke="#0f766e"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                />
                <Line
                    type="monotone"
                    dataKey="excursion_readings"
                    name="excursion_readings"
                    stroke="#ef4444"
                    strokeWidth={1.5}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

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
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from 'recharts';

// --- Types ---
interface InventoryData {
    category: string;
    count: number;
    value: number;
}

interface TrendData {
    date: string;
    dispensed: number;
    received: number;
}

// --- Colors ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// --- Components ---

export const InventoryStatusChart: React.FC<{ data: InventoryData[] }> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={100} />
                <Tooltip
                    formatter={(value: any, name: any) => [
                        name === 'value' && typeof value === 'number' ? `$${value.toLocaleString()}` : value,
                        name === 'value' ? 'Stock Value' : 'Item Count'
                    ]}
                />
                <Legend />
                <Bar dataKey="count" name="Items" fill="#8884d8" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export const InventoryValuePieChart: React.FC<{ data: InventoryData[] }> = ({ data }) => {
    // Filter out small values for cleaner pie chart
    const filteredData = data.filter(d => d.value > 0);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={filteredData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => (percent ?? 0) > 0.05 ? `${name} ${((percent ?? 0) * 100).toFixed(0)}%` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="category"
                >
                    {filteredData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
        </ResponsiveContainer>
    );
}

export const ConsumptionTrendChart: React.FC<{ data: TrendData[] }> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    tickFormatter={(str) => {
                        const date = new Date(str);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString()} />
                <Legend />
                <Area type="monotone" dataKey="dispensed" stackId="1" stroke="#8884d8" fillOpacity={1} fill="url(#colorDispensed)" name="Dispensed" />
                <Area type="monotone" dataKey="received" stackId="1" stroke="#82ca9d" fillOpacity={1} fill="url(#colorReceived)" name="Received" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export const ExpiryRiskChart: React.FC<{ data: any }> = ({ data }) => {
    // Transform backend data to chart format if needed, or assume data is ready
    // Expected data: { "0-30 days": 10, "30-60 days": 5, ... } array or object
    // Adapting to generic array for now
    const chartData = [
        { name: '0-30 Days', count: data?.days_30 || 0, fill: '#ff4d4f' }, // Red for immediate risk
        { name: '31-60 Days', count: data?.days_60 || 0, fill: '#faad14' }, // Orange
        { name: '61-90 Days', count: data?.days_90 || 0, fill: '#fadb14' }, // Yellow
    ];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
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

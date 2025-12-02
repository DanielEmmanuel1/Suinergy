'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PortfolioDataPoint {
    date: string
    value: number
    earnings: number
}

interface PortfolioChartProps {
    data: PortfolioDataPoint[]
    height?: number
}

export function PortfolioChart({ data, height = 300 }: PortfolioChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                    <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1565c0" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#b92b27" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#b92b27" />
                        <stop offset="100%" stopColor="#1565c0" />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.06)"
                    vertical={false}
                />
                <XAxis
                    dataKey="date"
                    stroke="#000000"
                    style={{ fontSize: '12px' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    stroke="#000000"
                    style={{ fontSize: '12px' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                    labelStyle={{ color: '#000000', fontWeight: 600 }}
                />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="url(#lineGradient)"
                    strokeWidth={2}
                    fill="url(#portfolioGradient)"
                    animationDuration={500}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}


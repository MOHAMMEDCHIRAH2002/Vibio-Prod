'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface Props {
  data: { product?: { name: string }; revenue: number; unitsSold: number }[];
}

export default function TopProductsBar({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-[#7A776F]">
        No top performers yet.
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.product?.name?.split(' ').slice(0, 2).join(' ') || 'Unknown',
    revenue: item.revenue,
    units: item.unitsSold,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#ECE5DB" strokeDasharray="3 8" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: '#817D74' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value} MAD`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: '#575750' }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(2)} MAD`, 'Revenue']}
          contentStyle={{
            borderRadius: '18px',
            border: '1px solid #E3DCD1',
            background: 'rgba(252,250,247,0.96)',
            boxShadow: '0 18px 40px rgba(17,17,17,0.08)',
          }}
        />
        <Bar dataKey="revenue" fill="#273E1C" radius={[0, 10, 10, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

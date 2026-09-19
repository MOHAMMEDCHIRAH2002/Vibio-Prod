'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  data: { status: string; count: number }[];
}

const COLORS: Record<string, string> = {
  PENDING: '#C89A4A',
  CONFIRMED: '#5E826D',
  PROCESSING: '#8E6CAD',
  SHIPPED: '#6E8CA8',
  DELIVERED: '#2F6B45',
  CANCELLED: '#B85B3C',
  REFUNDED: '#8C857D',
};

export default function OrdersDonut({ data }: Props) {
  const filtered = data.filter((entry) => entry.count > 0);

  if (!filtered.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-[#7A776F]">
        No order distribution yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={filtered}
          cx="50%"
          cy="50%"
          innerRadius={62}
          outerRadius={94}
          paddingAngle={3}
          dataKey="count"
          nameKey="status"
          stroke="rgba(252,250,247,0.9)"
          strokeWidth={3}
        >
          {filtered.map((entry) => (
            <Cell key={entry.status} fill={COLORS[entry.status] || '#6C8349'} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [value, name.toLowerCase()]}
          contentStyle={{
            borderRadius: '18px',
            border: '1px solid #E3DCD1',
            background: 'rgba(252,250,247,0.96)',
            boxShadow: '0 18px 40px rgba(17,17,17,0.08)',
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs capitalize text-[#6B6A63]">{String(value).toLowerCase()}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

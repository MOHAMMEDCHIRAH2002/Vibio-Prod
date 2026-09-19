'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface Props {
  data: { date: string; revenue: number }[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-[1.1rem] border border-[#E3DCD1] bg-[#FCFAF7]/96 px-4 py-3 text-sm shadow-[0_18px_40px_rgba(17,17,17,0.08)] backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.16em] text-[#7A776F]">{label}</p>
      <p className="mt-2 font-semibold text-[#22351A]">
        {Number(payload[0].value).toFixed(2)} MAD
      </p>
    </div>
  );
}

export default function RevenueChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="vibioRevenueStroke" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#273E1C" />
            <stop offset="100%" stopColor="#6C8349" />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#ECE5DB" strokeDasharray="3 8" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) =>
            new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })
          }
          tick={{ fontSize: 11, fill: '#817D74' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#817D74' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#D9D0C2', strokeDasharray: '4 6' }} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="url(#vibioRevenueStroke)"
          strokeWidth={3}
          dot={false}
          activeDot={{
            r: 5,
            fill: '#273E1C',
            stroke: '#FCFAF7',
            strokeWidth: 2,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

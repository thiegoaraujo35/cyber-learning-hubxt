"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type WeeklyPoint = { day: string; hours: number };

export function WeeklyChart({ data }: { data: WeeklyPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="hoursFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1d2a4d" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" stroke="#8b98b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#8b98b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "#0d1630",
              border: "1px solid #1d2a4d",
              borderRadius: 12,
              color: "#e6ebf7",
            }}
            formatter={(value) => [`${value} h`, "Estudo"]}
          />
          <Area
            type="monotone"
            dataKey="hours"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#hoursFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

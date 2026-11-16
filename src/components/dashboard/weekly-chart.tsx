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
              <stop offset="0%" stopColor="#ff7a2f" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#ff4d6d" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1f2431" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" stroke="#9aa0b4" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#9aa0b4" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "#10131c",
              border: "1px solid #1f2431",
              borderRadius: 12,
              color: "#e6ebf7",
            }}
            formatter={(value) => [`${value} h`, "Estudo"]}
          />
          <Area
            type="monotone"
            dataKey="hours"
            stroke="#ff7a2f"
            strokeWidth={2}
            fill="url(#hoursFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

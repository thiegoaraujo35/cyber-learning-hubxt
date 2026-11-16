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
              <stop offset="0%" stopColor="#f4845f" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#5b7cfa" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" stroke="#9aa3c7" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#9aa3c7" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "#121a45",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              color: "#e6ebf7",
            }}
            formatter={(value) => [`${value} h`, "Estudo"]}
          />
          <Area
            type="monotone"
            dataKey="hours"
            stroke="#f4845f"
            strokeWidth={2}
            fill="url(#hoursFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

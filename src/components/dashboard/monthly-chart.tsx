"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type MonthlyPoint = { month: string; hours: number };

export function MonthlyChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#1f2431" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" stroke="#9aa0b4" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#9aa0b4" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{ background: "#10131c", border: "1px solid #1f2431", borderRadius: 12, color: "#e6ebf7" }}
            formatter={(value) => [`${value} h`, "Estudo"]}
          />
          <Bar dataKey="hours" fill="#ff7a2f" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

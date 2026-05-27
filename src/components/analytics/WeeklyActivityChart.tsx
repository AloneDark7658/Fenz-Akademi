"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

export function WeeklyActivityChart({ data = [] }: { data?: any[] }) {
  // Bütün sayılar 0 ise boş sayılır
  const hasData = data.some((d) => d.count > 0);

  return (
    <Card className="bg-white/5 border border-white/10 rounded-3xl h-full flex flex-col group hover:border-cyan-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          Haftalık Aktivite (Soru)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[250px] relative mt-4">
        {/* Dekoratif parlama arka plan */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-3xl pointer-events-none" />
        
        {!hasData ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-10">
            <Activity className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Bu hafta soru çözülmedi</p>
            <p className="text-xs opacity-70">Aktivite grafiğini başlatmak için teste başla.</p>
          </div>
        ) : null}

        <ResponsiveContainer width="100%" height="100%" className={!hasData ? "opacity-20" : ""}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="day" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(34, 211, 238, 0.3)",
                borderRadius: "16px",
                color: "#f8fafc",
                boxShadow: "0 0 20px rgba(34, 211, 238, 0.2)",
              }}
              itemStyle={{ color: "#22d3ee", fontWeight: "bold" }}
              cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="count"
              name="Çözülen Soru"
              stroke="#22d3ee"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCount)"
              activeDot={{ r: 6, strokeWidth: 0, fill: "#fff", className: "shadow-[0_0_10px_#22d3ee]" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

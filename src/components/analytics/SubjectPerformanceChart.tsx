"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";

const mockData = [
  { subject: "Mevsimler", A: 85, fullMark: 100 },
  { subject: "DNA ve Gen.", A: 92, fullMark: 100 },
  { subject: "Basınç", A: 78, fullMark: 100 },
  { subject: "Madde & End.", A: 88, fullMark: 100 },
  { subject: "Basit Mak.", A: 95, fullMark: 100 },
  { subject: "Enerji Dön.", A: 90, fullMark: 100 },
];

export function SubjectPerformanceChart({ data = mockData }: { data?: any[] }) {
  return (
    <Card className="bg-white/5 border border-white/10 rounded-3xl h-full flex flex-col group hover:border-purple-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] overflow-hidden">
      <CardHeader className="pb-0 relative z-10">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          Konu Bazlı Başarı Analizi
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] relative mt-2">
        {/* Dekoratif arka plan */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={false} 
              axisLine={false} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(168, 85, 247, 0.3)",
                borderRadius: "16px",
                color: "#f8fafc",
                boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)",
              }}
              itemStyle={{ color: "#c084fc", fontWeight: "bold" }}
            />
            <Radar
              name="Başarı (%)"
              dataKey="A"
              stroke="#a855f7"
              strokeWidth={3}
              fill="#a855f7"
              fillOpacity={0.3}
              activeDot={{ r: 6, fill: "#fff", stroke: "#a855f7", strokeWidth: 2 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

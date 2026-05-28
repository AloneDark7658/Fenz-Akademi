"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getActivePollAction } from "@/app/actions/live";
import { Users } from "lucide-react";

const OPTION_COLORS = ["#22d3ee", "#a855f7", "#f97316", "#22c55e"];
const OPTION_LABELS = ["A", "B", "C", "D"];

interface PollData {
  id: string;
  question: string;
  options: string[];
  isActive: boolean;
  isCompleted: boolean;
  totalVotes: number;
  voteCounts: number[];
}

interface LivePollResultsProps {
  sessionId: string;
  isTeacher?: boolean;
}

// Öğretmen tarafı: Supabase Realtime ile anlık güncellenen Recharts grafiği
export function LivePollResults({ sessionId, isTeacher = true }: LivePollResultsProps) {
  const [poll, setPoll] = useState<PollData | null>(null);

  const fetchPoll = async () => {
    const { poll: p } = await getActivePollAction(sessionId);
    setPoll(p);
  };

  useEffect(() => {
    fetchPoll();

    // Supabase Realtime: live_poll_votes tablosundaki INSERT'leri dinle
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`poll-votes-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_poll_votes",
        },
        () => {
          // Yeni oy geldiğinde server action'ı yeniden çağır
          fetchPoll();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "live_polls",
        },
        () => {
          fetchPoll();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  if (!poll) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-3">
        <Users className="w-10 h-10 opacity-20" />
        <p className="text-sm font-medium">Henüz aktif anket yok</p>
        <p className="text-xs opacity-70">Anket başlatın ve sonuçları burada izleyin</p>
      </div>
    );
  }

  const chartData = poll.options.map((opt, idx) => ({
    label: `${OPTION_LABELS[idx]}: ${opt}`,
    short: OPTION_LABELS[idx],
    votes: poll.voteCounts[idx] || 0,
    option: opt,
  }));

  const maxVotes = Math.max(...poll.voteCounts, 1);

  return (
    <div className="space-y-4">
      {/* Soru */}
      <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
          Aktif Soru
        </p>
        <p className="text-sm font-bold text-white leading-snug">{poll.question}</p>
      </div>

      {/* Toplam oy sayacı */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Users className="w-3.5 h-3.5" />
        <span>
          <strong className="text-cyan-400 font-bold">{poll.totalVotes}</strong> yanıt
        </span>
        {poll.isCompleted && (
          <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wide">
            Tamamlandı
          </span>
        )}
      </div>

      {/* Recharts Bar Grafiği */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="short"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              fontWeight={700}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              domain={[0, maxVotes]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15,23,42,0.95)",
                borderColor: "rgba(34,211,238,0.2)",
                borderRadius: "12px",
                color: "#f8fafc",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#22d3ee", fontWeight: "bold" }}
              formatter={(value, _name, props) => [
                `${value} oy`,
                (props?.payload as any)?.option ?? _name,
              ]}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="votes" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={400}>
              {chartData.map((_, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={OPTION_COLORS[idx % OPTION_COLORS.length]}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detaylı liste */}
      <div className="space-y-2">
        {chartData.map((item, idx) => {
          const pct =
            poll.totalVotes > 0
              ? Math.round((item.votes / poll.totalVotes) * 100)
              : 0;
          return (
            <div key={idx} className="flex items-center gap-3">
              <span
                className="text-xs font-black w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${OPTION_COLORS[idx]}20`,
                  color: OPTION_COLORS[idx],
                  border: `1px solid ${OPTION_COLORS[idx]}30`,
                }}
              >
                {item.short}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 truncate font-medium">
                    {item.option}
                  </span>
                  <span className="text-slate-400 ml-2 flex-shrink-0">
                    {item.votes} (%{pct})
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: OPTION_COLORS[idx],
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getActivePollAction, submitPollVoteAction, createPollAction, endPollAction } from "@/app/actions/live";
import { LivePollResults } from "./LivePollResults";
import { CheckCircle2, Plus, Send, StopCircle, BarChart2, Loader2 } from "lucide-react";

const OPTION_COLORS = ["#22d3ee", "#a855f7", "#f97316", "#22c55e"];
const OPTION_LABELS = ["A", "B", "C", "D"];

// ─── Öğrenci Anket Paneli ─────────────────────────────────────────────────────
interface StudentPollPanelProps {
  sessionId: string;
  studentId: string;
}

export function StudentPollPanel({ sessionId, studentId }: StudentPollPanelProps) {
  const [poll, setPoll] = useState<any>(null);
  const [voted, setVoted] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchPoll = async () => {
    const { poll: p } = await getActivePollAction(sessionId);
    setPoll(p);
    if (!p) setVoted(null); // Anket kapandıysa sıfırla
  };

  useEffect(() => {
    fetchPoll();

    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`student-poll-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_polls" },
        () => { fetchPoll(); setVoted(null); }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "live_polls" },
        () => fetchPoll()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  const handleVote = (optionIdx: number) => {
    if (voted !== null || !poll) return;
    startTransition(async () => {
      const res = await submitPollVoteAction(poll.id, optionIdx);
      if (res.success) {
        setVoted(optionIdx);
      }
    });
  };

  if (!poll || !poll.isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-sm p-4 space-y-3"
        style={{ boxShadow: "0 0 30px rgba(34,211,238,0.08)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Canlı Anket</p>
        </div>

        <p className="text-sm font-bold text-white leading-snug">{poll.question}</p>

        {voted !== null ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2 py-4"
          >
            <CheckCircle2 className="w-10 h-10 text-green-400" />
            <p className="text-sm font-bold text-white">Cevabınız Alındı!</p>
            <p className="text-xs text-slate-400">
              Seçiminiz:{" "}
              <strong style={{ color: OPTION_COLORS[voted] }}>
                {OPTION_LABELS[voted]}
              </strong>
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {(poll.options as string[]).map((option: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleVote(idx)}
                disabled={isPending}
                className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
                style={{
                  borderColor: `${OPTION_COLORS[idx]}30`,
                  background: `${OPTION_COLORS[idx]}08`,
                }}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{
                    background: `${OPTION_COLORS[idx]}20`,
                    color: OPTION_COLORS[idx],
                    border: `1px solid ${OPTION_COLORS[idx]}40`,
                  }}
                >
                  {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : OPTION_LABELS[idx]}
                </span>
                <span className="text-sm text-slate-200 font-medium">{option}</span>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Öğretmen Anket Paneli ────────────────────────────────────────────────────
interface TeacherPollPanelProps {
  sessionId: string;
}

export function TeacherPollPanel({ sessionId }: TeacherPollPanelProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [activePollId, setActivePollId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Aktif anket var mı kontrol et
  useEffect(() => {
    getActivePollAction(sessionId).then(({ poll }) => {
      if (poll) setActivePollId(poll.id);
    });
  }, [sessionId]);

  const handleCreate = () => {
    const filledOptions = options.filter((o) => o.trim());
    if (!question.trim() || filledOptions.length < 2) {
      setError("Soru ve en az 2 şık zorunludur.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await createPollAction(sessionId, question, filledOptions);
      if (res.success && res.pollId) {
        setActivePollId(res.pollId);
        setShowForm(false);
        setQuestion("");
        setOptions(["", "", "", ""]);
      } else {
        setError(res.error || "Anket oluşturulamadı.");
      }
    });
  };

  const handleEnd = () => {
    if (!activePollId) return;
    startTransition(async () => {
      await endPollAction(activePollId);
      setActivePollId(null);
    });
  };

  return (
    <div className="space-y-4">
      {/* Başlık ve Kontroller */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Canlı Anket</span>
        </div>
        <div className="flex gap-2">
          {activePollId && (
            <button
              onClick={handleEnd}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-orange-400 border border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/20 transition-colors disabled:opacity-50"
            >
              <StopCircle className="w-3.5 h-3.5" />
              Anketi Bitir
            </button>
          )}
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-400 border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Yeni Anket
          </button>
        </div>
      </div>

      {/* Anket Oluşturma Formu */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 p-3 rounded-2xl bg-slate-950/50 border border-white/5">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Soru metnini yazın..."
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{
                      background: `${OPTION_COLORS[idx]}15`,
                      color: OPTION_COLORS[idx],
                    }}
                  >
                    {OPTION_LABELS[idx]}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const next = [...options];
                      next[idx] = e.target.value;
                      setOptions(next);
                    }}
                    placeholder={`${OPTION_LABELS[idx]} şıkkı${idx > 1 ? " (opsiyonel)" : ""}`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              ))}
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                onClick={handleCreate}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isPending ? "Yayınlanıyor..." : "Anketi Başlat"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canlı Sonuçlar */}
      <LivePollResults sessionId={sessionId} isTeacher={true} />
    </div>
  );
}

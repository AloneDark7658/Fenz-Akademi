import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion, Star, Trophy, Target } from "lucide-react";

export const metadata: Metadata = { title: "Testler ve Sınavlar" };

export default async function StudentQuizzesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      quizResults: {
        orderBy: { createdAt: "desc" },
        include: {
          lesson: {
            select: {
              title: true,
              course: { select: { title: true } }
            }
          }
        }
      }
    }
  });

  if (!dbUser) redirect("/login");

  const results = dbUser.quizResults;
  
  const totalQuizzes = results.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(results.reduce((acc: number, r: any) => acc + r.score, 0) / totalQuizzes)
    : 0;
  const totalCorrect = results.reduce((acc: number, r: any) => acc + r.correctCount, 0);

  return (
    <div className="space-y-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight pb-2">
          Testler & Sınavlar
        </h1>
        <p className="text-slate-400">Çözdüğün testlerin analizlerini ve skorlarını buradan takip edebilirsin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/5 border border-white/10 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase">Çözülen Test</p>
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <FileQuestion className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <p className="text-4xl font-black text-cyan-400">{totalQuizzes}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border border-white/10 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase">Ortalama Başarı</p>
              <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <Target className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <p className="text-4xl font-black text-orange-400">%{avgScore}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border border-white/10 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase">Toplam Doğru</p>
              <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <Trophy className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <p className="text-4xl font-black text-yellow-400">{totalCorrect}</p>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
          <Star className="w-5 h-5 text-cyan-400" />
          Sonuç Geçmişi
        </h2>

        {results.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-16 text-center text-slate-500">
              <FileQuestion className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Henüz hiç test çözmedin.</p>
              <p className="text-xs mt-1 opacity-60">Videoları izledikten sonra testleri çözerek kendini dene!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {results.map((result: any) => (
              <div key={result.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/10 transition-colors">
                <div>
                  <p className="text-xs text-cyan-400 font-semibold uppercase mb-1">{result.lesson.course.title}</p>
                  <h3 className="text-white font-bold">{result.lesson.title} - Değerlendirme</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(result.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Skor</p>
                    <p className={`font-black ${result.score >= 70 ? 'text-green-400' : result.score >= 40 ? 'text-orange-400' : 'text-red-400'}`}>
                      %{Math.round(result.score)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Doğru/Yanlış</p>
                    <p className="font-semibold text-slate-200">
                      <span className="text-green-400">{result.correctCount}</span> / <span className="text-red-400">{result.wrongCount}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddQuestionForm } from "@/components/teacher/AddQuestionForm";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Layers } from "lucide-react";

export const metadata: Metadata = { title: "Soru Havuzu" };

// ─── Soru Havuzu Sayfası ──────────────────────────────────────────────────────

export default async function TeacherQuestionsPage() {
  // Mevcut dersleri ve soruları paralel getir
  const [lessons, questions] = await Promise.all([
    prisma.videoLesson.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { title: true } },
      },
    }),
    prisma.question.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        lesson: {
          select: {
            title: true,
            course: { select: { title: true } },
          },
        },
      },
    }),
  ]);

  const lessonOptions = lessons.map((l) => ({
    id: l.id,
    title: l.title,
    courseTitle: l.course.title,
  }));

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Soru Havuzu</h1>
        <p className="text-slate-400 text-sm mt-1">
          Soru ekleyin, düzenleyin ve yayınlama durumunu yönetin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Sol: Soru Ekleme Formu */}
        <Card className="bg-white/5 border-white/10 lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-edu-cyan" />
              Yeni Soru Ekle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AddQuestionForm lessons={lessonOptions} />
          </CardContent>
        </Card>

        {/* Sağ: Soru Listesi */}
        <Card className="bg-white/5 border-white/10 lg:col-span-3">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-edu-orange" />
              Soru Listesi
              <Badge className="ml-auto bg-edu-navy border border-white/10 text-slate-300 font-normal">
                {questions.length} soru
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Henüz soru eklenmemiş.</p>
                <p className="text-xs mt-1">Soldan ilk sorunuzu ekleyebilirsiniz.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                {questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
                  >
                    <span className="w-6 h-6 flex-shrink-0 rounded-lg bg-edu-navy border border-white/10 flex items-center justify-center text-slate-400 text-xs font-mono mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 line-clamp-2 leading-snug">
                        {q.content}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {q.lesson.course.title} › {q.lesson.title}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        q.status === "PUBLISHED"
                          ? "border-green-500/30 text-green-400 text-xs flex-shrink-0"
                          : "border-yellow-500/30 text-yellow-400 text-xs flex-shrink-0"
                      }
                    >
                      {q.status === "PUBLISHED" ? "Yayında" : "Taslak"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

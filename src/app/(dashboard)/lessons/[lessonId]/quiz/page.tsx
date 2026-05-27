import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { QuizInterface, ClientQuestion } from "@/components/QuizInterface";
import { ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Dersi ve ilişkili yayınlanmış soruları çek
  const lesson = await prisma.videoLesson.findUnique({
    where: { id: lessonId },
    include: {
      course: { select: { title: true } },
      questions: {
        where: { status: "PUBLISHED" },
      },
    },
  });

  if (!lesson) notFound();

  // Soruları Client'a uygun (güvenli) formata çevir
  // DİKKAT: correctAnswer burada HARİÇ tutuluyor ki hile yapılamasın.
  const clientQuestions: ClientQuestion[] = lesson.questions.map((q) => {
    // Prisma Json tipini parse etmek veya dönüştürmek
    let optionsArray: string[] = [];
    if (Array.isArray(q.options)) {
      optionsArray = q.options as string[];
    } else if (typeof q.options === "string") {
      try {
        optionsArray = JSON.parse(q.options);
      } catch {
        optionsArray = [];
      }
    }

    return {
      id: q.id,
      content: q.content,
      options: optionsArray,
    };
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0b1120] pb-12">
      {/* Arka plan parlamalar */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-edu-orange/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Üst Kısım: Geri Dönüş ve Başlık */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href={`/dashboard/lessons/${lessonId}`}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Derse Dön</span>
          </Link>
          
          <div className="text-right">
            <p className="text-xs text-edu-orange font-bold uppercase tracking-wider mb-1">
              Bölüm Testi
            </p>
            <h1 className="text-xl font-bold text-white line-clamp-1">
              {lesson.title}
            </h1>
          </div>
        </div>

        {clientQuestions.length > 0 ? (
          <QuizInterface 
            lessonId={lessonId} 
            questions={clientQuestions} 
          />
        ) : (
          <div className="glass rounded-3xl p-12 text-center border border-white/10 mt-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Soru Bulunamadı</h3>
            <p className="text-slate-400">
              Öğretmen bu ders için henüz yayınlanmış bir soru eklememiş.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LessonManagementForms } from "@/components/teacher/LessonManagementForms";
import { CourseActions } from "@/components/teacher/CourseActions";
import { LessonActions } from "@/components/teacher/LessonActions";
import {
  Video,
  BookOpen,
  Clock,
  HelpCircle,
  ChevronRight,
  Link2,
} from "lucide-react";

export const metadata: Metadata = { title: "Video Ders Yönetimi" };

// ─── Süre formatlayıcı ────────────────────────────────────────────────────────

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default async function TeacherLessonsPage() {
  // Kursları ve derslerini (soru sayısıyla birlikte) getir
  const courses = await prisma.course.findMany({
    orderBy: { gradeLevel: "asc" },
    include: {
      videoLessons: {
        orderBy: { orderIndex: "asc" },
        include: {
          _count: { select: { questions: true, progresses: true } },
        },
      },
    },
  });

  const courseOptions = courses.map((c: any) => ({
    id: c.id,
    title: c.title,
    gradeLevel: c.gradeLevel,
  }));

  const totalLessons = courses.reduce((acc: number, c: any) => acc + c.videoLessons.length, 0);
  const totalQuestions = courses.reduce(
    (acc: number, c: any) =>
      acc + c.videoLessons.reduce((a: number, l: any) => a + l._count.questions, 0),
    0
  );

  return (
    <div className="max-w-6xl space-y-8">
      {/* Başlık */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Video Ders Yönetimi</h1>
          <p className="text-slate-400 text-sm mt-1">
            Ünite ve video dersleri oluşturun. Her ders, Soru Havuzu ile otomatik ilişkilendirilir.
          </p>
        </div>
        <div className="flex gap-3 text-right flex-shrink-0">
          <div className="text-center">
            <p className="text-2xl font-black text-edu-cyan">{courses.length}</p>
            <p className="text-xs text-slate-400">Ünite</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-edu-orange">{totalLessons}</p>
            <p className="text-xs text-slate-400">Ders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-purple-400">{totalQuestions}</p>
            <p className="text-xs text-slate-400">Soru</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Sol: Formlar */}
        <Card className="bg-white/5 border-white/10 lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
              <Video className="w-4 h-4 text-edu-cyan" />
              İçerik Ekle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LessonManagementForms courses={courseOptions} />
          </CardContent>
        </Card>

        {/* Sağ: Ders Ağacı */}
        <Card className="bg-white/5 border-white/10 lg:col-span-3">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-edu-orange" />
              Kurs & Ders Ağacı
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-slate-500">
                <BookOpen className="w-12 h-12 opacity-30" />
                <p className="text-sm font-medium">Henüz içerik yok</p>
                <p className="text-xs opacity-60">Soldan ünite oluşturmaya başlayın</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1">
                {courses.map((course: any) => (
                  <div key={course.id} className="space-y-1">
                    {/* Kurs Başlığı */}
                    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-edu-cyan flex-shrink-0" />
                        <p className="text-sm font-semibold text-white truncate">
                          {course.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge
                          variant="outline"
                          className="border-white/10 text-slate-400 text-xs hidden sm:inline-flex"
                        >
                          {course.gradeLevel}. Sınıf
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            course.isPublished
                              ? "border-green-500/30 text-green-400 text-xs hidden sm:inline-flex"
                              : "border-yellow-500/30 text-yellow-400 text-xs hidden sm:inline-flex"
                          }
                        >
                          {course.isPublished ? "Yayında" : "Taslak"}
                        </Badge>
                        <CourseActions courseId={course.id} isPublished={course.isPublished} />
                      </div>
                    </div>

                    {/* Dersler */}
                    {course.videoLessons.length === 0 ? (
                      <p className="text-xs text-slate-600 pl-7 py-1">
                        Bu üniteye henüz ders eklenmedi.
                      </p>
                    ) : (
                      <div className="pl-4 space-y-1">
                        {course.videoLessons.map((lesson: any, index: number) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group"
                          >
                            <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-300 truncate">{lesson.title}</p>
                              <div className="flex items-center gap-3 mt-0.5">
                                {/* Süre */}
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(lesson.duration)}
                                </span>
                                {/* Soru sayısı */}
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <HelpCircle className="w-3 h-3" />
                                  {lesson._count.questions} soru
                                </span>
                                {/* İzleyen öğrenci */}
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  👁 {lesson._count.progresses} öğrenci
                                </span>
                              </div>
                            </div>
                            {/* Video linki varsa */}
                            {lesson.bunnyVideoId && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-edu-cyan flex-shrink-0" title={`Video ID: ${lesson.bunnyVideoId}`}>
                                <Link2 className="w-3.5 h-3.5" />
                              </div>
                            )}

                            {/* Ders İşlemleri */}
                            <LessonActions 
                              lesson={lesson} 
                              bunnyVideoId={lesson.bunnyVideoId}
                              isFirst={index === 0}
                              isLast={index === course.videoLessons.length - 1}
                              courses={courseOptions}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* İlişki Bilgilendirmesi */}
      <div className="flex items-start gap-3 bg-edu-cyan/5 border border-edu-cyan/10 rounded-2xl px-5 py-4">
        <Link2 className="w-5 h-5 text-edu-cyan mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-edu-cyan">Otomatik İlişkilendirme</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            Buraya eklenen her video ders, <strong className="text-slate-300">Soru Havuzu</strong>'nda
            seçilebilir hale gelir. Öğrenci bir soruyu yanlış yanıtladığında,{" "}
            <strong className="text-slate-300">Akıllı Sınav Özeti</strong> o sorunun
            bağlı olduğu video derse doğrudan yönlendirir.
          </p>
        </div>
      </div>
    </div>
  );
}

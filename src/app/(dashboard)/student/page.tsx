import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { VideoPlayerWithTracking } from "@/components/VideoPlayerWithTracking";
import { Flame, Star, BookOpen, Trophy } from "lucide-react";

export const metadata = {
  title: "Öğrenci Paneli | Fenz Akademi",
  description: "Öğrenci ana ekranı",
};

export default async function StudentDashboardPage() {
  // 1. Supabase Auth Kontrolü (Route Protection)
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Prisma ile kullanıcı verilerini çek
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      points: true,
      streak: true,
      classLevel: true,
      progresses: {
        include: {
          lesson: {
            include: {
              course: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 3, // En son izlenen 3 ders
      },
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  // Önerilen kursları çek (Öğrencinin sınıf seviyesine göre)
  const recommendedCourses = await prisma.course.findMany({
    where: {
      gradeLevel: dbUser.classLevel || 5,
      isPublished: true,
    },
    take: 3,
  });

  // Geliştirme/Test aşaması için örnek bir video (Gerçekte DB'den gelecek)
  const DEMO_LESSON_ID = "00000000-0000-0000-0000-000000000000"; // Test için dummy UUID
  const DEMO_VIDEO_URL =
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Karşılama */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Merhaba, <span className="text-edu-cyan">{dbUser.name.split(" ")[0]}</span>! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Öğrenmeye kaldığın yerden devam et.
          </p>
        </div>
      </section>

      {/* İstatistik Kartları */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-edu-cyan/20 bg-edu-cyan/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Toplam Puan</CardTitle>
            <Star className="h-4 w-4 text-edu-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-edu-cyan">
              {dbUser.points} XP
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Bir sonraki seviyeye {1000 - (dbUser.points % 1000)} XP kaldı
            </p>
          </CardContent>
        </Card>

        <Card className="border-edu-orange/20 bg-edu-orange/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Günlük Seri</CardTitle>
            <Flame className="h-4 w-4 text-edu-orange animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-edu-orange">
              {dbUser.streak} Gün 🔥
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Harika gidiyorsun, seriyi bozma!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sınıf Seviyesi</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dbUser.classLevel ? `${dbUser.classLevel}. Sınıf` : "Belirtilmemiş"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Başarılar</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Yakında</div>
            <p className="text-xs text-muted-foreground mt-1">
              Rozet sistemi çok yakında eklenecek.
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon: Videolar ve İlerlemeler */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Test Video Bileşeni */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Günün Öne Çıkan Dersi (Test)</h2>
            <VideoPlayerWithTracking 
              lessonId={DEMO_LESSON_ID} 
              videoUrl={DEMO_VIDEO_URL} 
            />
          </section>

          {/* Devam Eden Dersler */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Kaldığın Yerden Devam Et</h2>
            {dbUser.progresses.length > 0 ? (
              <div className="space-y-4">
                {dbUser.progresses.map((progress) => (
                  <Card key={progress.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardDescription>{progress.lesson.course.title}</CardDescription>
                      <CardTitle className="text-lg">{progress.lesson.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">İlerleme</span>
                        <span className="font-medium text-edu-cyan">
                          {Math.floor(progress.watchPercentage)}%
                        </span>
                      </div>
                      <Progress value={progress.watchPercentage} className="h-2" />
                    </CardContent>
                    <CardFooter className="bg-muted/50 py-3">
                      <Button variant="secondary" className="w-full text-edu-navy">
                        Dersi Aç →
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="bg-muted p-4 rounded-full mb-4">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Henüz başladığın bir ders yok.</p>
                  <Button variant="link" className="text-edu-cyan mt-2">
                    Kursları Keşfet
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>
        </div>

        {/* Sağ Kolon: Önerilen Kurslar */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Sana Uygun Kurslar</h2>
            <div className="space-y-4">
              {recommendedCourses.length > 0 ? (
                recommendedCourses.map((course) => (
                  <Card key={course.id} className="hover:border-edu-cyan transition-colors cursor-pointer group">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base group-hover:text-edu-cyan transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-2">
                        {course.description || `${course.gradeLevel}. sınıf müfredatına uygun konu anlatımları.`}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Şu an için sınıfınıza uygun kurs bulunmuyor.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

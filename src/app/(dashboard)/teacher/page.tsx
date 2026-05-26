import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Öğretmen Paneli",
  description: "Kurslarınızı yönetin, sorular oluşturun ve öğrenci ilerlemesini takip edin",
};

export default function TeacherDashboardPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Öğretmen Paneli 🎓
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Kurslarınızı ve öğrencilerinizi yönetin
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-sm text-[var(--muted-foreground)]">Toplam Kurs</p>
          <p className="text-3xl font-bold text-edu-navy mt-1">0</p>
        </div>
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-sm text-[var(--muted-foreground)]">Toplam Soru</p>
          <p className="text-3xl font-bold text-edu-cyan mt-1">0</p>
        </div>
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-sm text-[var(--muted-foreground)]">Aktif Öğrenci</p>
          <p className="text-3xl font-bold text-edu-orange mt-1">0</p>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yönetici Paneli",
  description: "Platform yönetimi — kullanıcılar, kurslar ve sistem ayarları",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Yönetici Paneli ⚙️
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Platform genelindeki verileri yönetin
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-sm text-[var(--muted-foreground)]">Toplam Kullanıcı</p>
          <p className="text-3xl font-bold text-edu-navy mt-1">0</p>
        </div>
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-sm text-[var(--muted-foreground)]">Toplam Kurs</p>
          <p className="text-3xl font-bold text-edu-cyan mt-1">0</p>
        </div>
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-sm text-[var(--muted-foreground)]">Çözülen Quiz</p>
          <p className="text-3xl font-bold text-edu-orange mt-1">0</p>
        </div>
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-sm text-[var(--muted-foreground)]">Sistem Durumu</p>
          <p className="text-3xl font-bold text-green-500 mt-1">✓</p>
        </div>
      </section>
    </div>
  );
}

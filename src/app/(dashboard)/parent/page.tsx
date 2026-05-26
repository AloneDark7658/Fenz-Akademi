import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Veli Paneli",
  description: "Çocuğunuzun eğitim ilerlemesini takip edin",
};

export default function ParentDashboardPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Veli Paneli 👨‍👩‍👧‍👦
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Çocuğunuzun öğrenme yolculuğunu takip edin
        </p>
      </section>

      <section className="p-6 rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] min-h-[200px] flex items-center justify-center">
        <p className="text-[var(--muted-foreground)] text-center">
          Çocuk hesabı bağlantısı ve ilerleme raporları yakında eklenecek.
        </p>
      </section>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kayıt Ol",
  description: "Fenz Akademi'ye ücretsiz kayıt olun",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-md p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-edu-navy">
            🎓 Kayıt Ol
          </h1>
          <p className="text-[var(--muted-foreground)] mt-2">
            Yeni bir hesap oluştur ve hemen başla
          </p>
        </div>

        {/* Register formu Supabase Auth entegrasyonu ile eklenecek */}
        <div className="space-y-4">
          <p className="text-center text-sm text-[var(--muted-foreground)]">
            Kayıt formu yakında aktif olacak.
          </p>
        </div>
      </div>
    </main>
  );
}

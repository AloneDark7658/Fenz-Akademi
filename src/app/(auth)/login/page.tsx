import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "Fenz Akademi hesabınıza giriş yapın",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-md p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-edu-navy">
            🚀 Fenz Akademi
          </h1>
          <p className="text-[var(--muted-foreground)] mt-2">
            Hesabına giriş yap ve öğrenmeye başla
          </p>
        </div>

        {/* Login formu Supabase Auth entegrasyonu ile eklenecek */}
        <div className="space-y-4">
          <p className="text-center text-sm text-[var(--muted-foreground)]">
            Giriş formu yakında aktif olacak.
          </p>
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export const metadata: Metadata = { title: "Sınavlar" };

export default function TeacherExamsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Sınavlar</h1>
        <p className="text-slate-400 text-sm mt-1">Soru havuzundan sınav oluşturun</p>
      </div>
      <Card className="bg-white/5 border-white/10">
        <CardContent className="py-16 flex flex-col items-center text-slate-500 gap-3">
          <ClipboardList className="w-12 h-12 opacity-30" />
          <p className="text-sm font-medium">Sınav modülü yakında geliyor</p>
          <p className="text-xs opacity-60">Soru havuzunuzu doldurmaya devam edin</p>
        </CardContent>
      </Card>
    </div>
  );
}

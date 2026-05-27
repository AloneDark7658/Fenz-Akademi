import { ParentSidebar } from "@/components/parent/ParentSidebar";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0b1120]">
      <ParentSidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

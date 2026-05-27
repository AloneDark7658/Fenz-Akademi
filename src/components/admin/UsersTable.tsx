"use client";

import { useState, useTransition } from "react";
import { Role } from "@prisma/client";
import { updateUserRole } from "@/app/actions/admin";
import { Search, ShieldAlert, CheckCircle2, User as UserIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

type UserData = {
  id: string;
  name: string;
  email: string;
  role: Role;
  points: number;
  createdAt: Date;
};

export function UsersTable({ initialUsers }: { initialUsers: UserData[] }) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [toastMsg, setToastMsg] = useState("");

  const filteredUsers = initialUsers.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = (userId: string, newRole: Role) => {
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        showToast("Rol başarıyla güncellendi!");
      } else {
        showToast(result.error || "Hata oluştu.");
      }
    });
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="İsim veya e-posta ara..." 
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-400 font-semibold bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          Toplam {filteredUsers.length} kullanıcı
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 text-slate-400 uppercase font-semibold text-xs border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Kullanıcı</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Kayıt Tarihi</th>
                <th className="px-6 py-4 text-right">Puan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    Sonuç bulunamadı
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-bold">{user.name}</span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        disabled={isPending}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                        className={`bg-slate-900 border text-xs font-bold rounded-lg px-3 py-1.5 outline-none transition-colors appearance-none cursor-pointer
                          ${user.role === "ADMIN" ? "border-red-500/50 text-red-400 focus:border-red-400" : ""}
                          ${user.role === "TEACHER" ? "border-cyan-500/50 text-cyan-400 focus:border-cyan-400" : ""}
                          ${user.role === "PARENT" ? "border-purple-500/50 text-purple-400 focus:border-purple-400" : ""}
                          ${user.role === "STUDENT" ? "border-slate-500/50 text-slate-400 focus:border-slate-400" : ""}
                        `}
                      >
                        <option value="STUDENT">ÖĞRENCİ</option>
                        <option value="TEACHER">ÖĞRETMEN</option>
                        <option value="PARENT">VELİ</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white">
                      {user.points} XP
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simple Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-800 text-white px-6 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          {toastMsg.includes("Hata") ? <ShieldAlert className="w-5 h-5 text-red-500" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />}
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

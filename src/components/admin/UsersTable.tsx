"use client";

import { useState, useTransition, useEffect } from "react";
import { type Role } from "@/types";

import { updateUserRole, adminCreateUser, adminAssignParent } from "@/app/actions/admin";
import { Search, ShieldAlert, CheckCircle2, User as UserIcon, Loader2, Plus, X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";

type UserData = {
  id: string;
  name: string;
  email: string;
  role: Role;
  points: number;
  createdAt: Date;
  parentId?: string | null;
  parent?: { name: string } | null;
};

export function UsersTable({ initialUsers }: { initialUsers: UserData[] }) {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [toastMsg, setToastMsg] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "", email: "", password: "", role: "STUDENT" as Role, classLevel: "5", parentId: ""
  });

  useEffect(() => {
    setUsers(initialUsers);
    setHasChanges(false);
  }, [initialUsers]);

  // Yeni eklendi: users veya initialUsers değiştiğinde hasChanges'ı hesapla
  useEffect(() => {
    let changed = false;
    for (const u of users) {
      const orig = initialUsers.find(x => x.id === u.id);
      if (orig && (orig.role !== u.role || orig.parentId !== u.parentId)) {
        changed = true;
        break;
      }
    }
    setHasChanges(changed);
  }, [users, initialUsers]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const parents = users.filter(u => u.role === "PARENT");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleRoleChangeLocal = (userId: string, newRole: Role) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleParentChangeLocal = (userId: string, newParentId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, parentId: newParentId } : u));
  };

  const handleSaveChanges = () => {
    startSaving(async () => {
      let hasError = false;
      for (const u of users) {
        const orig = initialUsers.find(x => x.id === u.id);
        if (!orig) continue;
        
        if (orig.role !== u.role) {
          const r = await updateUserRole(u.id, u.role);
          if (!r.success) hasError = true;
        }
        if (orig.parentId !== u.parentId) {
          const r = await adminAssignParent(u.id, u.parentId || null);
          if (!r.success) hasError = true;
        }
      }
      
      if (!hasError) {
        showToast("Tüm değişiklikler başarıyla kaydedildi!");
        setHasChanges(false);
      } else {
        showToast("Bazı değişiklikler kaydedilirken hata oluştu.");
      }
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await adminCreateUser({
        name: createFormData.name,
        email: createFormData.email,
        password: createFormData.password || undefined,
        role: createFormData.role,
        classLevel: createFormData.role === "STUDENT" ? parseInt(createFormData.classLevel) : undefined,
        parentId: createFormData.role === "STUDENT" && createFormData.parentId ? createFormData.parentId : undefined,
      });

      if (result.success) {
        showToast("Kullanıcı başarıyla oluşturuldu!");
        setIsCreateModalOpen(false);
        setCreateFormData({ name: "", email: "", password: "", role: "STUDENT", classLevel: "5", parentId: "" });
      } else {
        showToast(result.error || "Kullanıcı oluşturulurken hata oluştu.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Action Bar */}
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
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {hasChanges && (
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all whitespace-nowrap disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Değişiklikleri Kaydet
            </button>
          )}
          <div className="text-sm text-slate-400 font-semibold bg-white/5 px-4 py-2 rounded-xl border border-white/10 whitespace-nowrap">
            Toplam {filteredUsers.length} kullanıcı
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Yeni Kullanıcı
          </button>
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
                <th className="px-6 py-4">Veli (Sadece Öğrenci)</th>
                <th className="px-6 py-4">Kayıt Tarihi</th>
                <th className="px-6 py-4 text-right">Puan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
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
                        disabled={isSaving}
                        value={user.role}
                        onChange={(e) => handleRoleChangeLocal(user.id, e.target.value as Role)}
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
                    <td className="px-6 py-4">
                      {user.role === "STUDENT" ? (
                        <select
                          disabled={isSaving}
                          value={user.parentId || ""}
                          onChange={(e) => handleParentChangeLocal(user.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700/50 text-slate-400 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none transition-colors appearance-none cursor-pointer hover:border-slate-500 focus:border-cyan-500 w-full max-w-[150px]"
                        >
                          <option value="">-- Veli Seç --</option>
                          {parents.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-slate-600 text-xs italic">-</span>
                      )}
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

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">Yeni Kullanıcı Ekle</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">İsim Soyisim</label>
                <Input 
                  required
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                  className="bg-black/20 border-white/10 text-white rounded-xl"
                  placeholder="Örn: Ali Yılmaz"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">E-posta</label>
                <Input 
                  required
                  type="email"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({...createFormData, email: e.target.value})}
                  className="bg-black/20 border-white/10 text-white rounded-xl"
                  placeholder="ali@ornek.com"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Şifre (İsteğe Bağlı)</label>
                <Input 
                  type="text"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({...createFormData, password: e.target.value})}
                  className="bg-black/20 border-white/10 text-white rounded-xl"
                  placeholder="Boş bırakılırsa otomatik üretilir"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Rol</label>
                  <select
                    value={createFormData.role}
                    onChange={(e) => setCreateFormData({...createFormData, role: e.target.value as Role})}
                    className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="STUDENT">Öğrenci</option>
                    <option value="TEACHER">Öğretmen</option>
                    <option value="PARENT">Veli</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {createFormData.role === "STUDENT" && (
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Sınıf</label>
                    <select
                      value={createFormData.classLevel}
                      onChange={(e) => setCreateFormData({...createFormData, classLevel: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none focus:border-cyan-500 transition-colors"
                    >
                      <option value="5">5. Sınıf</option>
                      <option value="6">6. Sınıf</option>
                      <option value="7">7. Sınıf</option>
                      <option value="8">8. Sınıf</option>
                    </select>
                  </div>
                )}
              </div>

              {createFormData.role === "STUDENT" && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Veli (İsteğe Bağlı)</label>
                  <select
                    value={createFormData.parentId}
                    onChange={(e) => setCreateFormData({...createFormData, parentId: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="">-- Veli Seçilmedi --</option>
                    {parents.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                type="submit"
                disabled={isPending}
                className="w-full mt-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                Oluştur
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Simple Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[200] bg-slate-800 text-white px-6 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          {toastMsg.includes("Hata") ? <ShieldAlert className="w-5 h-5 text-red-500" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />}
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}


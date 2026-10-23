'use client';
import { useState, useEffect } from 'react';
import { getUsers, saveUser, deleteUser, type AppUser, type Role } from '@/lib/auth';
import { Plus, Trash2, Shield, UserCog, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<AppUser>>({ role: 'OSM' });

  useEffect(() => {
    const role = sessionStorage.getItem('staff_role');
    if (role !== 'SUPERADMIN') { router.replace('/login'); return; }
    loadUsers();
  }, [router]);

  const loadUsers = () => setUsers(getUsers());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.name) return toast.error('กรอกข้อมูลให้ครบ');
    saveUser(formData as AppUser);
    toast.success('บันทึกข้อมูลผู้ใช้สำเร็จ');
    setIsModalOpen(false);
    loadUsers();
  };

  const handleDelete = (id: string, username: string) => {
    if (username === 'admin') return toast.error('ไม่สามารถลบ Superadmin หลักได้');
    if (confirm('ยืนยันการลบผู้ใช้นี้?')) {
      deleteUser(id);
      loadUsers();
      toast.success('ลบผู้ใช้แล้ว');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="logo" width={40} height={40} />
            <h1 className="text-xl font-bold text-slate-800">จัดการระบบ (Superadmin)</h1>
          </div>
          <button onClick={() => { sessionStorage.clear(); router.push('/'); }} className="text-red-500 flex items-center gap-2 text-sm font-medium"><LogOut className="w-4 h-4"/> ออกจากระบบ</button>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-slate-700">รายชื่อผู้ใช้งานทั้งหมด</h2>
            <button onClick={() => { setFormData({ role: 'OSM' }); setIsModalOpen(true); }} className="bg-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-pink-600 transition-colors">
              <Plus className="w-4 h-4" /> เพิ่มผู้ใช้
            </button>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b">
              <tr>
                <th className="p-4 font-medium">ชื่อ-นามสกุล</th>
                <th className="p-4 font-medium">Username</th>
                <th className="p-4 font-medium">สิทธิ์ (Role)</th>
                <th className="p-4 font-medium">พื้นที่</th>
                <th className="p-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{u.name}</td>
                  <td className="p-4">{u.username}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'MUNICIPALITY' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>{u.role}</span>
                  </td>
                  <td className="p-4 text-slate-500">{u.area || '-'}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => { setFormData(u); setIsModalOpen(true); }} className="text-sky-600 hover:underline mr-3">แก้ไข</button>
                    <button onClick={() => handleDelete(u.id, u.username)} className="text-red-500 hover:underline">ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal เพิ่ม/แก้ไข User */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-slide-up">
            <h2 className="text-lg font-bold mb-4">{formData.id ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">ชื่อ-นามสกุล</label>
                <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-50 border rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Username</label>
                <input type="text" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-50 border rounded-lg" disabled={formData.username === 'admin'}/>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">รหัสผ่าน</label>
                <input type="text" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-50 border rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">สิทธิ์การใช้งาน (Role)</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})} className="w-full mt-1 p-2.5 bg-slate-50 border rounded-lg">
                  <option value="OSM">อสม. (ระดับ 1)</option>
                  <option value="MUNICIPALITY">เทศบาล (ระดับ 2)</option>
                  <option value="SUPERADMIN">Superadmin</option>
                </select>
              </div>
              {formData.role === 'OSM' && (
                <div>
                  <label className="text-sm font-medium text-slate-700">พื้นที่รับผิดชอบ</label>
                  <input type="text" value={formData.area || ''} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-50 border rounded-lg" placeholder="เช่น หมู่ 4" />
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 rounded-lg font-medium text-slate-600">ยกเลิก</button>
                <button type="submit" className="flex-1 py-2.5 bg-pink-500 text-white rounded-lg font-medium">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
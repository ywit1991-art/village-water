'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';
import { getUsers, saveUser, deleteUser, type AppUser, type Role } from '@/lib/auth';
import { checkAuth } from '@/lib/auth';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<AppUser>>({ role: 'OSM' });

  useEffect(() => {
    const auth = checkAuth(['SUPERADMIN']);
    if (!auth) { router.push('/login'); return; }
    loadUsers();
  }, [router]);

  const loadUsers = () => setUsers(getUsers());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.name) return toast.error('กรอกข้อมูลให้ครบ');
    if (formData.role === 'OSM' && !formData.area) return toast.error('กรุณาระบุหมู่บ้านที่ดูแล');
    
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
    <main className="min-h-screen bg-slate-50 pb-10">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <h1 className="text-xl font-bold text-slate-800">จัดการผู้ใช้งาน</h1>
            <button onClick={() => { setFormData({ role: 'OSM' }); setIsModalOpen(true); }} className="bg-gradient-to-r from-pink-500 to-pink-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-2">
              <Plus className="w-4 h-4" /> เพิ่มผู้ใช้
            </button>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="p-4 font-medium">ชื่อ</th>
                <th className="p-4 font-medium">Username</th>
                <th className="p-4 font-medium">สิทธิ์</th>
                <th className="p-4 font-medium">พื้นที่</th>
                <th className="p-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-slate-800">{u.name}</td>
                  <td className="p-4 text-slate-600">{u.username}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      u.role === 'SUPERADMIN' ? 'bg-pink-100 text-pink-700' :
                      u.role === 'MUNICIPALITY' ? 'bg-sky-100 text-sky-700' : 'bg-green-100 text-green-700'
                    }`}>{u.role}</span>
                  </td>
                  <td className="p-4 text-slate-600">{u.area || '-'}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(u.id, u.username)} className="text-red-500 hover:text-red-700 font-medium">ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-slide-up">
            <h2 className="text-lg font-bold mb-4 text-slate-800">{formData.id ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">ชื่อ-นามสกุล</label>
                <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Username</label>
                <input type="text" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-400" disabled={formData.username === 'admin'}/>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">รหัสผ่าน</label>
                <input type="text" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">สิทธิ์การใช้งาน</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role, area: e.target.value !== 'OSM' ? '' : formData.area})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-400">
                  <option value="OSM">อสม. (ระดับ 1)</option>
                  <option value="MUNICIPALITY">เทศบาล (ระดับ 2)</option>
                  <option value="SUPERADMIN">Superadmin</option>
                </select>
              </div>
              
              {/* 👇 เพิ่มช่องเลือกหมู่บ้านสำหรับ อสม. 👇 */}
              {formData.role === 'OSM' && (
                <div className="animate-slide-up">
                  <label className="text-sm font-medium text-pink-600">พื้นที่รับผิดชอบ (หมู่ที่)</label>
                  <select value={formData.area || ''} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full mt-1 p-3 bg-pink-50 border border-pink-200 rounded-xl outline-none focus:border-pink-400 font-medium">
                    <option value="">-- เลือกหมู่บ้าน --</option>
                    {Array.from({ length: 14 }).map((_, i) => (
                      <option key={i+1} value={`หมู่ ${i + 1}`}>หมู่ {i + 1}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-medium text-slate-600">ยกเลิก</button>
                <button type="submit" className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-bold shadow-md">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
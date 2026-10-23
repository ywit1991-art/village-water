'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { KeyRound, UserCircle, LogIn, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getUsers } from '@/lib/auth';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return toast.error('กรุณากรอกรหัสผู้ใช้');
    setIsLoading(true);

    setTimeout(() => {
      const users = getUsers();
      const user = users.find(u => u.username === username && u.password === password);

      if (!user) {
        toast.error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        setIsLoading(false);
        return;
      }

      // บันทึก Session
      sessionStorage.setItem('staff_code', user.username);
      sessionStorage.setItem('staff_role', user.role);
      sessionStorage.setItem('staff_name', user.name);
      
      toast.success(`ยินดีต้อนรับ ${user.name}`);
      
      // แยกเส้นทาง
      if (user.role === 'SUPERADMIN') router.push('/admin');
      else if (user.role === 'MUNICIPALITY') router.push('/map');
      else router.push('/person/new'); // OSM
      
    }, 800);
  };

  return (
    <main className="min-h-screen bg-gradient-soft flex flex-col items-center justify-center p-4 relative">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium bg-white/50 px-4 py-2 rounded-full backdrop-blur-md transition-colors">
        <ArrowLeft className="w-4 h-4" /> กลับหน้าแรก
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full shadow-glow border-4 border-white/80 p-2 mx-auto mb-4 flex items-center justify-center">
            <Image src="/logo.png" alt="Logo" width={64} height={64} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">เข้าสู่ระบบเจ้าหน้าที่</h1>
        </div>

        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/60">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อผู้ใช้ (Username)</label>
              <div className="relative group">
                <UserCircle className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-pink-500" />
                <input
                  type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin, MUN-001, OSM-001..."
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-50 transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">รหัสผ่าน</label>
              <div className="relative group">
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-pink-500" />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-50 transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full h-14 mt-2 rounded-xl bg-gradient-brand text-white font-bold text-lg shadow-glow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
              {isLoading ? 'กำลังตรวจสอบ...' : <><LogIn className="w-5 h-5" /> เข้าสู่ระบบ</>}
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
            <p>Superadmin: <strong>admin / 123456</strong></p>
            <p>เทศบาล: <strong>MUN-001 / 123456</strong></p>
            <p>อสม.: <strong>OSM-001 / 123456</strong></p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
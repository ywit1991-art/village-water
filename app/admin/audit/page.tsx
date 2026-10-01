import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  ClipboardList,
  User,
  Clock,
  Activity,
} from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { canViewAudit } from '@/lib/auth/permissions'
import { createAdminClient } from '@/lib/supabase/admin'

const ACTION_LABELS: Record<string, string> = {
  login: 'เข้าสู่ระบบ',
  logout: 'ออกจากระบบ',
  create_staff: 'สร้างเจ้าหน้าที่',
  update_staff: 'แก้ไขเจ้าหน้าที่',
  delete_staff: 'ลบเจ้าหน้าที่',
  create_system: 'สร้างระบบประปา',
  update_system: 'แก้ไขระบบประปา',
  delete_system: 'ลบระบบประปา',
  save_survey: 'บันทึกแบบสำรวจ',
}

const ACTION_COLORS: Record<string, string> = {
  login: 'bg-green-100 text-green-700',
  logout: 'bg-slate-100 text-slate-600',
  create_staff: 'bg-emerald-100 text-emerald-700',
  update_staff: 'bg-sky-100 text-sky-700',
  delete_staff: 'bg-red-100 text-red-700',
  create_system: 'bg-emerald-100 text-emerald-700',
  update_system: 'bg-sky-100 text-sky-700',
  delete_system: 'bg-red-100 text-red-700',
  save_survey: 'bg-brand-100 text-brand-700',
}

export default async function AuditPage() {
  const session = await getSession()
  if (!session) redirect('/admin')
  if (!canViewAudit(session)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            ไม่มีสิทธิ์เข้าถึง
          </h1>
          <Link href="/admin/dashboard" className="btn-primary mt-4">
            ← กลับหน้าเจ้าหน้าที่
          </Link>
        </div>
      </div>
    )
  }

  const sb = createAdminClient()
  const { data: logs } = await sb
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  const list = logs ?? []

  return (
    <div className="min-h-screen bg-brand-50/30">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/staff"
              className="w-10 h-10 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-bold leading-tight text-sm md:text-base">
                ประวัติการใช้งาน
              </h1>
              <p className="text-[11px] text-brand-100">
                {list.length} รายการล่าสุด
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-brand-50 flex items-center gap-2">
            <Activity size={18} className="text-brand-600" />
            <h2 className="font-bold text-brand-900">Audit Log</h2>
            <span className="text-xs text-slate-500 ml-auto">
              เก็บ 200 รายการล่าสุด
            </span>
          </div>

          {list.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <ClipboardList size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">ยังไม่มีประวัติการใช้งาน</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-brand-50 text-brand-700">
                  <tr>
                    <th className="p-3 text-left w-40">เวลา</th>
                    <th className="p-3 text-left w-32">เลข/ชื่อ</th>
                    <th className="p-3 text-left w-40">การกระทำ</th>
                    <th className="p-3 text-left">เป้าหมาย</th>
                    <th className="p-3 text-left w-32">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(log => {
                    const actionLabel =
                      ACTION_LABELS[log.action] ?? log.action
                    const actionColor =
                      ACTION_COLORS[log.action] ??
                      'bg-slate-100 text-slate-600'
                    const dt = new Date(log.created_at)
                    return (
                      <tr
                        key={log.id}
                        className="border-t border-brand-50 hover:bg-brand-50/40"
                      >
                        <td className="p-3 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock size={12} />
                            <span>
                              {dt.toLocaleDateString('th-TH', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 ml-4">
                            {dt.toLocaleTimeString('th-TH', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            <User size={12} className="text-slate-400" />
                            <span className="font-medium text-slate-700">
                              {log.staff_name ?? '–'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono ml-4">
                            {log.staff_code ?? '–'}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`badge ${actionColor}`}>
                            {actionLabel}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-slate-600">
                          {log.target_label ?? log.target_type ?? '–'}
                          {log.target_id && (
                            <span className="text-[10px] text-slate-400 ml-1 font-mono">
                              #{log.target_id}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-xs text-slate-500 font-mono">
                          {log.ip_address ?? '–'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
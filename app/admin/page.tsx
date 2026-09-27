'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { loginAction } from './actions'
import { AlertCircle } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full py-2.5"
    >
      {pending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
    </button>
  )
}

export default function AdminLogin() {
  const [state, formAction] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-50 to-white">
      <form action={formAction} className="card p-8 w-full max-w-md">
<img
  src="/logo.png"
  alt="ตราเทศบาลตำบลท่าวังทอง"
  className="w-12 h-12 rounded-xl shadow-lg shadow-brand-200 object-cover mb-4"
/>
        <h1 className="text-xl font-bold text-brand-900">เข้าสู่ระบบเจ้าหน้าที่</h1>
        <p className="text-sm text-brand-600 mb-6">
          กรอกเลข 10 หลักเพื่อเข้าใช้งาน
        </p>

        <div className="space-y-4">
          <div>
            <label className="label">เลข 10 หลัก</label>
            <input
              name="code"
              type="text"
              inputMode="numeric"
              maxLength={10}
              required
              pattern="[0-9]{10}"
              placeholder="0XXXXXXXXX"
              autoFocus
              className="input font-mono tracking-widest text-center text-lg"
            />
          </div>

          {state?.error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle size={16} />
              {state.error}
            </div>
          )}

          <SubmitButton />
        </div>

        <p className="text-xs text-center text-brand-500 mt-6">
          <a href="/" className="hover:underline">← กลับหน้าหลัก</a>
        </p>
      </form>
    </div>
  )
}
'use client'

import { useRef, useState } from 'react'
import { Upload, Trash2, Loader2, ImageIcon, X } from 'lucide-react'
import { toast } from 'sonner'
import { uploadPhoto, deletePhoto } from '@/lib/storage'

interface Props {
  label: string
  index: number
  villageId: number
  value?: string | null
  onChange: (url: string | null) => void
}

export default function PhotoUpload({
  label,
  index,
  villageId,
  value,
  onChange,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    const oldUrl = value

    // ⚡ แสดง preview ทันที (local) — ไม่ต้องรอ upload
    const localPreview = URL.createObjectURL(file)
    onChange(localPreview)

    try {
      const { url, error } = await uploadPhoto(file, villageId, index)

      if (error || !url) {
        toast.error('อัปโหลดไม่สำเร็จ: ' + (error ?? 'unknown'))
        onChange(oldUrl ?? null)
        URL.revokeObjectURL(localPreview)
        return
      }

      // ✅ แทน local preview ด้วย URL จริงจาก Supabase
      onChange(url)
      URL.revokeObjectURL(localPreview)

      // ลบรูปเก่าที่เคยมี
      if (oldUrl && oldUrl.startsWith('http')) {
        await deletePhoto(oldUrl)
      }

      toast.success('อัปโหลดสำเร็จ')
    } catch (err) {
      console.error('[PhotoUpload]', err)
      toast.error('เกิดข้อผิดพลาด')
      onChange(oldUrl ?? null)
      URL.revokeObjectURL(localPreview)
    } finally {
      setUploading(false)
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleRemove() {
    if (!value) return
    if (!confirm('ลบรูปนี้?')) return

    if (value.startsWith('http')) {
      await deletePhoto(value)
    }
    onChange(null)
    toast.success('ลบรูปแล้ว')
  }

  // ⚡ ถ้ามี preview (local) → แสดงแม้ uploading อยู่
  const showImage = !!value

  return (
    <div className="space-y-2">
      <label className="label text-xs flex items-center gap-1">
        <ImageIcon size={12} />
        {label}
      </label>

      {/* ยังไม่มีรูป + ไม่ได้ uploading */}
      {!showImage && !uploading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-36 rounded-lg border-2 border-dashed border-brand-200 bg-brand-50/40 hover:bg-brand-50 hover:border-brand-400 transition flex flex-col items-center justify-center gap-2 text-brand-600"
        >
          <Upload size={20} />
          <span className="text-xs font-medium">คลิกเพื่ออัปโหลด</span>
          <span className="text-[10px] text-brand-400">
            JPG, PNG (สูงสุด 5 MB)
          </span>
        </button>
      )}

      {/* กำลัง uploading + ยังไม่มี preview */}
      {uploading && !showImage && (
        <div className="w-full h-36 rounded-lg border-2 border-brand-200 bg-brand-50/40 flex flex-col items-center justify-center gap-2 text-brand-600">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-xs">กำลังอัปโหลด...</span>
        </div>
      )}

      {/* มีรูป (preview หรือ URL จริง) */}
      {showImage && (
        <div className="relative group">
          <img
            src={value}
            alt={label}
            className="w-full h-36 object-cover rounded-lg border border-brand-100 cursor-pointer"
            onClick={() => setPreview(true)}
          />

          {/* Loading overlay ระหว่าง upload */}
          {uploading && (
            <div className="absolute inset-0 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-white">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-xs">กำลังอัปโหลด...</span>
              </div>
            </div>
          )}

          {/* ปุ่มลบ — โชว์ตอน hover */}
          {!uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-7 h-7 rounded-md bg-white/90 backdrop-blur shadow text-red-500 hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              title="ลบรูป"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onInputChange}
        className="hidden"
      />

      {/* Fullscreen preview */}
      {preview && value && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreview(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            onClick={() => setPreview(false)}
          >
            <X size={20} />
          </button>
          <img
            src={value}
            alt={label}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
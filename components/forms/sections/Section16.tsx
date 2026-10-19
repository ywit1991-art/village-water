'use client'

import { useFormContext } from 'react-hook-form'
import { Camera, Trash2, Image as ImageIcon, Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { uploadPhoto } from '@/lib/storage' // ⭐ ตรวจสอบ Path ให้ตรงกับโปรเจกต์คุณ
import { toast } from 'sonner'

// ⭐ นำเข้า FormSection (ตรวจสอบ Path ให้ตรงกับโฟลเดอร์จริงของคุณ)
import { FormSection } from '../FormSection'

export function Section16() {
  const { watch, setValue } = useFormContext()
  const photos = watch('photos') || []
  const villageId = watch('village_id') || 'unknown'
  
  const [uploading, setUploading] = useState(false)

  // ฟังก์ชันสำหรับอัปโหลดรูปใหม่
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const toastId = toast.loading('กำลังอัปโหลดรูปภาพ...')

    try {
      const { url, error } = await uploadPhoto(file, villageId, photos.length)
      
      if (error || !url) throw new Error(error || 'อัปโหลดไม่สำเร็จ')

      setValue('photos', [...photos, url], { shouldDirty: true })
      toast.success('เพิ่มรูปภาพแล้ว', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาด', { id: toastId })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // ฟังก์ชันสำหรับลบรูป
  function handleRemovePhoto(indexToRemove: number) {
    const newPhotos = photos.filter((_: string, idx: number) => idx !== indexToRemove)
    setValue('photos', newPhotos, { shouldDirty: true })
    toast.success('ลบรูปภาพแล้ว')
  }

  return (
    // ⭐ ใช้ FormSection ครอบ เพื่อให้มีพฤติกรรมหุบ/ยืดเหมือน Section อื่น
    <FormSection number={16} title="ภาพถ่ายประกอบการตรวจสอบ">
      
      {/* แจ้งเตือน */}
      <div className="bg-sky-50 text-sky-800 p-3 rounded-lg text-sm border border-sky-100 flex items-center gap-2 mb-4">
        <ImageIcon size={18} className="shrink-0" />
        <p>แนบภาพถ่ายอย่างน้อย 6 ภาพ เพื่อใช้ประกอบการตรวจสอบ</p>
      </div>

      {/* ส่วนแสดงรูปภาพ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {photos.map((url: string, idx: number) => (
          <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
            
            {/* ปุ่มลบรูป */}
            <button
              type="button"
              onClick={() => handleRemovePhoto(idx)}
              className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition active:scale-95 opacity-100 md:opacity-0 md:group-hover:opacity-100"
              title="ลบรูปภาพนี้"
            >
              <Trash2 size={16} />
            </button>

            <div className="aspect-video relative">
              <img
                src={url}
                alt={`ภาพที่ ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                <p className="text-white text-xs font-medium">
                  ภาพที่ {idx + 1}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* ปุ่มเพิ่มรูปภาพใหม่ */}
        <label className={`
          relative flex flex-col items-center justify-center gap-2 p-8 
          border-2 border-dashed rounded-xl cursor-pointer
          transition-all duration-200 aspect-video
          ${uploading ? 'bg-slate-100 border-slate-300' : 'bg-white border-brand-300 hover:bg-brand-50 hover:border-brand-500'}
        `}>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          
          {uploading ? (
            <>
              <Loader2 size={32} className="animate-spin text-brand-500" />
              <span className="text-sm text-brand-600 font-medium">กำลังอัปโหลด...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mb-1">
                <Camera size={24} />
              </div>
              <span className="text-sm text-brand-700 font-semibold flex items-center gap-1">
                <Plus size={16} /> เพิ่มรูปภาพ
              </span>
              <span className="text-xs text-slate-400 mt-1">คลิกเพื่อเลือกไฟล์</span>
            </>
          )}
        </label>
      </div>
    </FormSection>
  )
}
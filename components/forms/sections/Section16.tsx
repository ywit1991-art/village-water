'use client'

import { useFormContext } from 'react-hook-form'
import { FormSection } from '../FormSection'
import PhotoUpload from '../photo-upload'

const PHOTO_LABELS = [
  'ภาพที่ 1 — แหล่งน้ำดิบ',
  'ภาพที่ 2 — ข้อมูลสูบน้ำ/เครื่องสูบน้ำ',
  'ภาพที่ 3 — ข้อมูลผลิต/ข้อมูลกรองน้ำ',
  'ภาพที่ 4 — ถังเก็บน้ำ/ถังสูง',
  'ภาพที่ 5 — ข้อมูลท่อ/บริเวณพื้นที่ให้บริการ',
  'ภาพที่ 6 — จุดชำรุดหรือปัญหาที่พบ',
]

export function Section16() {
  const { watch, setValue } = useFormContext()
  const photos: string[] = watch('photos') ?? []
  const villageId = watch('village_id') as number

  function updatePhoto(index: number, url: string | null) {
    const next = [...photos]
    // ensure array length
    while (next.length < PHOTO_LABELS.length) next.push('')
    next[index] = url ?? ''
    setValue('photos', next, { shouldDirty: true })
  }

  return (
    <FormSection number={16} title="ภาพถ่ายประกอบการตรวจสอบ">
      <p className="text-xs text-brand-500 mb-4">
        แนบภาพถ่ายอย่างน้อย 6 ภาพ เพื่อใช้ประกอบการตรวจสอบ
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {PHOTO_LABELS.map((label, i) => (
          <PhotoUpload
            key={i}
            label={label}
            index={i}
            villageId={villageId}
            value={photos[i] || null}
            onChange={url => updatePhoto(i, url)}
          />
        ))}
      </div>
    </FormSection>
  )
}
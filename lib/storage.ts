import { createClient } from '@/lib/supabase/client'

const BUCKET = 'survey-photos'

/**
 * อัปโหลดรูปภาพไป Supabase Storage
 * คืนค่า public URL
 */
export async function uploadPhoto(
  file: File,
  villageId: number | string,
  index: number,
): Promise<{ url: string | null; error: string | null }> {
  // ตรวจขนาด
  if (file.size > 5 * 1024 * 1024) {
    return { url: null, error: 'ไฟล์ใหญ่เกิน 5 MB' }
  }

  // ตรวจชนิด
  if (!file.type.startsWith('image/')) {
    return { url: null, error: 'ต้องเป็นไฟล์รูปภาพเท่านั้น' }
  }

  const sb = createClient()
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const timestamp = Date.now()
  const path = `village-${villageId}/${timestamp}-${index}.${ext}`

  const { error: uploadErr } = await sb.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadErr) {
    return { url: null, error: uploadErr.message }
  }

  const {
    data: { publicUrl },
  } = sb.storage.from(BUCKET).getPublicUrl(path)

  return { url: publicUrl, error: null }
}

/** ลบรูปจาก Storage */
export async function deletePhoto(url: string): Promise<boolean> {
  try {
    const urlObj = new URL(url)
    // path หลัง /survey-photos/
    const pathParts = urlObj.pathname.split(`/${BUCKET}/`)
    if (pathParts.length < 2) return false
    const path = decodeURIComponent(pathParts[1])

    const sb = createClient()
    const { error } = await sb.storage.from(BUCKET).remove([path])
    return !error
  } catch {
    return false
  }
}
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'

const BUCKET = 'survey-photos'
const SMALL_FILE_THRESHOLD = 500 * 1024 // 500 KB — ไฟล์เล็กกว่านี้ไม่ต้อง compress

export async function uploadPhoto(
  file: File,
  villageId: number | string,
  index: number,
): Promise<{ url: string | null; error: string | null }> {
  const startTotal = Date.now()
  console.log(
    `[Upload] เริ่ม: ${(file.size / 1024 / 1024).toFixed(2)} MB (${file.type})`,
  )

  // ===== ตรวจชนิดไฟล์ =====
  if (!file.type.startsWith('image/')) {
    return { url: null, error: 'ต้องเป็นไฟล์รูปภาพเท่านั้น' }
  }

  // ===== Compress (ถ้าจำเป็น) =====
  let compressed: File
  const isSmall = file.size < SMALL_FILE_THRESHOLD

  if (isSmall) {
    // ไฟล์เล็กอยู่แล้ว → ไม่ต้อง compress
    compressed = file
    console.log(
      `[Upload] Skip compress — ไฟล์เล็ก ${(file.size / 1024).toFixed(0)} KB`,
    )
  } else {
    const t0 = Date.now()
    try {
      compressed = await imageCompression(file, {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1200,
        useWebWorker: false,
        initialQuality: 0.7,
        maxIteration: 10,
      })
      console.log(
        `[Upload] Compress: ${Date.now() - t0}ms → ${(compressed.size / 1024).toFixed(0)} KB`,
      )
    } catch (err) {
      console.warn('[Upload] Compress ไม่ได้ → ใช้ไฟล์เดิม', err)
      if (file.size > 5 * 1024 * 1024) {
        return { url: null, error: 'ไฟล์ใหญ่เกิน 5 MB' }
      }
      compressed = file
    }
  }

  // ===== Upload =====
  const sb = createClient()
  const timestamp = Date.now()
  const path = `village-${villageId}/${timestamp}-${index}.jpg`

  const t1 = Date.now()
  const { error: uploadErr } = await sb.storage
    .from(BUCKET)
    .upload(path, compressed, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/jpeg',
    })
  console.log(`[Upload] Upload: ${Date.now() - t1}ms`)

  if (uploadErr) {
    console.error('[Upload] error:', uploadErr.message)
    return { url: null, error: uploadErr.message }
  }

  const {
    data: { publicUrl },
  } = sb.storage.from(BUCKET).getPublicUrl(path)

  console.log(`[Upload] เสร็จ: ${Date.now() - startTotal}ms total`)

  return { url: publicUrl, error: null }
}

export async function deletePhoto(url: string): Promise<boolean> {
  try {
    const urlObj = new URL(url)
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
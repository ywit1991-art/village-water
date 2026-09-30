import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { registerPdfFonts } from '@/lib/pdf/fonts'
import VillageReport from '@/lib/pdf/VillageReport'
import type { Village, Survey, WaterSystem } from '@/lib/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  registerPdfFonts()

  const { id } = await params
  const villageId = Number(id)
  if (!villageId) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  }

  const sb = await createClient()
  const [{ data: village }, { data: systems }, { data: surveys }] =
    await Promise.all([
      sb.from('villages').select('*').eq('id', villageId).single(),
      sb.from('water_systems').select('*').eq('village_id', villageId),
      sb.from('surveys').select('*').eq('village_id', villageId),
    ])

  if (!village) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const stream = await renderToStream(
    VillageReport({
      village: village as Village,
      systems: (systems as WaterSystem[]) ?? [],
      surveys: (surveys as Survey[]) ?? [],
    }),
  )

  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="village-${villageId}.pdf"`,
    },
  })
}
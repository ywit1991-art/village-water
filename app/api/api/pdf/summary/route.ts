import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { registerPdfFonts } from '@/lib/pdf/fonts'
import SummaryReport from '@/lib/pdf/SummaryReport'
import type { Village, Survey, WaterSystem } from '@/lib/types'

export async function GET() {
  registerPdfFonts()

  const sb = await createClient()
  const [{ data: villages }, { data: systems }, { data: surveys }] =
    await Promise.all([
      sb.from('villages').select('*').order('village_no'),
      sb.from('water_systems').select('*'),
      sb
        .from('surveys')
        .select('*')
        .in('status', ['submitted', 'approved'])
        .order('created_at', { ascending: false }),
    ])

  const vills = (villages as Village[]) ?? []
  const sys = (systems as WaterSystem[]) ?? []
  const svy = (surveys as Survey[]) ?? []

  const villageMap = new Map<number, Village>()
  vills.forEach(v => villageMap.set(v.id, v))

  const latestBySystem = new Map<number, Survey>()
  svy.forEach(s => {
    if (s.water_system_id && !latestBySystem.has(s.water_system_id)) {
      latestBySystem.set(s.water_system_id, s)
    }
  })

  const systemsWithContext = sys
    .map(s => {
      const village = villageMap.get(s.village_id)
      if (!village) return null
      return {
        system: s,
        survey: latestBySystem.get(s.id) ?? null,
        village,
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  const stream = await renderToStream(
    SummaryReport({ villages: vills, systems: systemsWithContext }),
  )

  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="summary-report.pdf"',
    },
  })
}
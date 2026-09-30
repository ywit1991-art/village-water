import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Village, WaterSystem, Survey } from '@/lib/types'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansThai',
    fontSize: 10,
    padding: 40,
    color: '#0f172a',
  },
  header: {
    paddingBottom: 12,
    borderBottom: '2pt solid #0284c7',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0369a1',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#0ea5e9',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0369a1',
    paddingBottom: 4,
    borderBottom: '1pt solid #bae6fd',
    marginTop: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottom: '0.5pt solid #f1f5f9',
  },
  label: {
    width: 140,
    color: '#64748b',
    fontSize: 9,
  },
  value: {
    flex: 1,
    fontSize: 10,
  },
  systemBlock: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#f8fafc',
    border: '1pt solid #e0f2fe',
    borderRadius: 6,
  },
  systemTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#075985',
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    paddingTop: 8,
    borderTop: '0.5pt solid #e0f2fe',
  },
})

interface Props {
  village: Village
  systems: WaterSystem[]
  surveys: Survey[]
}

function v(x: unknown, fallback = '–'): string {
  if (x === null || x === undefined || x === '') return fallback
  if (Array.isArray(x)) return x.length ? x.join(', ') : fallback
  return String(x)
}

export default function VillageReport({ village, systems, surveys }: Props) {
  const today = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // survey ล่าสุดของแต่ละระบบ
  const latestBySystem = new Map<number, Survey>()
  surveys.forEach(s => {
    if (s.water_system_id && !latestBySystem.has(s.water_system_id)) {
      latestBySystem.set(s.water_system_id, s)
    }
  })

  return (
    <Document>
      {systems.map(sys => {
        const s = latestBySystem.get(sys.id)
        const productionTypes = (s?.production_type ?? []).filter(Boolean)
        const committee = s?.committee_members ?? []
        const problems = (s?.problems ?? []).filter(Boolean)
        const improvements = (s?.improvements ?? []).filter(Boolean)

        return (
          <Page key={sys.id} size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                รายงานการตรวจสอบระบบประปาหมู่บ้าน
              </Text>
              <Text style={styles.subtitle}>
                หมู่ที่ {village.village_no} {village.village_name} · ต.
                {village.tambon} อ.{village.amphoe} จ.{village.province}
              </Text>
              <Text style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>
                ระบบที่ {sys.system_no} · {sys.system_name}
              </Text>
            </View>

            {/* 1. ข้อมูลทั่วไป */}
            <Text style={styles.sectionTitle}>1. ข้อมูลทั่วไป</Text>
            <View style={styles.row}>
              <Text style={styles.label}>ชื่อระบบ</Text>
              <Text style={styles.value}>{v(sys.system_name)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>สถานะระบบ</Text>
              <Text style={styles.value}>
                {v(s?.overall_condition ?? sys.overall_condition)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>ประเภทระบบผลิต</Text>
              <Text style={styles.value}>{v(productionTypes)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>พิกัด</Text>
              <Text style={styles.value}>
                {sys.lat && sys.lng
                  ? `${sys.lat.toFixed(5)}, ${sys.lng.toFixed(5)}`
                  : '–'}
              </Text>
            </View>

            {/* 2. ผู้ใช้น้ำ */}
            <Text style={styles.sectionTitle}>2. ผู้ใช้น้ำ</Text>
            <View style={styles.row}>
              <Text style={styles.label}>ครัวเรือน</Text>
              <Text style={styles.value}>
                {v(s?.household_count ?? sys.household_count)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>ผู้ใช้น้ำ</Text>
              <Text style={styles.value}>{v(s?.user_count)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>อัตราค่าน้ำ</Text>
              <Text style={styles.value}>
                {s?.water_rate ? `${s.water_rate} บาท/หน่วย` : '–'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>ความจุถัง</Text>
              <Text style={styles.value}>
                {v(s?.tank_capacity ?? sys.tank_capacity)} ลบ.ม.
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>น้ำดิบ</Text>
              <Text style={styles.value}>{v(s?.water_source_sufficiency)}</Text>
            </View>

            {/* 3. ช่างประปา */}
            {s?.operator_name && (
              <>
                <Text style={styles.sectionTitle}>3. ช่างประปา</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>ชื่อ-สกุล</Text>
                  <Text style={styles.value}>{s.operator_name}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>เบอร์โทรศัพท์</Text>
                  <Text style={styles.value}>{v(s.operator_phone)}</Text>
                </View>
              </>
            )}

            {/* 4. คณะกรรมการ */}
            {committee.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  4. คณะกรรมการ ({committee.length} คน)
                </Text>
                {committee.map((m, i) => (
                  <View key={i} style={styles.row}>
                    <Text style={styles.label}>{i + 1}. {m.name}</Text>
                    <Text style={styles.value}>
                      {v(m.position)}
                      {m.phone ? ` · ${m.phone}` : ''}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {/* 5. ปัญหาที่พบ */}
            {problems.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  5. ปัญหาที่พบ ({problems.length})
                </Text>
                {problems.map((p, i) => (
                  <Text key={i} style={{ fontSize: 10, marginBottom: 2 }}>
                    • {p}
                  </Text>
                ))}
              </>
            )}

            {/* 6. จุดที่ควรแก้ไข */}
            {improvements.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  6. จุดที่ควรแก้ไข ({improvements.length})
                </Text>
                {improvements.map((p, i) => (
                  <Text key={i} style={{ fontSize: 10, marginBottom: 2 }}>
                    • {p}
                  </Text>
                ))}
              </>
            )}

            {/* 7. สรุป */}
            {s?.summary && (
              <>
                <Text style={styles.sectionTitle}>7. สรุปผลการตรวจสอบ</Text>
                <Text style={{ fontSize: 10, lineHeight: 1.5 }}>
                  {s.summary}
                </Text>
              </>
            )}

            {/* Footer */}
            <Text
              style={styles.footer}
              render={({ pageNumber, totalPages }) =>
                `วันที่พิมพ์: ${today} · หน้า ${pageNumber} / ${totalPages}`
              }
              fixed
            />
          </Page>
        )
      })}
    </Document>
  )
}
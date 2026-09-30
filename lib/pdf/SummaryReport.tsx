import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Village, Survey } from '@/lib/types'
import type { SystemWithContext } from '@/app/overview/page'

const STATUS_COLORS: Record<string, string> = {
  'ดี': '#22c55e',
  'พอใช้': '#eab308',
  'ต้องปรับปรุง': '#f97316',
  'เร่งด่วน': '#ef4444',
  'ไม่มีข้อมูล': '#94a3b8',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansThai',
    fontSize: 10,
    padding: 40,
    color: '#0f172a',
  },
  // ============ ปก ============
  coverHeader: {
    paddingBottom: 20,
    borderBottom: '2pt solid #0284c7',
    marginBottom: 30,
    alignItems: 'center',
  },
  coverLogo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  coverTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#0369a1',
    marginBottom: 6,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 14,
    color: '#0ea5e9',
    marginBottom: 4,
    textAlign: 'center',
  },
  coverMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 30,
    textAlign: 'center',
  },
  // ============ หัวข้อ ============
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0369a1',
    paddingBottom: 6,
    borderBottom: '1pt solid #bae6fd',
    marginTop: 20,
    marginBottom: 12,
  },
  // ============ Stat Cards ============
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    width: '31%',
    padding: 10,
    backgroundColor: '#f0f9ff',
    border: '1pt solid #bae6fd',
    borderRadius: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#0369a1',
  },
  statLabel: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  // ============ ตาราง ============
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0f2fe',
    padding: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    fontWeight: 700,
    color: '#075985',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '0.5pt solid #e0f2fe',
    fontSize: 10,
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  colNo: { width: '10%' },
  colName: { width: '35%' },
  colSystems: { width: '15%', textAlign: 'center' },
  colHouseholds: { width: '15%', textAlign: 'right' },
  colStatus: { width: '25%' },
  // ============ Status Badge ============
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: 'white',
    fontSize: 9,
    fontWeight: 600,
  },
  // ============ สรุปผล ============
  summaryBox: {
    padding: 12,
    backgroundColor: '#f0f9ff',
    border: '1pt solid #bae6fd',
    borderRadius: 6,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    paddingTop: 10,
    borderTop: '0.5pt solid #e0f2fe',
  },
})

interface Props {
  villages: Village[]
  systems: SystemWithContext[]
}

export default function SummaryReport({ villages, systems }: Props) {
  // สถิติรวม
  const totalVillages = new Set(systems.map(s => s.system.village_id)).size
  const totalSystems = systems.length
  const totalHouseholds = systems.reduce(
    (a, s) => a + (s.survey?.household_count ?? s.system.household_count ?? 0),
    0,
  )
  const totalCapacity = systems.reduce(
    (a, s) => a + (s.survey?.tank_capacity ?? s.system.tank_capacity ?? 0),
    0,
  )
  const totalSurveys = systems.filter(s => s.survey != null).length

  const statusCount: Record<string, number> = {
    'ดี': 0,
    'พอใช้': 0,
    'ต้องปรับปรุง': 0,
    'เร่งด่วน': 0,
    'ไม่มีข้อมูล': 0,
  }
  systems.forEach(s => {
    const k =
      s.survey?.overall_condition ?? s.system.overall_condition ?? 'ไม่มีข้อมูล'
    statusCount[k] = (statusCount[k] ?? 0) + 1
  })

  // จัดกลุ่มตามหมู่บ้าน
  const villageMap = new Map<number, Village>()
  villages.forEach(v => villageMap.set(v.id, v))

  const rows = villages
    .map(v => {
      const vSystems = systems.filter(s => s.system.village_id === v.id)
      const statuses = vSystems.map(
        s => s.survey?.overall_condition ?? s.system.overall_condition ?? 'ไม่มีข้อมูล',
      )
      const households = vSystems.reduce(
        (a, s) => a + (s.survey?.household_count ?? s.system.household_count ?? 0),
        0,
      )

      // สถานะรวมที่แย่สุด
      const priority = ['เร่งด่วน', 'ต้องปรับปรุง', 'พอใช้', 'ดี', 'ไม่มีข้อมูล']
      const worst = priority.find(p => statuses.includes(p)) ?? 'ไม่มีข้อมูล'

      return {
        village: v,
        total: vSystems.length,
        households,
        worst,
        statuses,
      }
    })
    .sort((a, b) => a.village.village_no - b.village.village_no)

  const today = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Document>
      {/* ==================== หน้า 1: ปก + สรุป ==================== */}
      <Page size="A4" style={styles.page}>
        {/* ปก */}
        <View style={styles.coverHeader}>
          {/* ถ้ามีโลโก้ใส่ <Image src={...} style={styles.coverLogo} /> */}
          <Text style={styles.coverTitle}>
            รายงานสรุประบบประปาหมู่บ้าน
          </Text>
          <Text style={styles.coverSubtitle}>
            เทศบาลตำบลท่าวังทอง · อำเภอเมืองพะเยา · จังหวัดพะเยา
          </Text>
          <Text style={styles.coverMeta}>
            จัดทำโดย: กองช่าง เทศบาลตำบลท่าวังทอง{'\n'}
            ข้อมูล ณ วันที่ {today}
          </Text>
        </View>

        {/* ภาพรวม */}
        <Text style={styles.sectionTitle}>1. ภาพรวม</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalVillages}</Text>
            <Text style={styles.statLabel}>หมู่บ้าน</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalSystems}</Text>
            <Text style={styles.statLabel}>ระบบประปา</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {totalHouseholds.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>ครัวเรือน</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {totalCapacity.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>ความจุรวม (ลบ.ม.)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalSurveys}</Text>
            <Text style={styles.statLabel}>แบบสำรวจ</Text>
          </View>
        </View>

        {/* สถานะ */}
        <Text style={styles.sectionTitle}>2. สถานะระบบประปา</Text>
        <View style={styles.summaryBox}>
          {Object.entries(statusCount).map(([status, count]) => {
            const pct =
              totalSystems > 0 ? Math.round((count / totalSystems) * 100) : 0
            return (
              <View
                key={status}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 4,
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: STATUS_COLORS[status],
                    marginRight: 8,
                  }}
                />
                <Text style={{ width: 100, fontSize: 10 }}>{status}</Text>
                <Text style={{ width: 60, fontWeight: 700, fontSize: 11 }}>
                  {count} ระบบ
                </Text>
                <Text style={{ color: '#64748b', fontSize: 10 }}>({pct}%)</Text>
              </View>
            )
          })}
        </View>

        {/* Footer */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `หน้า ${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>

      {/* ==================== หน้า 2: ตารางเปรียบเทียบ ==================== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>3. ตารางเปรียบเทียบ 14 หมู่บ้าน</Text>

        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.colNo}>หมู่ที่</Text>
            <Text style={styles.colName}>หมู่บ้าน</Text>
            <Text style={styles.colSystems}>ระบบ</Text>
            <Text style={styles.colHouseholds}>ครัวเรือน</Text>
            <Text style={styles.colStatus}>สถานะโดยรวม</Text>
          </View>

          {/* Rows */}
          {rows.map((row, idx) => (
            <View
              key={row.village.id}
              style={[
                styles.tableRow,
                idx % 2 === 1 ? styles.tableRowAlt : {},
              ]}
            >
              <Text style={styles.colNo}>{row.village.village_no}</Text>
              <Text style={styles.colName}>{row.village.village_name}</Text>
              <Text style={styles.colSystems}>{row.total}</Text>
              <Text style={styles.colHouseholds}>
                {row.households.toLocaleString()}
              </Text>
              <View style={styles.colStatus}>
                <Text
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[row.worst] },
                  ]}
                >
                  {row.worst}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `หน้า ${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}
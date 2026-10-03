import { LoadingScreen } from '@/components/ui/loading-screen'

export default function Loading() {
  return (
    <LoadingScreen
      title="กำลังโหลดข้อมูลประปา"
      subtitle="ระบบกำลังเตรียมข้อมูลแผนที่และสถิติ"
    />
  )
}
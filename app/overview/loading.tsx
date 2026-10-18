import { LoadingScreen } from '@/components/ui/loading-screen'

export default function Loading() {
  return (
    <LoadingScreen
      title="กำลังโหลดข้อมูลประปา"
      subtitle="กำลังเตรียมข้อมูลแผนที่และสถิติ"
    />
  )
}
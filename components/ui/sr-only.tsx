interface Props {
  children: React.ReactNode
}

/** ข้อความสำหรับ screen reader เท่านั้น (ซ่อนด้วยตา) */
export function SrOnly({ children }: Props) {
  return (
    <span className="sr-only">{children}</span>
  )
}
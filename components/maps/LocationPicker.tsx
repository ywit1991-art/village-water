'use client'

import dynamic from 'next/dynamic'

const LocationPickerInner = dynamic(
  () => import('./location-picker-inner'),
  { ssr: false },
)

interface Props {
  value: { lat: number; lng: number } | null
  onChange: (v: { lat: number; lng: number }) => void
  height?: string
}

export default function LocationPicker(props: Props) {
  return <LocationPickerInner {...props} />
}
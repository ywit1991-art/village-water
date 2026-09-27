'use client'

import dynamic from 'next/dynamic'

const RouteMapInner = dynamic(() => import('./route-map-inner'), {
  ssr: false,
})

interface Point {
  lat: number
  lng: number
  label?: string
}

interface Props {
  from: Point
  to: Point
  height?: string
}

export default function RouteMap(props: Props) {
  return <RouteMapInner {...props} />
}
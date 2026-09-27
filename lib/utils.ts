import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return '–'
  return n.toLocaleString('th-TH')
}

export function val(x: unknown): string {
  if (x === null || x === undefined || x === '') return '–'
  if (Array.isArray(x)) return x.length ? x.join(', ') : '–'
  return String(x)
}
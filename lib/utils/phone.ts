export function isValidThaiPhone(phone: string): boolean {
  if (!phone) return false
  const digits = phone.replace(/\D/g, '')
  if (digits.length !== 10) return false
  if (!/^0/.test(digits)) return false
  const prefix2 = digits.slice(0, 2)
  const validPrefixes = ['02', '03', '04', '05', '06', '07', '08', '09']
  return validPrefixes.includes(prefix2)
}

export function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '').slice(0, 10)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
}

export function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.length !== 10) return phone
  return `${d.slice(0, 3)}-XXX-${d.slice(6, 8)}XX`
}

export const telLink = (phone: string) => `tel:${phone.replace(/\D/g, '')}`
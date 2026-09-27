'use client'

import { forwardRef, useState, useEffect } from 'react'
import { isValidThaiPhone, formatPhone } from '@/lib/utils/phone'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  value?: string
  onChange?: (raw: string) => void
  required?: boolean
  name?: string
  placeholder?: string
  disabled?: boolean
}

export const PhoneInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      value = '',
      onChange,
      required,
      name,
      placeholder = '08X-XXX-XXXX',
      disabled,
    },
    ref,
  ) => {
    const [display, setDisplay] = useState(formatPhone(value))
    const raw = display.replace(/\D/g, '')
    const touched = raw.length > 0
    const valid = isValidThaiPhone(raw)

    useEffect(() => {
      setDisplay(formatPhone(value))
    }, [value])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const r = e.target.value.replace(/\D/g, '').slice(0, 10)
      setDisplay(formatPhone(r))
      onChange?.(r)
    }

    return (
      <div className="relative">
        <input
          ref={ref}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          name={name}
          required={required}
          disabled={disabled}
          value={display}
          onChange={handleChange}
          placeholder={placeholder}
          className={clsx(
            'input pr-10 font-mono tracking-wide',
            touched && !valid && 'border-red-300 focus:border-red-500',
            touched && valid && 'border-green-300 focus:border-green-500',
          )}
        />
        {touched && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {valid ? (
              <CheckCircle2 size={18} className="text-green-500" />
            ) : (
              <AlertCircle size={18} className="text-red-500" />
            )}
          </span>
        )}
      </div>
    )
  },
)
PhoneInput.displayName = 'PhoneInput'
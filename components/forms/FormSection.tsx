'use client'

import { useFormContext } from 'react-hook-form'
import { ChevronDown } from 'lucide-react'

interface FormSectionProps {
  number: number
  title: string
  children: React.ReactNode
}

export function FormSection({ number, title, children }: FormSectionProps) {
  return (
    <details className="form-section card overflow-hidden group">
      <summary className="cursor-pointer md:cursor-default list-none flex items-center justify-between gap-3 p-5 md:p-6 transition-colors hover:bg-brand-50/30 md:hover:bg-transparent select-none">
        <h2 className="text-base md:text-lg font-bold text-brand-900 flex items-center gap-2 m-0">
          <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 text-sm flex items-center justify-center font-bold shrink-0">
            {number}
          </span>
          <span className="leading-tight">{title}</span>
        </h2>
        <ChevronDown
          size={18}
          className="text-brand-500 transition-transform group-open:rotate-180 md:hidden shrink-0"
        />
      </summary>
      <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0 border-t border-slate-100 md:border-t-0">
        <div className="pt-4 md:pt-0">{children}</div>
      </div>
    </details>
  )
}

// ========================================
// CheckboxGroup
// ========================================
interface CheckboxGroupProps {
  name: string
  options: readonly string[]
  columns?: 2 | 3 | 4
}

export function CheckboxGroup({
  name,
  options,
  columns = 3,
}: CheckboxGroupProps) {
  const { register } = useFormContext()
  const colClass =
    columns === 2
      ? 'md:grid-cols-2'
      : columns === 4
        ? 'md:grid-cols-4'
        : 'md:grid-cols-3'

  return (
    <div className={`grid grid-cols-1 ${colClass} gap-1`}>
      {options.map(opt => (
        <label
          key={opt}
          className="flex items-center gap-2 px-3 py-2 md:py-1.5 rounded-lg hover:bg-brand-50 active:bg-brand-100 cursor-pointer text-sm transition"
        >
          <input
            type="checkbox"
            value={opt}
            {...register(name)}
            className="accent-brand-500 w-4 h-4"
          />
          {opt}
        </label>
      ))}
    </div>
  )
}

// ========================================
// RadioGroup
// ========================================
interface RadioGroupProps {
  name: string
  options: readonly string[] | readonly { value: string; label: string }[]
  columns?: 2 | 3 | 4
}

export function RadioGroup({ name, options, columns = 2 }: RadioGroupProps) {
  const { watch, setValue } = useFormContext()
  const currentValue = watch(name)

  const colClass =
    columns === 3
      ? 'md:grid-cols-3'
      : columns === 4
        ? 'md:grid-cols-4'
        : 'md:grid-cols-2'

  return (
    <div className={`grid grid-cols-1 ${colClass} gap-1`}>
      {options.map(opt => {
        const v = typeof opt === 'string' ? opt : opt.value
        const label = typeof opt === 'string' ? opt : opt.label
        const isChecked = currentValue === v

        return (
          <label
            key={v}
            className={`flex items-start gap-2 px-3 py-2 md:py-1.5 rounded-lg cursor-pointer text-sm transition active:scale-[0.98] ${
              isChecked
                ? 'bg-brand-50 ring-1 ring-brand-200'
                : 'hover:bg-brand-50'
            }`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => {
                setValue(name, isChecked ? null : v, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
              className="accent-brand-500 mt-0.5 w-4 h-4"
            />
            <span>{label}</span>
          </label>
        )
      })}
    </div>
  )
}
'use client'

import { useFormContext } from 'react-hook-form'

interface FormSectionProps {
  number: number
  title: string
  children: React.ReactNode
}

export function FormSection({ number, title, children }: FormSectionProps) {
  return (
    <section className="card p-6">
      <h2 className="text-lg font-bold text-brand-900 mb-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 text-sm flex items-center justify-center font-bold">
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

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
    <div className={`grid ${colClass} gap-1`}>
      {options.map(opt => (
        <label
          key={opt}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-brand-50 cursor-pointer text-sm"
        >
          <input
            type="checkbox"
            value={opt}
            {...register(name)}
            className="accent-brand-500"
          />
          {opt}
        </label>
      ))}
    </div>
  )
}

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
    <div className={`grid ${colClass} gap-1`}>
      {options.map(opt => {
        const v = typeof opt === 'string' ? opt : opt.value
        const label = typeof opt === 'string' ? opt : opt.label
        const isChecked = currentValue === v

        return (
          <label
            key={v}
            className={`flex items-start gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-sm transition ${
              isChecked
                ? 'bg-brand-50 ring-1 ring-brand-200'
                : 'hover:bg-brand-50'
            }`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => {
                // ✅ ติ๊กซ้ำ = ยกเลิก (กด 2 ครั้งเพื่อยกเลิก)
                setValue(name, isChecked ? null : v, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
              className="accent-brand-500 mt-0.5"
            />
            <span>{label}</span>
          </label>
        )
      })}
    </div>
  )
}
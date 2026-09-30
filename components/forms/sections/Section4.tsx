'use client'

import { useFormContext } from 'react-hook-form'
import dynamic from 'next/dynamic'
import { FormSection, CheckboxGroup, RadioGroup } from '../FormSection'
import { CK } from '@/lib/constants'

const LocationPicker = dynamic(
  () => import('@/components/maps/LocationPicker'),
  { ssr: false },
)

const RouteMap = dynamic(() => import('@/components/maps/RouteMap'), {
  ssr: false,
})

export function Section4() {
  const { register, watch, setValue } = useFormContext()

  const systemLat = watch('lat') as number | undefined
  const systemLng = watch('lng') as number | undefined
  const srcLat = watch('water_source_lat') as number | undefined
  const srcLng = watch('water_source_lng') as number | undefined

  const haveSource = !!(srcLat && srcLng)
  const haveSystem = !!(systemLat && systemLng)

  return (
    <FormSection number={4} title="ข้อมูลแหล่งน้ำดิบ">
      <label className="label">ประเภทแหล่งน้ำ</label>
      <div className="mb-4">
        <CheckboxGroup name="water_source_type" options={CK.water_source_type} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="md:col-span-2">
          <label className="label">ชื่อแหล่งน้ำ</label>
          <input {...register('water_source_name')} className="input" />
        </div>
        <div>
          <label className="label">ระยะห่างจากข้อมูลผลิต (ม.)</label>
          <input
            type="number"
            step="any"
            {...register('water_source_distance', { valueAsNumber: true })}
            className="input"
          />
        </div>
      </div>

      <label className="label">พิกัดแหล่งน้ำดิบ</label>
      <LocationPicker
        value={srcLat && srcLng ? { lat: srcLat, lng: srcLng } : null}
        onChange={v => {
          setValue('water_source_lat', v.lat)
          setValue('water_source_lng', v.lng)
        }}
      />

      {haveSystem && haveSource && (
        <div className="mt-5">
          <label className="label">
            เส้นทางจากแหล่งน้ำ → ข้อมูลผลิต (OSRM)
          </label>
          <RouteMap
            from={{ lat: srcLat!, lng: srcLng!, label: 'แหล่งน้ำดิบ' }}
            to={{ lat: systemLat!, lng: systemLng!, label: 'ข้อมูลผลิตน้ำ' }}
          />
        </div>
      )}

      <label className="label mt-4">สภาพแหล่งน้ำ</label>
      <div className="mb-4">
        <CheckboxGroup name="water_source_condition" options={CK.water_source_condition} />
      </div>

      <label className="label">น้ำดิบมีเพียงพอตลอดปีหรือไม่</label>
      <div className="mb-4">
        <RadioGroup
          name="water_source_sufficiency"
          options={CK.water_source_sufficiency}
        />
      </div>

      <label className="label">รายละเอียด/ข้อสังเกต</label>
      <textarea {...register('water_source_notes')} rows={3} className="input" />
    </FormSection>
  )
}
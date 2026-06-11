import { z } from 'zod'

const timeValue = z.string().regex(/^\d{2}:\d{2}$/, 'Ange tid som HH:MM').or(z.literal(''))

export const openingHoursRowSchema = z.object({
  id: z.string().uuid(),
  weekday: z.number().min(0).max(6),
  is_open: z.boolean(),
  start_time: timeValue.nullable(),
  end_time: timeValue.nullable(),
  break_start: timeValue.nullable(),
  break_end: timeValue.nullable(),
})

export const openingHoursSchema = z.array(openingHoursRowSchema)

export type OpeningHoursFormValues = z.infer<typeof openingHoursSchema>
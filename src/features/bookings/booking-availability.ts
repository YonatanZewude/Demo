import type { OpeningHours } from '../opening-hours/opening-hours-types'
import type { Service } from '../services/service-types'
import type { BookingOccupancy } from './booking-types'
import { addMinutesToTime, formatMinutesToTime, getWeekdayFromDate, normalizeTimeString, overlaps, parseTimeToMinutes } from '../../lib/time'

export function getAvailableTimeSlots({
  date,
  openingHours,
  occupancies,
  service,
  slotInterval = 15,
}: {
  date: string
  openingHours: OpeningHours[]
  occupancies: BookingOccupancy[]
  service: Service | undefined
  slotInterval?: number
}) {
  if (!service) {
    return []
  }

  const weekday = getWeekdayFromDate(date)
  const daySettings = openingHours.find((row) => row.weekday === weekday)

  if (!daySettings?.is_open || !daySettings.start_time || !daySettings.end_time) {
    return []
  }

  const openingStart = parseTimeToMinutes(daySettings.start_time)
  const openingEnd = parseTimeToMinutes(daySettings.end_time)
  const breakStart = daySettings.break_start ? parseTimeToMinutes(daySettings.break_start) : null
  const breakEnd = daySettings.break_end ? parseTimeToMinutes(daySettings.break_end) : null
  const duration = service.duration_minutes
  const slots: { label: string; startTime: string; endTime: string }[] = []

  for (let current = openingStart; current + duration <= openingEnd; current += slotInterval) {
    const slotStart = current
    const slotEnd = current + duration
    const inBreak = breakStart !== null && breakEnd !== null && overlaps(slotStart, slotEnd, breakStart, breakEnd)
    const overlapsBooking = occupancies.some((booking) =>
      overlaps(slotStart, slotEnd, parseTimeToMinutes(normalizeTimeString(booking.start_time)), parseTimeToMinutes(normalizeTimeString(booking.end_time))),
    )

    if (!inBreak && !overlapsBooking) {
      const startTime = `${formatMinutesToTime(slotStart)}:00`
      slots.push({
        label: formatMinutesToTime(slotStart),
        startTime,
        endTime: addMinutesToTime(startTime, duration),
      })
    }
  }

  return slots
}
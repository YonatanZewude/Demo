import { addMinutes, format, parse, parseISO } from 'date-fns'

export function parseTimeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function formatMinutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export function formatTimeLabel(time: string) {
  return format(parse(time, 'HH:mm:ss', new Date()), 'HH:mm')
}

export function normalizeTimeString(time: string) {
  return time.length === 5 ? `${time}:00` : time
}

export function addMinutesToTime(time: string, durationMinutes: number) {
  const parsed = parse(normalizeTimeString(time), 'HH:mm:ss', new Date())
  return format(addMinutes(parsed, durationMinutes), 'HH:mm:ss')
}

export function getWeekdayFromDate(dateString: string) {
  return parseISO(dateString).getDay()
}

export function overlaps(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && startB < endA
}
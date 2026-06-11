import type { Service } from './service-types'

export type DisplayService = {
  id: string
  name: string
  description: string
  durationLabel: string
  priceLabel: string
}

export const showcaseServices: DisplayService[] = []

export function mapServicesToDisplay(services: Service[]): DisplayService[] {
  return services.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description ?? '',
    durationLabel: `${service.duration_minutes} min`,
    priceLabel: `${service.price} kr`,
  }))
}
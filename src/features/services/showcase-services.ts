import type { Service } from './service-types'

export type DisplayService = {
  id: string
  name: string
  description: string
  durationLabel: string
  priceLabel: string
}

export const showcaseServices: DisplayService[] = [
  {
    id: 'showcase-herrklippning',
    name: 'Herrklippning',
    description: 'Klassisk klippning med rena linjer och modern finish.',
    durationLabel: '30 min',
    priceLabel: '350 kr',
  },
  {
    id: 'showcase-damklippning',
    name: 'Damklippning',
    description: 'Personlig klippning med form, balans och mjuk rorelse.',
    durationLabel: '45 min',
    priceLabel: '550 kr',
  },
  {
    id: 'showcase-barnklippning',
    name: 'Barnklippning',
    description: 'Trygg och smidig klippning for yngre kunder.',
    durationLabel: '25 min',
    priceLabel: '299 kr',
  },
  {
    id: 'showcase-fargning',
    name: 'Fargning',
    description: 'Helhetsfarg med glans, djup och noggrann konsultation.',
    durationLabel: '90 min',
    priceLabel: 'Fran 950 kr',
  },
  {
    id: 'showcase-klippning-styling',
    name: 'Klippning + styling',
    description: 'Klippning med styling for ett fardigt och hallbart resultat.',
    durationLabel: '60 min',
    priceLabel: '650 kr',
  },
  {
    id: 'showcase-skaggtrimning',
    name: 'Skaggtrimning',
    description: 'Exakt form och rena detaljer for ett vardat uttryck.',
    durationLabel: '20 min',
    priceLabel: '250 kr',
  },
]

export function mapServicesToDisplay(services: Service[]): DisplayService[] {
  return services.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description ?? '',
    durationLabel: `${service.duration_minutes} min`,
    priceLabel: `${service.price} kr`,
  }))
}
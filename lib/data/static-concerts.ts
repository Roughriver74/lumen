import { Concert } from '@/lib/types/concert'
import { cityCoordinates } from './city-coordinates'

export function getStaticConcerts(): Concert[] {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const rawConcerts = [
    // Past concerts
    { date: new Date('2024-09-15'), city: 'Москва', venue: 'Adrenaline Stadium', type: 'Stadium Tour' },
    { date: new Date('2024-10-20'), city: 'Екатеринбург', venue: 'Телеклуб', type: 'Club Show' },
    { date: new Date('2024-11-10'), city: 'Казань', venue: 'KZ-Bar', type: 'Club Show' },
    { date: new Date('2024-12-05'), city: 'Ростов-на-Дону', venue: 'КЗ ОКЦ', type: 'Concert Hall' },
    { date: new Date('2025-01-15'), city: 'Воронеж', venue: 'Event Hall', type: 'Concert Hall' },
    { date: new Date('2025-02-20'), city: 'Красноярск', venue: 'Grand Hall Siberia', type: 'Concert Hall' },
    { date: new Date('2025-03-10'), city: 'Самара', venue: 'МТЛ Арена', type: 'Arena Show' },
    { date: new Date('2025-04-15'), city: 'Пермь', venue: 'ДК им. Солдатова', type: 'Concert Hall' },
    { date: new Date('2025-05-20'), city: 'Омск', venue: 'КДЦ Маяковский', type: 'Concert Hall' },
    { date: new Date('2025-06-10'), city: 'Уфа', venue: 'Огни Уфы', type: 'Concert Hall' },
    { date: new Date('2025-07-15'), city: 'Волгоград', venue: 'ДК Химик', type: 'Concert Hall' },
    // Future concerts
    { date: new Date('2025-09-30'), city: 'Новосибирск', venue: 'ДК железнодорожников', type: 'Concert Hall' },
    { date: new Date('2025-10-02'), city: 'Санкт-Петербург', venue: 'БКЗ «Октябрьский»', type: 'Lumen & Orchestra' },
    { date: new Date('2025-10-30'), city: 'Тула', venue: 'Концертный зал', type: 'Concert Hall' },
    { date: new Date('2025-10-31'), city: 'Рязань', venue: 'Концертный зал', type: 'Concert Hall' },
    { date: new Date('2025-11-11'), city: 'Нижний Новгород', venue: 'МТС Live Холл', type: 'Concert Hall' },
    { date: new Date('2025-11-21'), city: 'Краснодар', venue: 'Центральный концертный зал', type: 'Lumen & Orchestra' },
    { date: new Date('2025-12-09'), city: 'Челябинск', venue: 'ДК железнодорожников', type: 'Concert Hall' },
    { date: new Date('2025-12-10'), city: 'Тюмень', venue: 'ДК «Железнодорожник»', type: 'Concert Hall' },
    { date: new Date('2026-01-15'), city: 'Иркутск', venue: 'ДК Гагарина', type: 'Concert Hall' },
    { date: new Date('2026-01-20'), city: 'Хабаровск', venue: 'Платинум Арена', type: 'Arena Show' },
    { date: new Date('2026-02-10'), city: 'Владивосток', venue: 'Фетисов Арена', type: 'Arena Show' },
  ]

  return rawConcerts.map((concert, index) => ({
    id: `concert-${index + 1}`,
    ...concert,
    coords: cityCoordinates[concert.city] || [55.7558, 37.6173],
    status: (concert.date < now ? 'past' : 'future') as 'past' | 'future',
  })).sort((a, b) => a.date.getTime() - b.date.getTime())
}
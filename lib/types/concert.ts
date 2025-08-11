export interface Concert {
  id: string
  date: Date
  city: string
  venue: string
  type?: string
  coords: [number, number]
  status: 'past' | 'future'
  ticketUrl?: string
  soldOut?: boolean
}

export interface ConcertStats {
  total: number
  future: number
  past: number
  totalDistance: number
}

export type FilterType = 'all' | 'future' | 'past'
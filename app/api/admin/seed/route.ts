import { NextRequest, NextResponse } from 'next/server'
import { BlobStorage } from '@/lib/blob/storage'
import { City, Venue, Concert } from '@/lib/types/database'

// Simple auth check
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }
  
  const token = authHeader.substring(7)
  return token === adminPassword
}

// Initial seed data
const SEED_CITIES: City[] = [
  {
    id: 'city-1',
    name: 'Москва',
    coordinates: [55.7558, 37.6173],
    region: 'Центральный',
    population: 12500000,
    timezone: 'Europe/Moscow'
  },
  {
    id: 'city-2',
    name: 'Санкт-Петербург',
    coordinates: [59.9311, 30.3609],
    region: 'Северо-Западный',
    population: 5380000,
    timezone: 'Europe/Moscow'
  },
  {
    id: 'city-3',
    name: 'Екатеринбург',
    coordinates: [56.8389, 60.6057],
    region: 'Уральский',
    population: 1500000,
    timezone: 'Asia/Yekaterinburg'
  },
  {
    id: 'city-4',
    name: 'Новосибирск',
    coordinates: [54.9833, 82.8964],
    region: 'Сибирский',
    population: 1630000,
    timezone: 'Asia/Novosibirsk'
  },
  {
    id: 'city-5',
    name: 'Казань',
    coordinates: [55.7887, 49.1221],
    region: 'Приволжский',
    population: 1260000,
    timezone: 'Europe/Moscow'
  },
]

const SEED_VENUES: Venue[] = [
  {
    id: 'venue-1',
    name: 'Adrenaline Stadium',
    cityId: 'city-1',
    capacity: 15000,
    type: 'stadium',
    address: 'ул. Лубянская, 30'
  },
  {
    id: 'venue-2',
    name: 'БКЗ «Октябрьский»',
    cityId: 'city-2',
    capacity: 4000,
    type: 'hall',
    address: 'Лиговский пр., 6'
  },
  {
    id: 'venue-3',
    name: 'Телеклуб',
    cityId: 'city-3',
    capacity: 800,
    type: 'club',
    address: 'ул. 8 Марта, 8а'
  },
  {
    id: 'venue-4',
    name: 'ДК железнодорожников',
    cityId: 'city-4',
    capacity: 1200,
    type: 'hall',
    address: 'ул. Ленина, 3'
  },
  {
    id: 'venue-5',
    name: 'KZ-Bar',
    cityId: 'city-5',
    capacity: 500,
    type: 'club',
    address: 'ул. Баумана, 7'
  },
]

const SEED_CONCERTS: Concert[] = [
  {
    id: 'concert-1',
    date: '2025-09-30',
    cityId: 'city-4',
    venueId: 'venue-4',
    type: 'Concert Hall',
    status: 'upcoming',
    soldOut: false,
    price: {
      min: 1500,
      max: 3500,
      currency: 'RUB'
    }
  },
  {
    id: 'concert-2',
    date: '2025-10-02',
    cityId: 'city-2',
    venueId: 'venue-2',
    type: 'Lumen & Orchestra',
    status: 'upcoming',
    soldOut: false,
    price: {
      min: 2000,
      max: 5000,
      currency: 'RUB'
    }
  },
  {
    id: 'concert-3',
    date: '2024-09-15',
    cityId: 'city-1',
    venueId: 'venue-1',
    type: 'Stadium Tour',
    status: 'past',
    soldOut: true,
    price: {
      min: 2500,
      max: 8000,
      currency: 'RUB'
    }
  },
  {
    id: 'concert-4',
    date: '2024-10-20',
    cityId: 'city-3',
    venueId: 'venue-3',
    type: 'Club Show',
    status: 'past',
    soldOut: true,
    price: {
      min: 1000,
      max: 2000,
      currency: 'RUB'
    }
  },
  {
    id: 'concert-5',
    date: '2024-11-10',
    cityId: 'city-5',
    venueId: 'venue-5',
    type: 'Club Show',
    status: 'past',
    soldOut: false,
    price: {
      min: 800,
      max: 1500,
      currency: 'RUB'
    }
  },
]

export async function POST(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Initialize storage and seed data
    await Promise.all([
      BlobStorage.putCities(SEED_CITIES),
      BlobStorage.putVenues(SEED_VENUES),
      BlobStorage.putConcerts(SEED_CONCERTS),
    ])

    const info = await BlobStorage.getStorageInfo()

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: info
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const info = await BlobStorage.getStorageInfo()

    return NextResponse.json({
      storage: info,
      seedData: {
        cities: SEED_CITIES.length,
        venues: SEED_VENUES.length,
        concerts: SEED_CONCERTS.length,
      }
    })
  } catch (error) {
    console.error('Error getting storage info:', error)
    return NextResponse.json(
      { error: 'Failed to get storage info' },
      { status: 500 }
    )
  }
}
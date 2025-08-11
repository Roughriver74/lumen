import { NextRequest, NextResponse } from 'next/server'
import { BlobStorage } from '@/lib/blob/storage'
import { ConcertSchema } from '@/lib/types/database'

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

export async function POST(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    
    // Validate concert data
    const concert = ConcertSchema.parse(body)
    
    // Add concert to storage
    await BlobStorage.addConcert(concert)
    
    return NextResponse.json({
      success: true,
      concert,
      message: 'Concert added successfully'
    })
  } catch (error) {
    console.error('Error adding concert:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid concert data', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to add concert' },
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
    const concerts = await BlobStorage.getConcerts()
    const cities = await BlobStorage.getCities()
    const venues = await BlobStorage.getVenues()
    
    // Join data
    const concertsWithDetails = concerts.map(concert => {
      const city = cities.find(c => c.id === concert.cityId)
      const venue = venues.find(v => v.id === concert.venueId)
      
      return {
        ...concert,
        city,
        venue
      }
    })
    
    return NextResponse.json({
      concerts: concertsWithDetails,
      count: concerts.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching concerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch concerts' },
      { status: 500 }
    )
  }
}
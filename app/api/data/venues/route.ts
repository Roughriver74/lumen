import { NextResponse } from 'next/server'
import { BlobStorage } from '@/lib/blob/storage'

export const revalidate = 3600 // Cache for 1 hour

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    
    let venues = await BlobStorage.getVenues()
    
    // Filter by city if specified
    if (cityId) {
      venues = venues.filter(venue => venue.cityId === cityId)
    }
    
    return NextResponse.json({
      venues,
      count: venues.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching venues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    )
  }
}
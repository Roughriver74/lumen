import { NextResponse } from 'next/server'
import { BlobStorage } from '@/lib/blob/storage'
import { Concert as LegacyConcert } from '@/lib/types/concert'

export const revalidate = 3600 // Revalidate every hour

export async function GET() {
  try {
    // Get data from Blob Storage
    const [concerts, cities, venues] = await Promise.all([
      BlobStorage.getConcerts(),
      BlobStorage.getCities(),
      BlobStorage.getVenues(),
    ])
    
    // Join data and convert to legacy format for compatibility
    const concertsWithDetails: LegacyConcert[] = concerts
      .map(concert => {
        const city = cities.find(c => c.id === concert.cityId)
        const venue = venues.find(v => v.id === concert.venueId)
        
        if (!city || !venue) {
          console.warn(`Missing data for concert ${concert.id}`)
          return null
        }
        
        return {
          id: concert.id,
          date: new Date(concert.date),
          city: city.name,
          venue: venue.name,
          type: concert.type,
          coords: city.coordinates,
          status: concert.status === 'upcoming' ? 'future' : 'past',
          ticketUrl: concert.ticketUrl,
          soldOut: concert.soldOut,
        } as LegacyConcert
      })
      .filter((c): c is LegacyConcert => c !== null)
    
    return NextResponse.json({
      concerts: concertsWithDetails,
      source: 'blob-storage',
      count: concerts.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching concerts from Blob Storage:', error)
    
    // Fallback to empty array or static data if needed
    return NextResponse.json({
      concerts: [],
      source: 'error-fallback',
      error: 'Failed to fetch from Blob Storage',
      lastUpdated: new Date().toISOString()
    }, { status: 500 })
  }
}
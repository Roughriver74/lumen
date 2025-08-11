import { NextResponse } from 'next/server'
import { BlobStorage } from '@/lib/blob/storage'

export const revalidate = 1800 // Cache for 30 minutes

export async function GET() {
  try {
    const cities = await BlobStorage.getCities()
    
    return NextResponse.json({
      cities,
      count: cities.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}
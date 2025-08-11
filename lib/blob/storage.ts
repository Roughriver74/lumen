import { put, head, list } from '@vercel/blob'
import { City, Venue, Concert, CitiesCollectionSchema, VenuesCollectionSchema, ConcertsCollectionSchema } from '@/lib/types/database'

const BLOB_PATHS = {
  CITIES: 'data/cities.json',
  VENUES: 'data/venues.json',
  CONCERTS: 'data/concerts.json',
} as const

// Generic blob operations
export class BlobStorage {
  private static async putData<T>(path: string, data: T[]): Promise<string> {
    try {
      const { url } = await put(path, JSON.stringify(data, null, 2), {
        access: 'public',
        contentType: 'application/json',
      })
      return url
    } catch (error) {
      console.error(`Failed to put data to ${path}:`, error)
      throw new Error(`Storage operation failed: ${error}`)
    }
  }

  private static async getData<T>(path: string, schema: any): Promise<T[]> {
    try {
      // Try to get existing data
      const response = await fetch(`${process.env.BLOB_READ_WRITE_TOKEN ? 'https://blob.vercel-storage.com' : 'https://blob.vercel-storage.com'}/${path}`)
      
      if (!response.ok) {
        return [] // Return empty array if file doesn't exist
      }

      const rawData = await response.json()
      return schema.parse(rawData)
    } catch (error) {
      console.error(`Failed to get data from ${path}:`, error)
      return [] // Return empty array on error
    }
  }

  // Cities operations
  static async getCities(): Promise<City[]> {
    return this.getData(BLOB_PATHS.CITIES, CitiesCollectionSchema)
  }

  static async putCities(cities: City[]): Promise<string> {
    return this.putData(BLOB_PATHS.CITIES, cities)
  }

  static async addCity(city: City): Promise<void> {
    const cities = await this.getCities()
    const updatedCities = [...cities.filter(c => c.id !== city.id), city]
    await this.putCities(updatedCities)
  }

  // Venues operations
  static async getVenues(): Promise<Venue[]> {
    return this.getData(BLOB_PATHS.VENUES, VenuesCollectionSchema)
  }

  static async putVenues(venues: Venue[]): Promise<string> {
    return this.putData(BLOB_PATHS.VENUES, venues)
  }

  static async addVenue(venue: Venue): Promise<void> {
    const venues = await this.getVenues()
    const updatedVenues = [...venues.filter(v => v.id !== venue.id), venue]
    await this.putVenues(updatedVenues)
  }

  // Concerts operations
  static async getConcerts(): Promise<Concert[]> {
    return this.getData(BLOB_PATHS.CONCERTS, ConcertsCollectionSchema)
  }

  static async putConcerts(concerts: Concert[]): Promise<string> {
    return this.putData(BLOB_PATHS.CONCERTS, concerts)
  }

  static async addConcert(concert: Concert): Promise<void> {
    const concerts = await this.getConcerts()
    const updatedConcerts = [...concerts.filter(c => c.id !== concert.id), concert]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    await this.putConcerts(updatedConcerts)
  }

  static async updateConcert(concertId: string, updates: Partial<Concert>): Promise<void> {
    const concerts = await this.getConcerts()
    const updatedConcerts = concerts.map(c => 
      c.id === concertId ? { ...c, ...updates } : c
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    await this.putConcerts(updatedConcerts)
  }

  static async deleteConcert(concertId: string): Promise<void> {
    const concerts = await this.getConcerts()
    const updatedConcerts = concerts.filter(c => c.id !== concertId)
    await this.putConcerts(updatedConcerts)
  }

  // Utility methods
  static async initializeStorage(): Promise<void> {
    try {
      // Check if files exist, if not create empty ones
      const [cities, venues, concerts] = await Promise.all([
        this.getCities(),
        this.getVenues(),
        this.getConcerts(),
      ])

      console.log('Storage initialized:', {
        cities: cities.length,
        venues: venues.length,
        concerts: concerts.length,
      })
    } catch (error) {
      console.error('Failed to initialize storage:', error)
      throw error
    }
  }

  static async getStorageInfo(): Promise<{
    cities: number
    venues: number
    concerts: number
  }> {
    const [cities, venues, concerts] = await Promise.all([
      this.getCities(),
      this.getVenues(),
      this.getConcerts(),
    ])

    return {
      cities: cities.length,
      venues: venues.length,
      concerts: concerts.length,
    }
  }
}
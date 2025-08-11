import { Concert } from '@/lib/types/concert'
import { cityCoordinates } from './city-coordinates'
import axios from 'axios'

export async function fetchDynamicConcerts(): Promise<Concert[] | null> {
  try {
    // Multiple data sources for resilience
    const sources = [
      fetchFromYandexAfisha,
      fetchFromTicketServices,
      // Add more sources as needed
    ]

    for (const source of sources) {
      try {
        const concerts = await source()
        if (concerts && concerts.length > 0) {
          return concerts
        }
      } catch (error) {
        console.error('Source failed:', error)
        continue
      }
    }

    return null
  } catch (error) {
    console.error('Failed to fetch dynamic concerts:', error)
    return null
  }
}

async function fetchFromYandexAfisha(): Promise<Concert[] | null> {
  try {
    // Server-side fetching bypasses CORS
    const response = await axios.get('https://afisha.yandex.ru/api/events/rubric/concert', {
      params: {
        city: 'moscow',
        artist: 'lumen',
        limit: 100
      },
      headers: {
        'User-Agent': process.env.SCRAPING_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    })

    if (response.data && response.data.events) {
      return parseYandexEvents(response.data.events)
    }

    return null
  } catch (error) {
    // Try HTML scraping as fallback
    return await scrapeYandexAfisha()
  }
}

async function scrapeYandexAfisha(): Promise<Concert[] | null> {
  try {
    const response = await axios.get('https://afisha.yandex.ru/artist/lumen', {
      headers: {
        'User-Agent': process.env.SCRAPING_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    })

    const html = response.data
    const concerts: Concert[] = []
    
    // Basic HTML parsing (would be better with cheerio)
    const eventRegex = /<div[^>]*class="[^"]*event[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
    const matches = html.matchAll(eventRegex)
    
    let id = 1
    for (const match of matches) {
      const eventHtml = match[1]
      
      // Extract date
      const dateMatch = eventHtml.match(/(\d{1,2})\s+([а-я]+)\s+(\d{4})?/i)
      // Extract city
      const cityMatch = eventHtml.match(/(?:город|city)[^>]*>([^<]+)</i)
      // Extract venue
      const venueMatch = eventHtml.match(/(?:venue|площадка)[^>]*>([^<]+)</i)
      
      if (dateMatch && cityMatch) {
        const concert = parseConcertData(
          id++,
          dateMatch[0],
          cityMatch[1],
          venueMatch?.[1] || 'Концертный зал'
        )
        if (concert) concerts.push(concert)
      }
    }

    return concerts.length > 0 ? concerts : null
  } catch (error) {
    console.error('Failed to scrape Yandex Afisha:', error)
    return null
  }
}

async function fetchFromTicketServices(): Promise<Concert[] | null> {
  // Implementation for other ticket services
  // Could include: Kassir.ru, Ponominalu.ru, etc.
  return null
}

function parseYandexEvents(events: any[]): Concert[] {
  const concerts: Concert[] = []
  
  for (const event of events) {
    if (event.artist?.toLowerCase().includes('lumen')) {
      const concert = {
        id: event.id || `concert-${concerts.length + 1}`,
        date: new Date(event.datetime || event.date),
        city: event.city || event.location?.city || 'Unknown',
        venue: event.venue || event.location?.venue || 'Concert Hall',
        type: event.type || 'Concert',
        coords: cityCoordinates[event.city] || [55.7558, 37.6173],
        status: new Date(event.datetime || event.date) > new Date() ? 'future' : 'past',
        ticketUrl: event.ticketUrl,
        soldOut: event.soldOut || false
      } as Concert
      
      concerts.push(concert)
    }
  }
  
  return concerts.sort((a, b) => a.date.getTime() - b.date.getTime())
}

function parseConcertData(
  id: number,
  dateStr: string,
  city: string,
  venue: string
): Concert | null {
  try {
    const months: Record<string, number> = {
      'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3,
      'мая': 4, 'июня': 5, 'июля': 6, 'августа': 7,
      'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
    }
    
    const parts = dateStr.split(/\s+/)
    const day = parseInt(parts[0])
    const month = months[parts[1].toLowerCase()]
    const year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear()
    
    const date = new Date(year, month, day)
    const now = new Date()
    
    // If date is in the past and no year specified, assume next year
    if (date < now && !parts[2]) {
      date.setFullYear(date.getFullYear() + 1)
    }
    
    return {
      id: `concert-${id}`,
      date,
      city: city.trim(),
      venue: venue.trim(),
      coords: cityCoordinates[city.trim()] || [55.7558, 37.6173],
      status: date > now ? 'future' : 'past'
    }
  } catch (error) {
    console.error('Failed to parse concert data:', error)
    return null
  }
}
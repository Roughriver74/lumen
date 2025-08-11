'use client'

import { useEffect, useRef } from 'react'
import { Concert } from '@/lib/types/concert'
import { formatDate } from '@/lib/utils'

// Dynamic import for Leaflet to avoid SSR issues
let L: any

interface MapProps {
  concerts: Concert[]
  onMarkerClick?: (concert: Concert) => void
}

export default function Map({ concerts, onMarkerClick }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.CircleMarker[]>([])
  const polylineRef = useRef<L.Polyline | null>(null)

  useEffect(() => {
    const initializeMap = async () => {
      if (!L) {
        L = (await import('leaflet')).default
        
        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })
      }

      if (!mapRef.current && mapContainerRef.current) {
        mapRef.current = L.map(mapContainerRef.current).setView([55.7558, 49.1284], 4)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(mapRef.current)
      }

      // Clear existing markers and polyline
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
      if (polylineRef.current) {
        polylineRef.current.remove()
      }

      // Find next concert
      const now = new Date()
      const futureConcerts = concerts.filter(c => c.status === 'future')
      const nextConcert = futureConcerts[0]

      // Add markers
      concerts.forEach(concert => {
        const isNext = concert === nextConcert
        const isPast = concert.status === 'past'

        const marker = L.circleMarker(concert.coords, {
          radius: isNext ? 12 : 10,
          fillColor: isPast ? '#999' : (isNext ? '#ff6b6b' : '#4CAF50'),
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: isPast ? 0.5 : 0.8,
          className: isNext ? 'animate-pulse-slow' : ''
        }).addTo(mapRef.current!)

        const popupContent = `
          <div style="padding: 12px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #667eea; font-size: 18px; font-weight: bold;">${concert.city}</h3>
            <p style="margin: 4px 0;"><strong>📅 Дата:</strong> ${formatDate(new Date(concert.date))}</p>
            <p style="margin: 4px 0;"><strong>📍 Место:</strong> ${concert.venue}</p>
            ${concert.type ? `<p style="margin: 4px 0;"><strong>🎸 Тип:</strong> ${concert.type}</p>` : ''}
            <div style="margin-top: 12px; padding: 8px; text-align: center; color: white; border-radius: 4px; background: ${isPast ? '#999' : '#4CAF50'};">
              ${isPast ? 'Прошёл' : 'Предстоит'}
            </div>
          </div>
        `
        marker.bindPopup(popupContent)

        marker.on('click', () => {
          if (onMarkerClick) {
            onMarkerClick(concert)
          }
        })

        markersRef.current.push(marker)
      })

      // Draw route line
      if (concerts.length > 1) {
        const routeCoords = concerts.map(c => c.coords)
        polylineRef.current = L.polyline(routeCoords, {
          color: '#4CAF50',
          weight: 3,
          opacity: 0.6,
          dashArray: '10, 10'
        }).addTo(mapRef.current)
      }

      // Fit bounds
      if (markersRef.current.length > 0 && mapRef.current) {
        const group = new L.FeatureGroup(markersRef.current)
        mapRef.current.fitBounds(group.getBounds().pad(0.1))
      }
    }

    initializeMap()
  }, [concerts, onMarkerClick])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return <div ref={mapContainerRef} className="w-full h-full rounded-xl shadow-2xl border-2 border-white/20" />
}
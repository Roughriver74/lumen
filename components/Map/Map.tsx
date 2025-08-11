'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Concert } from '@/lib/types/concert'
import { formatDate } from '@/lib/utils'

interface MapProps {
  concerts: Concert[]
  onMarkerClick?: (concert: Concert) => void
}

export default function Map({ concerts, onMarkerClick }: MapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.CircleMarker[]>([])
  const polylineRef = useRef<L.Polyline | null>(null)

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([55.7558, 49.1284], 4)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
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
        <div class="p-3 min-w-[200px]">
          <h3 class="text-lg font-bold text-lumen-purple mb-2">${concert.city}</h3>
          <p class="mb-1"><strong>📅 Дата:</strong> ${formatDate(new Date(concert.date))}</p>
          <p class="mb-1"><strong>📍 Место:</strong> ${concert.venue}</p>
          ${concert.type ? `<p class="mb-1"><strong>🎸 Тип:</strong> ${concert.type}</p>` : ''}
          <div class="mt-3 p-2 text-center text-white rounded ${isPast ? 'bg-gray-500' : 'bg-green-500'}">
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
    if (markersRef.current.length > 0) {
      const group = new L.FeatureGroup(markersRef.current)
      mapRef.current.fitBounds(group.getBounds().pad(0.1))
    }
  }, [concerts, onMarkerClick])

  return <div id="map" className="w-full h-full rounded-xl shadow-2xl border-2 border-white/20" />
}
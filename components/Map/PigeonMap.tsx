'use client'

import { Map, Marker, Overlay } from 'pigeon-maps'
import { Concert } from '@/lib/types/concert'
import { useEffect, useRef, useState } from 'react'
import RouteLine from './RouteLine'

interface PigeonMapProps {
  concerts: Concert[]
  onMarkerClick?: (concert: Concert) => void
  selectedConcertId?: string
}

export default function PigeonMap({ concerts, onMarkerClick, selectedConcertId }: PigeonMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mapDimensions, setMapDimensions] = useState({ width: 600, height: 400 })
  const [mapState, setMapState] = useState<{
    center: [number, number]
    zoom: number
    width: number
    height: number
    bounds?: {
      ne: [number, number]
      sw: [number, number]
    }
  } | null>(null)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setMapDimensions({ width: Math.floor(width), height: Math.floor(height) })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  // Calculate center and zoom based on concerts
  const getMapCenter = (): [number, number] => {
    if (concerts.length === 0) return [55.7558, 49.1284]
    
    const lats = concerts.map(c => c.coords[0])
    const lngs = concerts.map(c => c.coords[1])
    
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2
    
    return [centerLat, centerLng]
  }

  // Calculate appropriate zoom level
  const getZoom = (): number => {
    if (concerts.length === 0) return 5
    if (concerts.length === 1) return 10
    
    const lats = concerts.map(c => c.coords[0])
    const lngs = concerts.map(c => c.coords[1])
    
    const latRange = Math.max(...lats) - Math.min(...lats)
    const lngRange = Math.max(...lngs) - Math.min(...lngs)
    const maxRange = Math.max(latRange, lngRange)
    
    if (maxRange > 50) return 3
    if (maxRange > 20) return 4
    if (maxRange > 10) return 5
    if (maxRange > 5) return 6
    return 8
  }

  const center = getMapCenter()
  const zoom = getZoom()

  return (
    <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
      <Map
        height={mapDimensions.height}
        width={mapDimensions.width}
        center={center}
        zoom={zoom}
        provider={(x, y, z) => 
          `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
        }
        onBoundsChanged={({ center, zoom, bounds }) => {
          setMapState({
            center,
            zoom,
            width: mapDimensions.width,
            height: mapDimensions.height,
            bounds
          })
        }}
      >
        {concerts.map((concert, index) => {
          const isNext = concerts.filter(c => c.status === 'future')[0] === concert
          const isPast = concert.status === 'past'
          const isSelected = selectedConcertId === concert.id
          
          const markerClass = `pigeon-marker-custom ${
            isSelected ? 'selected' : 
            isPast ? 'past' : 
            isNext ? 'next' : 
            'future'
          }`
          
          return (
            <Overlay
              key={concert.id}
              anchor={concert.coords}
              offset={[16, 16]}
            >
              <div
                className={markerClass}
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkerClick?.(concert)
                }}
                title={`${concert.city} - ${new Date(concert.date).toLocaleDateString('ru-RU')}`}
              >
                {index + 1}
              </div>
            </Overlay>
          )
        })}
        
        {/* Animated dashed route lines between consecutive markers */}
        {concerts.length > 1 && mapState && concerts.map((concert, index) => {
          if (index === concerts.length - 1) return null
          
          const current = concert.coords
          const next = concerts[index + 1].coords
          
          return (
            <RouteLine
              key={`route-${index}`}
              from={current}
              to={next}
              mapState={mapState}
            />
          )
        })}
      </Map>
    </div>
  )
}
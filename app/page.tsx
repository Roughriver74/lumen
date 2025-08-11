'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/Header/Header'
import Controls from '@/components/Controls/Controls'
import ConcertList from '@/components/ConcertList/ConcertList'
import Stats from '@/components/Stats/Stats'
import { Concert, FilterType } from '@/lib/types/concert'
import { getStaticConcerts } from '@/lib/data/static-concerts'

// Dynamic import for Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/Map/Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-800 animate-pulse rounded-xl" />
})

export default function Home() {
  const [concerts, setConcerts] = useState<Concert[]>(getStaticConcerts())
  const [filteredConcerts, setFilteredConcerts] = useState<Concert[]>(concerts)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedConcertId, setSelectedConcertId] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [dataSource, setDataSource] = useState<string>('static')

  useEffect(() => {
    // Fetch concerts on mount
    fetchConcerts()
  }, [])

  useEffect(() => {
    // Apply filter
    const filtered = filter === 'all' 
      ? concerts
      : concerts.filter(c => c.status === filter)
    setFilteredConcerts(filtered)
  }, [concerts, filter])

  const fetchConcerts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/concerts')
      const data = await response.json()
      
      if (data.concerts && data.concerts.length > 0) {
        // Parse dates
        const parsedConcerts = data.concerts.map((c: any) => ({
          ...c,
          date: new Date(c.date)
        }))
        setConcerts(parsedConcerts)
        setDataSource(data.source)
      }
    } catch (error) {
      console.error('Failed to fetch concerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConcertClick = (concert: Concert) => {
    setSelectedConcertId(concert.id)
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <Controls
        currentFilter={filter}
        onFilterChange={setFilter}
        onRefresh={fetchConcerts}
        isLoading={isLoading}
      />

      {dataSource !== 'static' && dataSource !== 'error-fallback' && (
        <div className="mx-3 sm:mx-6 mt-1 sm:mt-2 p-2 sm:p-3 text-white text-center rounded-lg glass-dark text-sm sm:text-base">
          ✅ Данные загружены из {dataSource === 'blob-storage' ? 'базы данных' : 'кеша'}
        </div>
      )}

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Map Section */}
          <div className="xl:col-span-2 order-1">
            <div className="glass-card p-3 sm:p-4">
              <div className="h-[300px] sm:h-[400px] xl:h-[500px] relative">
                <Map 
                  concerts={filteredConcerts}
                  onMarkerClick={handleConcertClick}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 order-2 space-y-4 sm:space-y-6">
            <ConcertList
              concerts={filteredConcerts}
              selectedConcertId={selectedConcertId}
              onConcertClick={handleConcertClick}
            />
            <Stats concerts={filteredConcerts} />
          </div>
        </div>
      </main>

      {/* Legend */}
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 glass-card p-3 sm:p-4 max-w-xs z-10 hidden sm:block">
        <h4 className="font-bold mb-3 text-gray-800 text-sm sm:text-base">🗺️ Легенда</h4>
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-700">Будущий концерт</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-400"></div>
            <span className="text-gray-700">Прошедший концерт</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500 pulse-glow"></div>
            <span className="text-gray-700">Ближайший концерт</span>
          </div>
        </div>
      </div>
    </div>
  )
}
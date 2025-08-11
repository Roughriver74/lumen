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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <Header />
      
      <Controls
        currentFilter={filter}
        onFilterChange={setFilter}
        onRefresh={fetchConcerts}
        isLoading={isLoading}
      />

      {dataSource !== 'static' && (
        <div className="mx-4 mt-2 p-2 bg-green-500/20 border border-green-500 text-white text-center rounded-lg">
          ✅ Данные обновлены из {dataSource === 'dynamic' ? 'актуальных источников' : 'кеша'}
        </div>
      )}

      <main className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
        <div className="flex-1 lg:flex-[2] h-[400px] lg:h-[600px]">
          <Map 
            concerts={filteredConcerts}
            onMarkerClick={handleConcertClick}
          />
        </div>

        <aside className="flex-1 lg:flex-[1]">
          <ConcertList
            concerts={filteredConcerts}
            selectedConcertId={selectedConcertId}
            onConcertClick={handleConcertClick}
          />
          <Stats concerts={filteredConcerts} />
        </aside>
      </main>

      <div className="fixed bottom-6 left-6 bg-white/95 p-4 rounded-lg shadow-xl max-w-xs">
        <h4 className="font-bold text-gray-800 mb-2">Легенда</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            <span>Будущий концерт</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-500 rounded-full"></div>
            <span>Прошедший концерт</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-lumen-orange rounded-full animate-pulse"></div>
            <span>Ближайший концерт</span>
          </div>
        </div>
      </div>
    </div>
  )
}
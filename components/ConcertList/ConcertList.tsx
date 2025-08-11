'use client'

import { Concert } from '@/lib/types/concert'
import { formatDate, cn } from '@/lib/utils'

interface ConcertListProps {
  concerts: Concert[]
  selectedConcertId?: string
  onConcertClick?: (concert: Concert) => void
}

export default function ConcertList({ concerts, selectedConcertId, onConcertClick }: ConcertListProps) {
  return (
    <div className="glass-card p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 pb-2 sm:pb-3 text-gray-800 border-b-4 border-purple-500">
        📅 Все концерты
      </h2>
      <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[500px] overflow-y-auto pr-1 sm:pr-2">
        {concerts.map(concert => (
          <div
            key={concert.id}
            onClick={() => onConcertClick?.(concert)}
            className={cn(
              "relative p-3 sm:p-4 rounded-lg cursor-pointer smooth-transition border-l-4 hover:translate-x-1 hover:shadow-lg",
              concert.status === 'past' 
                ? "opacity-60 border-l-gray-400 bg-gray-50/50"
                : selectedConcertId === concert.id
                  ? "border-l-red-500 bg-purple-100/80 shadow-md"
                  : "border-l-green-500 bg-blue-50/50 hover:bg-blue-100/60"
            )}
          >
            <span 
              className={cn(
                "absolute top-2 sm:top-3 right-2 sm:right-3 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-white font-medium",
                concert.status === 'past' ? "bg-gray-400" : "bg-green-500"
              )}
            >
              {concert.status === 'past' ? 'Прошёл' : 'Предстоит'}
            </span>
            <div className="text-base sm:text-lg font-bold mb-1 text-purple-600 pr-16 sm:pr-20">
              {formatDate(new Date(concert.date))}
            </div>
            <div className="text-sm sm:text-base font-semibold mb-1 text-gray-800">
              {concert.city}
            </div>
            <div className="text-xs sm:text-sm italic text-gray-600">
              {concert.venue}
            </div>
            {concert.type && (
              <div className="text-xs sm:text-sm mt-1 sm:mt-2 font-medium text-red-500">
                {concert.type}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
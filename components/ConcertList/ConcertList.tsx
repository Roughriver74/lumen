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
    <div className="bg-white/95 rounded-xl p-6 shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-4 border-lumen-purple">
        📅 Все концерты
      </h2>
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {concerts.map(concert => (
          <div
            key={concert.id}
            onClick={() => onConcertClick?.(concert)}
            className={cn(
              'relative p-4 rounded-lg cursor-pointer transition-all duration-300',
              'border-l-4 hover:translate-x-1 hover:shadow-lg',
              concert.status === 'past' 
                ? 'opacity-60 border-gray-400 bg-gradient-to-r from-gray-50 to-gray-100'
                : 'border-green-500 bg-gradient-to-r from-lumen-purple/10 to-lumen-pink/10',
              selectedConcertId === concert.id && 'bg-gradient-to-r from-lumen-purple/30 to-lumen-pink/30 border-lumen-orange'
            )}
          >
            <span className={cn(
              'absolute top-3 right-3 text-xs px-2 py-1 rounded-full text-white',
              concert.status === 'past' ? 'bg-gray-500' : 'bg-green-500'
            )}>
              {concert.status === 'past' ? 'Прошёл' : 'Предстоит'}
            </span>
            <div className="text-lg font-bold text-lumen-purple mb-1">
              {formatDate(new Date(concert.date))}
            </div>
            <div className="text-base font-semibold text-gray-800 mb-1">
              {concert.city}
            </div>
            <div className="text-sm text-gray-600 italic">
              {concert.venue}
            </div>
            {concert.type && (
              <div className="text-sm text-lumen-orange mt-2 font-medium">
                {concert.type}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
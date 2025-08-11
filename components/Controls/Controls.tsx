'use client'

import { FilterType } from '@/lib/types/concert'
import { cn } from '@/lib/utils'

interface ControlsProps {
  currentFilter: FilterType
  onFilterChange: (filter: FilterType) => void
  onRefresh?: () => void
  isLoading?: boolean
}

export default function Controls({ 
  currentFilter, 
  onFilterChange, 
  onRefresh,
  isLoading 
}: ControlsProps) {
  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Все концерты' },
    { value: 'future', label: 'Будущие' },
    { value: 'past', label: 'Прошедшие' },
  ]

  return (
    <div className="bg-black/70 backdrop-blur-md p-4">
      <div className="flex flex-wrap justify-center gap-4">
        {filters.map(filter => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              'px-5 py-2 rounded-full text-white font-medium transition-all duration-300',
              'shadow-lg hover:-translate-y-0.5 hover:shadow-xl',
              currentFilter === filter.value
                ? 'bg-gradient-to-r from-lumen-orange to-orange-500'
                : 'bg-gradient-to-r from-lumen-purple to-lumen-pink'
            )}
          >
            {filter.label}
          </button>
        ))}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-5 py-2 rounded-full text-white font-medium transition-all duration-300
                     bg-gradient-to-r from-green-500 to-green-600
                     shadow-lg hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
          >
            {isLoading ? '⏳ Загрузка...' : '🔄 Обновить данные'}
          </button>
        )}
      </div>
      {isLoading && (
        <div className="text-center text-white mt-3 text-sm">
          Загрузка актуальных данных...
        </div>
      )}
    </div>
  )
}
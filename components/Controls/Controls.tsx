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
    <div className="glass-dark p-3 sm:p-4 mx-3 sm:mx-6 mt-3 sm:mt-4 rounded-xl">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
        {filters.map(filter => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              "btn-primary smooth-transition text-sm sm:text-base px-3 sm:px-5 py-1.5 sm:py-2",
              currentFilter === filter.value && "active"
            )}
          >
            {filter.label}
          </button>
        ))}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={cn(
              "btn-primary btn-success smooth-transition text-sm sm:text-base px-3 sm:px-5 py-1.5 sm:py-2",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isLoading ? '⏳ Загрузка...' : '🔄 Обновить'}
          </button>
        )}
      </div>
      {isLoading && (
        <div className="text-center text-white mt-2 sm:mt-3 text-xs sm:text-sm animate-pulse">
          Загрузка актуальных данных...
        </div>
      )}
    </div>
  )
}
import { Concert, ConcertStats } from '@/lib/types/concert'
import { calculateDistance } from '@/lib/utils'

interface StatsProps {
  concerts: Concert[]
}

export default function Stats({ concerts }: StatsProps) {
  const stats = calculateStats(concerts)

  return (
    <div className="bg-white/90 rounded-xl p-4 mt-6 shadow-lg">
      <h3 className="text-lg font-bold text-lumen-purple mb-4 text-center">
        📊 Статистика тура
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <StatItem value={stats.total} label="Всего концертов" />
        <StatItem value={stats.future} label="Предстоит" />
        <StatItem value={stats.past} label="Прошло" />
        <StatItem value={`${stats.totalDistance}`} label="км пути" />
      </div>
    </div>
  )
}

function StatItem({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-gradient-to-r from-lumen-purple/10 to-lumen-pink/10 p-3 rounded-lg text-center">
      <div className="text-2xl font-bold text-lumen-purple">{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  )
}

function calculateStats(concerts: Concert[]): ConcertStats {
  const now = new Date()
  const pastConcerts = concerts.filter(c => c.status === 'past')
  const futureConcerts = concerts.filter(c => c.status === 'future')

  let totalDistance = 0
  for (let i = 0; i < concerts.length - 1; i++) {
    const dist = calculateDistance(
      concerts[i].coords[0],
      concerts[i].coords[1],
      concerts[i + 1].coords[0],
      concerts[i + 1].coords[1]
    )
    totalDistance += dist
  }

  return {
    total: concerts.length,
    future: futureConcerts.length,
    past: pastConcerts.length,
    totalDistance: Math.round(totalDistance)
  }
}
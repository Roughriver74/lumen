'use client'

import { useState, useEffect } from 'react'
import { ConcertWithDetails, Concert, City, Venue } from '@/lib/types/database'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [concerts, setConcerts] = useState<ConcertWithDetails[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  const [newConcert, setNewConcert] = useState<Partial<Concert>>({
    date: '',
    cityId: '',
    venueId: '',
    type: '',
    status: 'upcoming',
    soldOut: false,
  })

  // Authentication
  const handleLogin = () => {
    if (password === 'admin123' || password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      loadData()
    } else {
      alert('Неверный пароль')
    }
  }

  // Load data
  const loadData = async () => {
    setLoading(true)
    try {
      const [concertsRes, citiesRes, venuesRes] = await Promise.all([
        fetch('/api/admin/concerts', {
          headers: { 'Authorization': `Bearer ${password}` }
        }),
        fetch('/api/data/cities'),
        fetch('/api/data/venues'),
      ])

      if (concertsRes.ok && citiesRes.ok && venuesRes.ok) {
        const [concertsData, citiesData, venuesData] = await Promise.all([
          concertsRes.json(),
          citiesRes.json(),
          venuesRes.json(),
        ])

        setConcerts(concertsData.concerts || [])
        setCities(citiesData.cities || [])
        setVenues(venuesData.venues || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Add concert
  const handleAddConcert = async () => {
    if (!newConcert.date || !newConcert.cityId || !newConcert.venueId) {
      alert('Заполните обязательные поля')
      return
    }

    try {
      const concert: Concert = {
        id: `concert-${Date.now()}`,
        date: newConcert.date!,
        cityId: newConcert.cityId!,
        venueId: newConcert.venueId!,
        type: newConcert.type || 'Concert',
        status: newConcert.status!,
        soldOut: newConcert.soldOut || false,
      }

      const response = await fetch('/api/admin/concerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify(concert)
      })

      if (response.ok) {
        setShowAddForm(false)
        setNewConcert({
          date: '',
          cityId: '',
          venueId: '',
          type: '',
          status: 'upcoming',
          soldOut: false,
        })
        loadData() // Reload data
        alert('Концерт добавлен!')
      } else {
        alert('Ошибка при добавлении концерта')
      }
    } catch (error) {
      console.error('Error adding concert:', error)
      alert('Ошибка при добавлении концерта')
    }
  }

  // Delete concert
  const handleDeleteConcert = async (concertId: string) => {
    if (!confirm('Удалить концерт?')) return

    try {
      const response = await fetch(`/api/admin/concerts/${concertId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${password}` }
      })

      if (response.ok) {
        loadData() // Reload data
        alert('Концерт удален!')
      } else {
        alert('Ошибка при удалении концерта')
      }
    } catch (error) {
      console.error('Error deleting concert:', error)
      alert('Ошибка при удалении концерта')
    }
  }

  // Seed database
  const handleSeedDatabase = async () => {
    if (!confirm('Заполнить базу тестовыми данными? Это перезапишет все данные.')) return

    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${password}` }
      })

      if (response.ok) {
        loadData() // Reload data
        alert('База заполнена тестовыми данными!')
      } else {
        alert('Ошибка при заполнении базы')
      }
    } catch (error) {
      console.error('Error seeding database:', error)
      alert('Ошибка при заполнении базы')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-6">Админка Lumen Tour</h1>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30"
            />
            <button
              onClick={handleLogin}
              className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:shadow-lg transition-all"
            >
              Войти
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">🎸 Админка Lumen Tour</h1>
          <div className="flex gap-4">
            <button
              onClick={handleSeedDatabase}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Заполнить тестовыми данными
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              + Добавить концерт
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg">
            <h3 className="text-white/70 text-sm">Концерты</h3>
            <p className="text-2xl font-bold text-white">{concerts.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg">
            <h3 className="text-white/70 text-sm">Города</h3>
            <p className="text-2xl font-bold text-white">{cities.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg">
            <h3 className="text-white/70 text-sm">Площадки</h3>
            <p className="text-2xl font-bold text-white">{venues.length}</p>
          </div>
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Добавить концерт</h2>
              <div className="space-y-4">
                <input
                  type="date"
                  value={newConcert.date}
                  onChange={(e) => setNewConcert({...newConcert, date: e.target.value})}
                  className="w-full p-2 rounded border"
                />
                <select
                  value={newConcert.cityId}
                  onChange={(e) => setNewConcert({...newConcert, cityId: e.target.value})}
                  className="w-full p-2 rounded border"
                >
                  <option value="">Выберите город</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
                <select
                  value={newConcert.venueId}
                  onChange={(e) => setNewConcert({...newConcert, venueId: e.target.value})}
                  className="w-full p-2 rounded border"
                >
                  <option value="">Выберите площадку</option>
                  {venues
                    .filter(venue => !newConcert.cityId || venue.cityId === newConcert.cityId)
                    .map(venue => (
                      <option key={venue.id} value={venue.id}>{venue.name}</option>
                    ))}
                </select>
                <input
                  type="text"
                  placeholder="Тип концерта"
                  value={newConcert.type}
                  onChange={(e) => setNewConcert({...newConcert, type: e.target.value})}
                  className="w-full p-2 rounded border"
                />
                <select
                  value={newConcert.status}
                  onChange={(e) => setNewConcert({...newConcert, status: e.target.value as 'upcoming' | 'past' | 'cancelled'})}
                  className="w-full p-2 rounded border"
                >
                  <option value="upcoming">Предстоящий</option>
                  <option value="past">Прошедший</option>
                  <option value="cancelled">Отменен</option>
                </select>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleAddConcert}
                    className="flex-1 p-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Добавить
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 p-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Concerts Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Концерты ({concerts.length})</h2>
          {loading ? (
            <p className="text-white/70">Загрузка...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-white text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-2">Дата</th>
                    <th className="text-left p-2">Город</th>
                    <th className="text-left p-2">Площадка</th>
                    <th className="text-left p-2">Тип</th>
                    <th className="text-left p-2">Статус</th>
                    <th className="text-left p-2">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {concerts.map(concert => (
                    <tr key={concert.id} className="border-b border-white/10">
                      <td className="p-2">{new Date(concert.date).toLocaleDateString('ru-RU')}</td>
                      <td className="p-2">{concert.city?.name}</td>
                      <td className="p-2">{concert.venue?.name}</td>
                      <td className="p-2">{concert.type}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          concert.status === 'upcoming' ? 'bg-green-600' :
                          concert.status === 'past' ? 'bg-gray-600' : 'bg-red-600'
                        }`}>
                          {concert.status === 'upcoming' ? 'Предстоящий' :
                           concert.status === 'past' ? 'Прошедший' : 'Отменен'}
                        </span>
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => handleDeleteConcert(concert.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
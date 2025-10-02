'use client'

import { useState, useEffect } from 'react'
import { EventCategory } from '@prisma/client'
import { CalendarView } from '@/components/calendar/calendar-view'
import { CategoryFilter } from '@/components/calendar/category-filter'
import { ExportDropdown } from '@/components/calendar/export-dropdown'
import { Calendar, Clock, AlertCircle } from 'lucide-react'

export default function CalendarPage() {
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>(
    Object.values(EventCategory)
  )
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (response.ok) {
          const data = await response.json()
          setEvents(data.map((event: any) => ({
            ...event,
            startTime: new Date(event.startTime),
            endTime: new Date(event.endTime)
          })))
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Calculate stats
  const now = new Date()
  const upcomingEvents = events.filter(e => new Date(e.startTime) > now).length
  const todayEvents = events.filter(e => {
    const start = new Date(e.startTime)
    return start.toDateString() === now.toDateString()
  }).length
  const totalEvents = events.length

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Placement Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View all placement events and deadlines
          </p>
        </div>
        <ExportDropdown />
      </div>

      {/* Quick Stats */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {totalEvents}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today's Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {todayEvents}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {upcomingEvents}
                </p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      <CategoryFilter
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
      />

      <CalendarView selectedCategories={selectedCategories} />
    </div>
  )
}

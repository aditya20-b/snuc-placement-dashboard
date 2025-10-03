'use client'

import { useState, useEffect } from 'react'
import { Event } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { EventForm } from './event-form'
import { getCategoryLabel, getCategoryColor } from '@/lib/utils'
import { format } from 'date-fns'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function EventsList() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      const data = await response.json()
      setEvents(data.map((event: any) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt)
      })))
    } catch (error) {
      toast.error('Failed to load events')
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      toast.success('Event deleted successfully!')
      fetchEvents()
    } catch (error) {
      toast.error('Failed to delete event')
      console.error('Error deleting event:', error)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingEvent(null)
    fetchEvents()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingEvent(null)
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setShowForm(true)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500 dark:text-gray-400">Loading events...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Events</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">No events found</div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create your first event
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-700">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {events.map((event) => (
              <li key={event.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCategoryColor(event.category) }}
                      />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {getCategoryLabel(event.category)}
                      </span>
                    </div>

                    {event.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {event.description}
                      </p>
                    )}

                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {format(event.startTime, 'MMM d, yyyy h:mm a')} - {format(event.endTime, 'h:mm a')}
                      </span>
                      {event.link && (
                        <a
                          href={event.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          View Link
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showForm && (
        <EventForm
          event={editingEvent || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  )
}
'use client'

import { Event } from '@/lib/types'
import { getCategoryLabel, getCategoryColor } from '@/lib/utils'
import { format } from 'date-fns'
import { Calendar, Clock, Tag, Link as LinkIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EventModalProps {
  event: Event
  onClose: () => void
}

export function EventModal({ event, onClose }: EventModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getCategoryColor(event.category) }}
              />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {event.title}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm">
              <Tag className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {getCategoryLabel(event.category)}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span>
                {format(event.startTime, 'EEEE, MMMM d, yyyy')}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span>
                {format(event.startTime, 'h:mm a')} - {format(event.endTime, 'h:mm a')}
              </span>
            </div>

            {event.description && (
              <div className="pt-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            {event.link && (
              <div className="pt-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Link</h3>
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Open Link</span>
                </a>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
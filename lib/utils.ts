import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { EventCategory, JobStatus } from '@prisma/client'
import type { Event, CalendarEvent } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategoryColor(category: EventCategory): string {
  switch (category) {
    case 'PLACEMENT':
      return '#3b82f6' // Blue
    case 'EXAM':
      return '#ef4444' // Red
    case 'INFO_SESSION':
      return '#10b981' // Green
    case 'OA':
      return '#f59e0b' // Amber
    case 'INTERVIEW':
      return '#8b5cf6' // Purple
    case 'DEADLINE':
      return '#ec4899' // Pink
    case 'OTHER':
    default:
      return '#6b7280' // Gray
  }
}

export function getCategoryLabel(category: EventCategory): string {
  switch (category) {
    case 'PLACEMENT':
      return 'Placement'
    case 'EXAM':
      return 'Exam'
    case 'INFO_SESSION':
      return 'Info Session'
    case 'OA':
      return 'Online Assessment'
    case 'INTERVIEW':
      return 'Interview'
    case 'DEADLINE':
      return 'Deadline'
    case 'OTHER':
    default:
      return 'Other'
  }
}

export function formatEventForCalendar(event: Event): CalendarEvent {
  return {
    id: event.id,
    title: event.title,
    start: event.startTime.toISOString(),
    end: event.endTime.toISOString(),
    backgroundColor: getCategoryColor(event.category),
    extendedProps: {
      description: event.description || undefined,
      category: event.category,
      link: event.link || undefined
    }
  }
}

export function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function getJobStatusColor(status: JobStatus): string {
  switch (status) {
    case 'OPEN':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'APPLICATIONS_CLOSED':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    case 'ON_HOLD':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'CLOSED':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

export function getJobStatusLabel(status: JobStatus): string {
  switch (status) {
    case 'OPEN':
      return 'Open'
    case 'IN_PROGRESS':
      return 'In Progress'
    case 'APPLICATIONS_CLOSED':
      return 'Applications Closed'
    case 'ON_HOLD':
      return 'On Hold'
    case 'COMPLETED':
      return 'Completed'
    case 'CANCELLED':
      return 'Cancelled'
    case 'CLOSED':
      return 'Closed'
    default:
      return status
  }
}
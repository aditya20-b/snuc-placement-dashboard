import { Event, EventCategory } from '@prisma/client'

export type { Event, EventCategory }

export interface CreateEventData {
  title: string
  description?: string
  startTime: Date
  endTime: Date
  category: EventCategory
  link?: string
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  extendedProps: {
    description?: string | null
    category: EventCategory
    link?: string | null
  }
}
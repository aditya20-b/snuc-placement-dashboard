import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateICS } from '@/lib/export'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        startTime: 'asc'
      }
    })

    const icsContent = generateICS(events)

    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': 'attachment; filename="placement-calendar.ics"'
      }
    })
  } catch (error) {
    console.error('Error generating ICS:', error)
    return NextResponse.json(
      { error: 'Failed to generate ICS file' },
      { status: 500 }
    )
  }
}
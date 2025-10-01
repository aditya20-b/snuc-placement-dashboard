import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateCSV } from '@/lib/export'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        startTime: 'asc'
      }
    })

    const csvContent = generateCSV(events)

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="placement-calendar.csv"'
      }
    })
  } catch (error) {
    console.error('Error generating CSV:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSV file' },
      { status: 500 }
    )
  }
}
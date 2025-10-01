import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generatePDF } from '@/lib/export'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        startTime: 'asc'
      }
    })

    const pdfBuffer = generatePDF(events)
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' })

    return new Response(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="placement-calendar.pdf"'
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF file' },
      { status: 500 }
    )
  }
}
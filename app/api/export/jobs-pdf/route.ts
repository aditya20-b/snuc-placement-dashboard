import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateJobsPDF } from '@/lib/export'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: any = {}
    if (status && status !== 'all') where.status = status
    if (type && type !== 'all') where.type = type

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    const pdf = generateJobsPDF(jobs)

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="jobs-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating jobs PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// POST /api/students/[id]/placements - Add placement offer to student
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const body = await request.json()
    const {
      jobId,
      company,
      jobTitle,
      ctc,
      stipend,
      jobType,
      offerDate,
      offerStatus,
      isAccepted,
      notes,
    } = body

    if (!company || !jobTitle) {
      return NextResponse.json(
        { error: 'Company and job title are required' },
        { status: 400 }
      )
    }

    // Create the placement
    const placement = await prisma.studentPlacement.create({
      data: {
        studentId: id,
        jobId: jobId || '',
        company,
        jobTitle,
        ctc: ctc || null,
        stipend: stipend || null,
        jobType: jobType || null,
        offerDate: offerDate ? new Date(offerDate) : new Date(),
        offerStatus: offerStatus || 'PENDING',
        isAccepted: isAccepted || false,
        notes: notes || null,
      },
      include: {
        job: true,
        student: true,
      },
    })

    // If offer is accepted, update student's placement status
    if (isAccepted) {
      // Extract numeric CTC value
      const ctcMatch = ctc?.match(/(\d+(?:\.\d+)?)/)
      const ctcValue = ctcMatch ? parseFloat(ctcMatch[1]) : 0

      // Determine if student can sit for more based on 2x rule
      const canSitForMore = ctcValue <= 6

      await prisma.student.update({
        where: { id },
        data: {
          placementStatus: canSitForMore ? 'PLACED' : 'PLACED_FINAL',
          canSitForMore,
          finalPlacedCompany: company,
          finalPlacedJobTitle: jobTitle,
          finalPlacedCTC: ctc,
          finalPlacedJobType: jobType,
          finalPlacedDate: new Date(),
        },
      })
    }

    return NextResponse.json(placement)
  } catch (error) {
    console.error('Error creating placement:', error)
    return NextResponse.json(
      { error: 'Failed to create placement' },
      { status: 500 }
    )
  }
}

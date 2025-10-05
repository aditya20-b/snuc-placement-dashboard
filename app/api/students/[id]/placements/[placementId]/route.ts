import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// PUT /api/students/[id]/placements/[placementId] - Update placement status (accept/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; placementId: string }> }
) {
  try {
    await requireAuth()

    const { id, placementId } = await params
    const body = await request.json()
    const { offerStatus, isAccepted, notes } = body

    // Get the placement to access CTC
    const placement = await prisma.studentPlacement.findUnique({
      where: { id: placementId },
    })

    if (!placement) {
      return NextResponse.json(
        { error: 'Placement not found' },
        { status: 404 }
      )
    }

    // SECURITY: Verify placement belongs to the specified student (prevent IDOR)
    if (placement.studentId !== id) {
      return NextResponse.json(
        { error: 'Placement not found' },
        { status: 404 }
      )
    }

    // Update the placement
    const updatedPlacement = await prisma.studentPlacement.update({
      where: { id: placementId },
      data: {
        offerStatus: offerStatus || placement.offerStatus,
        isAccepted: isAccepted !== undefined ? isAccepted : placement.isAccepted,
        notes: notes !== undefined ? notes : placement.notes,
      },
    })

    // If offer is being accepted, update student status
    if (isAccepted && !placement.isAccepted) {
      // Extract numeric CTC value
      const ctcMatch = placement.ctc?.match(/(\d+(?:\.\d+)?)/)
      const ctcValue = ctcMatch ? parseFloat(ctcMatch[1]) : 0

      // Determine if student can sit for more based on 2x rule
      const canSitForMore = ctcValue <= 6

      await prisma.student.update({
        where: { id },
        data: {
          placementStatus: canSitForMore ? 'PLACED' : 'PLACED_FINAL',
          canSitForMore,
          finalPlacedCompany: placement.company,
          finalPlacedJobTitle: placement.jobTitle,
          finalPlacedCTC: placement.ctc,
          finalPlacedJobType: placement.jobType,
          finalPlacedDate: new Date(),
        },
      })
    }

    return NextResponse.json(updatedPlacement)
  } catch (error) {
    console.error('Error updating placement:', error)
    return NextResponse.json(
      { error: 'Failed to update placement' },
      { status: 500 }
    )
  }
}

// DELETE /api/students/[id]/placements/[placementId] - Delete placement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; placementId: string }> }
) {
  try {
    await requireAuth()

    const { id, placementId } = await params

    // SECURITY: Verify placement belongs to the specified student before deletion
    const placement = await prisma.studentPlacement.findUnique({
      where: { id: placementId },
    })

    if (!placement) {
      return NextResponse.json(
        { error: 'Placement not found' },
        { status: 404 }
      )
    }

    if (placement.studentId !== id) {
      return NextResponse.json(
        { error: 'Placement not found' },
        { status: 404 }
      )
    }

    await prisma.studentPlacement.delete({
      where: { id: placementId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting placement:', error)
    return NextResponse.json(
      { error: 'Failed to delete placement' },
      { status: 500 }
    )
  }
}

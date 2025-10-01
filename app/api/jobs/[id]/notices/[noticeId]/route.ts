import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noticeId: string }> }
) {
  const { id: jobId, noticeId } = await params

  try {
    const user = await requireAuth()

    const notice = await prisma.jobNotice.findUnique({
      where: { id: noticeId }
    })

    if (!notice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
    }

    await prisma.jobNotice.delete({
      where: { id: noticeId }
    })

    // Log the action
    await prisma.jobLog.create({
      data: {
        jobId,
        action: 'NOTICE_DELETED',
        description: `Notice deleted: "${notice.title}"`,
        performedBy: user.username,
        metadata: { noticeId, title: notice.title }
      }
    })

    return NextResponse.json({ message: 'Notice deleted successfully' })
  } catch (error) {
    console.error('Error deleting notice:', error)
    return NextResponse.json(
      { error: 'Failed to delete notice' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params

  try {
    const user = await requireAuth()
    const body = await request.json()
    const { title, content, isImportant } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const notice = await prisma.jobNotice.create({
      data: {
        jobId,
        title,
        content,
        isImportant: isImportant || false,
        createdBy: user.username
      }
    })

    // Log the action
    await prisma.jobLog.create({
      data: {
        jobId,
        action: 'NOTICE_ADDED',
        description: `Notice added: "${title}"`,
        performedBy: user.username,
        metadata: { noticeId: notice.id, isImportant }
      }
    })

    return NextResponse.json(notice, { status: 201 })
  } catch (error) {
    console.error('Error creating notice:', error)
    return NextResponse.json(
      { error: 'Failed to create notice' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params

  try {
    const notices = await prisma.jobNotice.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(notices)
  } catch (error) {
    console.error('Error fetching notices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notices' },
      { status: 500 }
    )
  }
}

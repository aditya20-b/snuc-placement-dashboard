import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// Download attachment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  const { attachmentId } = await params

  try {
    const attachment = await prisma.jobAttachment.findUnique({
      where: { id: attachmentId }
    })

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 })
    }

    // In production, redirect to the actual file URL or serve from cloud storage
    return NextResponse.json({
      fileName: attachment.fileName,
      fileUrl: attachment.fileUrl,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize
    })
  } catch (error) {
    console.error('Error downloading attachment:', error)
    return NextResponse.json(
      { error: 'Failed to download attachment' },
      { status: 500 }
    )
  }
}

// Delete attachment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  const { id: jobId, attachmentId } = await params

  try {
    const user = await requireAuth()

    const attachment = await prisma.jobAttachment.findUnique({
      where: { id: attachmentId }
    })

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 })
    }

    await prisma.jobAttachment.delete({
      where: { id: attachmentId }
    })

    // Log the action
    await prisma.jobLog.create({
      data: {
        jobId,
        action: 'ATTACHMENT_DELETED',
        description: `File "${attachment.fileName}" deleted`,
        performedBy: user.username,
        metadata: { attachmentId, fileName: attachment.fileName }
      }
    })

    return NextResponse.json({ message: 'Attachment deleted successfully' })
  } catch (error) {
    console.error('Error deleting attachment:', error)
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    )
  }
}

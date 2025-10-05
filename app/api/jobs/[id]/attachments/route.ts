import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// Upload attachment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params

  try {
    const user = await requireAuth()
    const formData = await request.formData()

    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, DOC, DOCX, TXT, JPG, PNG' },
        { status: 400 }
      )
    }

    // For now, store a placeholder URL (in production, upload to cloud storage)
    const fileUrl = `/uploads/jobs/${jobId}/${Date.now()}-${file.name}`

    const attachment = await prisma.jobAttachment.create({
      data: {
        jobId,
        fileName: file.name,
        fileUrl,
        fileType: file.type,
        fileSize: file.size,
        uploadedBy: user.username
      }
    })

    // Log the action
    await prisma.jobLog.create({
      data: {
        jobId,
        action: 'ATTACHMENT_ADDED',
        description: `File "${file.name}" uploaded`,
        performedBy: user.username,
        metadata: { attachmentId: attachment.id, fileName: file.name, fileSize: file.size }
      }
    })

    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    console.error('Error uploading attachment:', error)
    return NextResponse.json(
      { error: 'Failed to upload attachment' },
      { status: 500 }
    )
  }
}

// Get all attachments for a job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params

  try {
    const attachments = await prisma.jobAttachment.findMany({
      where: { jobId },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        uploadedBy: true,
        createdAt: true
        // Exclude fileData from list view
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(attachments)
  } catch (error) {
    console.error('Error fetching attachments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attachments' },
      { status: 500 }
    )
  }
}

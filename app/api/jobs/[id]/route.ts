import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { JobType, JobCategory, JobStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        workflowStages: {
          orderBy: { orderIndex: 'asc' }
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            uploadedBy: true,
            createdAt: true
            // Exclude fileData to reduce response size
          },
          orderBy: { createdAt: 'desc' }
        },
        notices: {
          orderBy: { createdAt: 'desc' }
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 50 // Limit to last 50 logs
        }
      }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await requireAuth()

    // Get existing job for comparison
    const existingJob = await prisma.job.findUnique({ where: { id } })
    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      // Basic Info
      company,
      title,
      description,
      aboutCompany,
      // Compensation
      ctc,
      stipend,
      // Job Details
      type,
      category,
      status,
      location,
      link,
      // Dates
      applyBy,
      dateOfVisit,
      hiringStartsOn,
      // Visit Details
      modeOfVisit,
      // Eligibility
      minCGPA,
      min10thPercentage,
      min12thPercentage,
      minDiplomaPercentage,
      minSemPercentage,
      maxCurrentArrears,
      maxHistoryArrears,
      genderRequirement,
      eligibilityBranches,
      otherEligibility,
      // POC
      pocName,
      pocEmail,
      pocPhone,
      // System
      notAppliedPointsDeduct
    } = body

    if (!company || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: company and title are required' },
        { status: 400 }
      )
    }

    if (type && !Object.values(JobType).includes(type)) {
      return NextResponse.json({ error: 'Invalid job type' }, { status: 400 })
    }

    if (category && !Object.values(JobCategory).includes(category)) {
      return NextResponse.json({ error: 'Invalid job category' }, { status: 400 })
    }

    if (status && !Object.values(JobStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid job status' }, { status: 400 })
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        // Basic Info
        company,
        title,
        description,
        aboutCompany,
        // Compensation
        ctc,
        stipend,
        // Job Details
        type,
        category,
        status,
        location,
        link,
        // Dates
        applyBy: applyBy ? new Date(applyBy) : null,
        dateOfVisit: dateOfVisit ? new Date(dateOfVisit) : null,
        hiringStartsOn: hiringStartsOn ? new Date(hiringStartsOn) : null,
        // Visit Details
        modeOfVisit,
        // Eligibility
        minCGPA: minCGPA ? parseFloat(minCGPA) : null,
        min10thPercentage: min10thPercentage ? parseFloat(min10thPercentage) : null,
        min12thPercentage: min12thPercentage ? parseFloat(min12thPercentage) : null,
        minDiplomaPercentage: minDiplomaPercentage ? parseFloat(minDiplomaPercentage) : null,
        minSemPercentage: minSemPercentage ? parseFloat(minSemPercentage) : null,
        maxCurrentArrears: maxCurrentArrears ? parseInt(maxCurrentArrears) : null,
        maxHistoryArrears: maxHistoryArrears ? parseInt(maxHistoryArrears) : null,
        genderRequirement,
        eligibilityBranches,
        otherEligibility,
        // POC
        pocName,
        pocEmail,
        pocPhone,
        // System
        notAppliedPointsDeduct: notAppliedPointsDeduct ? parseInt(notAppliedPointsDeduct) : null
      },
      include: {
        workflowStages: { orderBy: { orderIndex: 'asc' } },
        attachments: true,
        notices: true
      }
    })

    // Log job update with changes
    const changes = []
    if (existingJob.status !== status) changes.push(`Status: ${existingJob.status} → ${status}`)
    if (existingJob.category !== category) changes.push(`Category: ${existingJob.category} → ${category}`)

    await prisma.jobLog.create({
      data: {
        jobId: job.id,
        action: 'UPDATED',
        description: changes.length > 0
          ? `Job updated: ${changes.join(', ')}`
          : 'Job details updated',
        performedBy: user.username,
        metadata: {
          changes,
          fieldsUpdated: Object.keys(body)
        }
      }
    })

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await requireAuth()

    // Get job info before deleting
    const job = await prisma.job.findUnique({
      where: { id },
      select: { company: true, title: true }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Delete job (cascades to related records due to schema)
    await prisma.job.delete({
      where: { id }
    })

    // Note: Can't log to JobLog since job is deleted
    // Could log to a separate audit table if needed

    return NextResponse.json({
      success: true,
      message: `Job "${job.title}" at ${job.company} deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    )
  }
}

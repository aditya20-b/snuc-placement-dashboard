import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { JobType, JobCategory, JobStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Add pagination support
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100') // Default to 100 jobs
    const skip = (page - 1) * limit

    // Optional filters
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const type = searchParams.get('type')

    const where: any = {}
    if (status) where.status = status
    if (category) where.category = category
    if (type) where.type = type

    // Parallel queries for count and data
    const [totalCount, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { status: 'asc' }, // OPEN first, then IN_PROGRESS, then CLOSED
          { applyBy: 'asc' } // Earlier deadlines first
        ],
        include: {
          workflowStages: {
            orderBy: { orderIndex: 'asc' },
            select: {
              id: true,
              stageName: true,
              stageType: true,
              orderIndex: true
            }
          },
          // Only fetch attachment metadata, not actual file data
          attachments: {
            select: {
              id: true,
              fileName: true,
              fileType: true,
              createdAt: true
            }
          },
          notices: {
            orderBy: { createdAt: 'desc' },
            take: 5 // Limit to latest 5 notices
          },
          _count: {
            select: {
              workflowStages: true,
              attachments: true,
              notices: true
            }
          }
        }
      })
    ])

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + jobs.length < totalCount
      }
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

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
      notAppliedPointsDeduct,
      // Related data
      workflowStages,
      notices
    } = body

    if (!company || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: company and title are required' },
        { status: 400 }
      )
    }

    if (type && !Object.values(JobType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid job type' },
        { status: 400 }
      )
    }

    if (category && !Object.values(JobCategory).includes(category)) {
      return NextResponse.json(
        { error: 'Invalid job category' },
        { status: 400 }
      )
    }

    if (status && !Object.values(JobStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid job status' },
        { status: 400 }
      )
    }

    const job = await prisma.job.create({
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
        type: type || 'FTE',
        category: category || 'OTHER',
        status: status || 'OPEN',
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
        maxCurrentArrears: maxCurrentArrears ? parseInt(maxCurrentArrears) : 0,
        maxHistoryArrears: maxHistoryArrears ? parseInt(maxHistoryArrears) : 0,
        genderRequirement,
        eligibilityBranches,
        otherEligibility,
        // POC
        pocName,
        pocEmail,
        pocPhone,
        // System
        notAppliedPointsDeduct: notAppliedPointsDeduct ? parseInt(notAppliedPointsDeduct) : 0,
        // Workflow Stages
        workflowStages: workflowStages ? {
          create: workflowStages.map((stage: any, index: number) => ({
            stageName: stage.stageName,
            stageType: stage.stageType,
            orderIndex: index,
            description: stage.description
          }))
        } : undefined,
        // Notices
        notices: notices ? {
          create: notices.map((notice: any) => ({
            title: notice.title,
            content: notice.content,
            isImportant: notice.isImportant || false,
            createdBy: user.username
          }))
        } : undefined
      },
      include: {
        workflowStages: {
          orderBy: { orderIndex: 'asc' }
        },
        attachments: true,
        notices: true
      }
    })

    // Log job creation
    await prisma.jobLog.create({
      data: {
        jobId: job.id,
        action: 'CREATED',
        description: `Job "${title}" at ${company} created`,
        performedBy: user.username,
        metadata: {
          company,
          title,
          type,
          category
        }
      }
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}

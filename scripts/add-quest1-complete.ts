import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // First, check if the job already exists
  const existingJob = await prisma.job.findFirst({
    where: {
      company: 'Quest1',
      title: 'Software Engineering Intern'
    }
  })

  let job
  if (existingJob) {
    console.log('ℹ️  Quest1 job already exists, using existing job...')
    job = existingJob
  } else {
    // Create the Quest1 job
    job = await prisma.job.create({
      data: {
        company: 'Quest1',
        title: 'Software Engineering Intern',
        type: 'INTERN_LEADS_TO_FTE',
        category: 'SUPER_DREAM', // 15 LPA fits in the 10-20L range
        status: 'COMPLETED',
        ctc: '15 LPA',
        stipend: '50k/month',
        applyBy: new Date('2025-07-28T11:00:00'),
        dateOfVisit: new Date('2025-08-04'),
        eligibilityBranches: 'CSE/IT',
        description: 'Software Engineering Intern position with internship leading to full-time opportunity.',
      },
    })
    console.log('✅ Quest1 job created successfully!')
  }

  // Find the 3 students who were hired
  const studentNames = ['Mahasvan Mohan', 'Suha Nazrin', 'Raghav Vijayanand']

  console.log('\n🔍 Searching for students...')

  for (const studentName of studentNames) {
    const student = await prisma.student.findFirst({
      where: {
        name: {
          contains: studentName,
          mode: 'insensitive'
        }
      }
    })

    if (!student) {
      console.log(`❌ Student not found: ${studentName}`)
      continue
    }

    console.log(`✓ Found: ${student.name} (${student.rollNumber})`)

    // Check if placement already exists
    const existingPlacement = await prisma.studentPlacement.findFirst({
      where: {
        studentId: student.id,
        jobId: job.id
      }
    })

    if (existingPlacement) {
      console.log(`  ℹ️  Placement already exists for ${student.name}`)
      continue
    }

    // Create StudentPlacement record
    const placement = await prisma.studentPlacement.create({
      data: {
        studentId: student.id,
        jobId: job.id,
        company: 'Quest1',
        jobTitle: 'Software Engineering Intern',
        ctc: '15 LPA',
        stipend: '50k/month',
        jobType: 'INTERN_LEADS_TO_FTE',
        offerDate: new Date('2025-08-04'),
        offerStatus: 'ACCEPTED',
        isAccepted: true,
      }
    })

    console.log(`  ✅ Placement record created`)

    // Check CTC value to determine eligibility
    const ctcValue = 15 // 15 LPA
    const canSitForMore = ctcValue <= 6
    const placementStatus = canSitForMore ? 'PLACED' : 'PLACED_FINAL'

    // Update student record
    await prisma.student.update({
      where: { id: student.id },
      data: {
        placementStatus: placementStatus,
        canSitForMore: canSitForMore,
        finalPlacedCompany: 'Quest1',
        finalPlacedJobTitle: 'Software Engineering Intern',
        finalPlacedCTC: '15 LPA',
        finalPlacedJobType: 'INTERN_LEADS_TO_FTE',
        finalPlacedDate: new Date('2025-08-04'),
      }
    })

    console.log(`  ✅ Student updated: Status = ${placementStatus}, Can sit for more = ${canSitForMore}`)
  }

  console.log('\n📊 Summary:')
  console.log(`Job: ${job.company} - ${job.title}`)
  console.log(`Job ID: ${job.id}`)
  console.log(`CTC: ${job.ctc}`)
  console.log(`Status: ${job.status}`)
  console.log(`Students processed: ${studentNames.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

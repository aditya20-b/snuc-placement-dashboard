import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📋 Adding HSBC Technology India Recruitment Drive...\n')

  // Create the HSBC job with complete details
  const job = await prisma.job.create({
    data: {
      company: 'HSBC Technology India',
      title: 'Trainee Software Engineer',
      type: 'FTE',
      category: 'SUPER_DREAM', // 15.03 LPA fits in 10-20L range
      status: 'COMPLETED',

      // Compensation
      ctc: '15.03 LPA',

      // Location
      location: 'Pune, Bengaluru, Hyderabad',

      // Registration Link - placeholder since actual link not provided
      link: 'https://forms.office.com/hsbc-registration',

      // Important Dates
      applyBy: new Date('2025-08-06T11:30:00'), // 06-Aug-2025, 11:30 AM
      hiringStartsOn: new Date('2025-09-01T10:00:00'), // 01-Sep, 10:00 AM (PPT)
      dateOfVisit: new Date('2025-09-18T09:30:00'), // 18-Sep, 9:30 AM (Interviews)

      // Mode of Visit
      modeOfVisit: 'PHYSICAL', // On-campus interviews

      // Eligibility Criteria
      minCGPA: 7.0,
      min10thPercentage: 70.0,
      min12thPercentage: 70.0,
      minDiplomaPercentage: 70.0,
      maxCurrentArrears: 0,
      maxHistoryArrears: 0,
      genderRequirement: 'ANY',
      eligibilityBranches: 'Computer Science, IT, AI-ML, AI-DS, Cybersecurity',
      otherEligibility: 'B.E./B.Tech – 2026 Pass-out Batch only. No current backlogs during hiring/onboarding. Students who are already placed/have PPO offers/opted for higher studies are not eligible.',

      // About Company
      aboutCompany: `HSBC Technology India is the technology and innovation center of HSBC Group, one of the world's largest banking and financial services organizations.

The Engineering Graduate Programme at HSBC offers:
• Opportunity to work on cutting-edge banking technology
• Global exposure and career development
• Comprehensive training and mentorship
• Work on projects that impact millions of customers worldwide

HSBC is committed to building a culture where all employees are valued, respected and opinions count.`,

      // Job Description
      description: `**Role:** Trainee Software Engineer (Engineering Graduate Programme)

**Compensation Details:**
• Base CTC: ₹15,03,097 per annum
• On-Target Variable Pay: ₹1.4 Lakhs (subject to periodic internal reviews)
• Total Package: ~₹16.4 Lakhs

**Job Locations:** Pune / Bengaluru / Hyderabad (subject to business requirements)

**Event Schedule:**
• Pre-Placement Talk: 01-Sep-2025 | 10:00 AM – 11:00 AM
• Online Simulate & Codility Assessments: 01-Sep-2025 | 11:00 AM – 1:00 PM
• Interview Date: 18-Sep-2025 | From 9:30 AM onwards

**Important Instructions:**
• Students who are already placed / have PPO offers / opted for higher studies / or have current backlogs are not eligible
• Students who registered for earlier drives but did not appear are also not eligible
• Registration Deadline: 06-Aug-2025 (Wednesday) by 11:30 AM`,
    },
  })

  console.log('✅ HSBC job created successfully!')
  console.log(`Job ID: ${job.id}`)
  console.log(`Company: ${job.company}`)
  console.log(`Title: ${job.title}`)
  console.log(`CTC: ${job.ctc}`)
  console.log(`Status: ${job.status}\n`)

  // Add workflow stages for the hiring process
  console.log('📝 Adding hiring workflow stages...\n')

  const stages = [
    {
      stageName: 'Pre-Placement Talk',
      stageType: 'PRE_PLACEMENT_TALK',
      orderIndex: 1,
      description: 'Company presentation and Q&A session scheduled for 01-Sep-2025, 10:00 AM – 11:00 AM.'
    },
    {
      stageName: 'Online Simulate Assessment',
      stageType: 'ONLINE_ASSESSMENT',
      orderIndex: 2,
      description: 'First round of online assessment scheduled for 01-Sep-2025, 11:00 AM – 1:00 PM.'
    },
    {
      stageName: 'Online Codility Assessment',
      stageType: 'CODING_TEST',
      orderIndex: 3,
      description: 'Coding assessment for candidates who qualify the Simulate round. Scheduled for 01-Sep-2025, 11:00 AM – 1:00 PM.'
    },
    {
      stageName: 'Technical Interview',
      stageType: 'TECHNICAL_INTERVIEW',
      orderIndex: 4,
      description: 'Technical interview round scheduled for 18-Sep-2025 at SNU Chennai campus from 9:30 AM onwards.'
    },
    {
      stageName: 'HR Interview',
      stageType: 'HR_INTERVIEW',
      orderIndex: 5,
      description: 'Final HR interview round for candidates who qualify the technical round.'
    }
  ]

  for (const stage of stages) {
    await prisma.jobWorkflowStage.create({
      data: {
        jobId: job.id,
        stageName: stage.stageName,
        stageType: stage.stageType,
        orderIndex: stage.orderIndex,
        description: stage.description
      }
    })
    console.log(`✅ Stage ${stage.orderIndex}: ${stage.stageName}`)
  }

  // Students selected with their details
  const selectedStudents = [
    { name: 'Divyadarshan B', email: 'divyadarshan22110313@snuchennai.edu.in', department: 'AI & DS' },
    { name: 'Jeethesh MSK', email: 'jeethesh22110291@snuchennai.edu.in', department: 'AI & DS' },
    { name: 'Joe Marian A', email: 'joemarian22110299@snuchennai.edu.in', department: 'CSE (IoT)' },
    { name: 'R S Rohit', email: 'rohit22110116@snuchennai.edu.in', department: 'CSE (IoT)' },
    { name: 'Rehan Khan PK', email: 'rehankhan22110362@snuchennai.edu.in', department: 'CSE (IoT)' },
    { name: 'Shangruthan', email: 'shangruthan22110445@snuchennai.edu.in', department: 'CSE (Cybersecurity)' },
    { name: 'Shruti T', email: 'shruti22110091@snuchennai.edu.in', department: 'CSE (IoT)' },
    { name: 'Shwetha M', email: 'shwetha22110084@snuchennai.edu.in', department: 'AI & DS' },
    { name: 'Siddarrth Kasinathan RM', email: 'siddarrth22110289@snuchennai.edu.in', department: 'AI & DS' },
    { name: 'Yohan Subbaraj Thirumurugan', email: 'yohansubbaraj22110126@snuchennai.edu.in', department: 'AI & DS' },
  ]

  console.log('\n🔍 Searching for selected students...\n')

  let placedCount = 0
  let notFoundCount = 0

  for (const studentInfo of selectedStudents) {
    // Try to find by email first (most reliable)
    let student = await prisma.student.findFirst({
      where: {
        email: {
          contains: studentInfo.email.split('@')[0], // Use the part before @
          mode: 'insensitive'
        }
      }
    })

    // If not found by email, try by name
    if (!student) {
      const nameParts = studentInfo.name.split(' ')
      const students = await prisma.student.findMany({
        where: {
          OR: nameParts.map(part => ({
            name: {
              contains: part,
              mode: 'insensitive'
            }
          }))
        }
      })

      // Try to match by department if multiple matches
      if (students.length > 1) {
        const match = students.find(s =>
          s.department.toLowerCase().includes(studentInfo.department.toLowerCase())
        )
        student = match || students[0]
      } else if (students.length === 1) {
        student = students[0]
      }
    }

    if (!student) {
      console.log(`❌ Student not found: ${studentInfo.name} (${studentInfo.department})`)
      notFoundCount++
      continue
    }

    console.log(`✓ Found: ${student.name} (${student.rollNumber}) - ${student.department}`)

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
    await prisma.studentPlacement.create({
      data: {
        studentId: student.id,
        jobId: job.id,
        company: 'HSBC Technology India',
        jobTitle: 'Trainee Software Engineer',
        ctc: '15.03 LPA',
        jobType: 'FTE',
        offerDate: new Date('2025-09-18'), // Interview date
        offerStatus: 'ACCEPTED',
        isAccepted: true,
      }
    })

    console.log(`  ✅ Placement record created`)

    // Update student status based on 2x CTC rule
    // CTC is 15.03 LPA > 6 LPA, so they become PLACED_FINAL
    const ctcValue = 15.03
    const canSitForMore = ctcValue <= 6
    const placementStatus = canSitForMore ? 'PLACED' : 'PLACED_FINAL'

    await prisma.student.update({
      where: { id: student.id },
      data: {
        placementStatus: placementStatus,
        canSitForMore: canSitForMore,
        finalPlacedCompany: 'HSBC Technology India',
        finalPlacedJobTitle: 'Trainee Software Engineer',
        finalPlacedCTC: '15.03 LPA',
        finalPlacedJobType: 'FTE',
        finalPlacedDate: new Date('2025-09-18'),
      }
    })

    console.log(`  ✅ Student updated: ${placementStatus}, Can sit for more = ${canSitForMore}\n`)
    placedCount++
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Summary:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Job: ${job.company} - ${job.title}`)
  console.log(`CTC: ${job.ctc}`)
  console.log(`Status: ${job.status}`)
  console.log(`Interview Date: ${job.dateOfVisit?.toLocaleDateString()}`)
  console.log(`Workflow Stages: ${stages.length}`)
  console.log(`\nTotal Students: ${selectedStudents.length}`)
  console.log(`✅ Successfully Placed: ${placedCount}`)
  console.log(`❌ Not Found: ${notFoundCount}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

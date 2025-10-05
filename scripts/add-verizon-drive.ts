import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📋 Adding Verizon Recruitment Drive...\n')

  // Create the Verizon job with complete details
  const job = await prisma.job.create({
    data: {
      company: 'Verizon',
      title: 'Software Engineer Intern',
      type: 'INTERNSHIP',
      category: 'DREAM', // 7.53 LPA fits in 6-10L range
      status: 'COMPLETED',

      // Compensation
      ctc: '7.53 LPA',

      // Location
      location: 'Hyderabad, Chennai, Bengaluru',

      // Registration and Application Link
      link: 'https://forms.office.com/r/rb5i9uwLYk',

      // Important Dates
      applyBy: new Date('2025-08-02T20:00:00'), // 2nd August 2025, 8:00 PM
      hiringStartsOn: new Date('2025-08-20T18:30:00'), // 20th August 2025, 6:30 PM (OA)
      dateOfVisit: new Date('2025-08-22'), // 22nd August 2025 (On-Campus Drive)

      // Mode of Visit
      modeOfVisit: 'PHYSICAL', // On-campus drive

      // Eligibility Criteria
      minCGPA: 7.0,
      min10thPercentage: 70.0,
      min12thPercentage: 70.0,
      minDiplomaPercentage: 70.0,
      maxCurrentArrears: 0,
      maxHistoryArrears: 0,
      genderRequirement: 'ANY',
      eligibilityBranches: 'CSE/IT and allied branches',
      otherEligibility: 'Graduation Year: 2026 pass-outs only. No active backlogs.',

      // About Company
      aboutCompany: `Verizon is an American multinational telecommunications conglomerate and a global leader in next-generation communications technology, including 5G and the Internet of Things.

Verizon India (Verizon Data Services India) serves as an extension of Verizon's global teams, working on cutting-edge technologies and systems. The organization has been consistently recognized for its innovation, culture, and people-first practices, including:

• Featured among the Top 10 in the 2024 Best Companies to Work For by GPTW India
• Ranked among the Top 3 Most Inspiring Workplaces in Asia
• Honored by Businessworld and The Economic Times for excellence in employee experience

For more details, visit: www.verizon.com`,

      // Job Description
      description: `**Role:** Software Engineer Intern

**Compensation Details (Pre-Tax):**
• Total CTC: INR 7,53,000
• Fixed Pay: INR 6,30,000
• Variable Pay: INR 63,000 (Performance-based)
• Sign-On Bonus: INR 60,000 (As per applicable terms & conditions)
• Additional year-end component of approx. INR 1.2 Lakhs may be applicable

**Hiring Process:**
1. Online Aptitude & Coding Test - 20th August 2025, 6:30 PM
2. Group Discussion
3. Technical Interview
4. HR Discussion

**Job Locations:** Hyderabad, Chennai, Bengaluru

**Important Dates:**
• Registration Deadline: 2nd August 2025, 8:00 PM
• Online Assessment: 20th August 2025, 6:30 PM
• On-Campus Drive: 22nd August 2025`,
    },
  })

  console.log('✅ Verizon job created successfully!')
  console.log(`Job ID: ${job.id}`)
  console.log(`Company: ${job.company}`)
  console.log(`Title: ${job.title}`)
  console.log(`CTC: ${job.ctc}`)
  console.log(`Status: ${job.status}\n`)

  // Students selected with their departments
  const selectedStudents = [
    { name: 'Rishabh', department: 'AIDS' },
    { name: 'Harshit Sharma', department: 'AIDS' },
    { name: 'Jabin Joshua', department: 'IoT' },
    { name: 'Kayazhvizhi', department: 'AIDS' },
    { name: 'Keerthana', department: 'AIDS' },
    { name: 'Nithika', department: 'IoT' },
  ]

  console.log('🔍 Searching for selected students...\n')

  let placedCount = 0
  let notFoundCount = 0

  for (const studentInfo of selectedStudents) {
    // Search for student by name (case-insensitive)
    const students = await prisma.student.findMany({
      where: {
        name: {
          contains: studentInfo.name,
          mode: 'insensitive'
        }
      }
    })

    // If multiple matches, try to filter by department
    let student = students.length === 1 ? students[0] : null

    if (students.length > 1) {
      // Try to match by department
      const match = students.find(s =>
        s.department.toLowerCase().includes(studentInfo.department.toLowerCase())
      )
      student = match || students[0] // Use first match if no department match
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
        company: 'Verizon',
        jobTitle: 'Software Engineer Intern',
        ctc: '7.53 LPA',
        jobType: 'INTERNSHIP',
        offerDate: new Date('2025-08-22'), // Date of on-campus drive
        offerStatus: 'ACCEPTED',
        isAccepted: true,
      }
    })

    console.log(`  ✅ Placement record created`)

    // Update student status based on 2x CTC rule
    // CTC is 7.53 LPA > 6 LPA, so they become PLACED_FINAL
    const ctcValue = 7.53
    const canSitForMore = ctcValue <= 6
    const placementStatus = canSitForMore ? 'PLACED' : 'PLACED_FINAL'

    await prisma.student.update({
      where: { id: student.id },
      data: {
        placementStatus: placementStatus,
        canSitForMore: canSitForMore,
        finalPlacedCompany: 'Verizon',
        finalPlacedJobTitle: 'Software Engineer Intern',
        finalPlacedCTC: '7.53 LPA',
        finalPlacedJobType: 'INTERNSHIP',
        finalPlacedDate: new Date('2025-08-22'),
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
  console.log(`Date of Visit: ${job.dateOfVisit?.toLocaleDateString()}`)
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

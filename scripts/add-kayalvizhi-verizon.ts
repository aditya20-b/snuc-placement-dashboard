import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const student = await prisma.student.findUnique({
    where: { rollNumber: '22110130' }
  })

  const job = await prisma.job.findFirst({
    where: { company: 'Verizon', title: 'Software Engineer Intern' }
  })

  if (!student || !job) {
    console.log('❌ Student or job not found')
    return
  }

  console.log(`✓ Found: ${student.name} (${student.rollNumber})`)
  console.log(`✓ Job: ${job.company} - ${job.title}`)

  // Create placement
  await prisma.studentPlacement.create({
    data: {
      studentId: student.id,
      jobId: job.id,
      company: 'Verizon',
      jobTitle: 'Software Engineer Intern',
      ctc: '7.53 LPA',
      jobType: 'INTERNSHIP',
      offerDate: new Date('2025-08-22'),
      offerStatus: 'ACCEPTED',
      isAccepted: true,
    }
  })

  console.log('✅ Placement record created')

  // Update student status
  await prisma.student.update({
    where: { id: student.id },
    data: {
      placementStatus: 'PLACED_FINAL',
      canSitForMore: false,
      finalPlacedCompany: 'Verizon',
      finalPlacedJobTitle: 'Software Engineer Intern',
      finalPlacedCTC: '7.53 LPA',
      finalPlacedJobType: 'INTERNSHIP',
      finalPlacedDate: new Date('2025-08-22'),
    }
  })

  console.log('✅ Student updated: PLACED_FINAL, Can sit for more = false')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

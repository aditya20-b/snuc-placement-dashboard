import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const job = await prisma.job.create({
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
      description: 'Software Engineering Intern position with internship leading to full-time opportunity.\n\nNumber of Students Hired: 3\n\nStudents Placed:\n- Mahasvan Mohan\n- Suha Nasrin\n- Raghav Vijayanand',
      pocName: 'Mahasvan Mohan, Suha Nasrin, Raghav Vijayanand',
    },
  })

  console.log('✅ Quest1 job added successfully!')
  console.log('Job ID:', job.id)
  console.log('Company:', job.company)
  console.log('Title:', job.title)
  console.log('Status:', job.status)
  console.log('CTC:', job.ctc)
  console.log('Students Hired: 3')
}

main()
  .catch((e) => {
    console.error('❌ Error adding job:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

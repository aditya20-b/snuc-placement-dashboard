import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📋 Adding Verizon Hiring Workflow Stages...\n')

  // Find the Verizon job
  const job = await prisma.job.findFirst({
    where: {
      company: 'Verizon',
      title: 'Software Engineer Intern'
    }
  })

  if (!job) {
    console.log('❌ Verizon job not found')
    return
  }

  console.log(`✓ Found Job: ${job.company} - ${job.title}`)
  console.log(`Job ID: ${job.id}\n`)

  // Define the workflow stages based on the hiring process
  const stages = [
    {
      stageName: 'Online Aptitude & Coding Test',
      stageType: 'ONLINE_ASSESSMENT',
      orderIndex: 1,
      description: 'Online assessment scheduled for 20th August 2025 at 6:30 PM. Includes aptitude and coding questions.'
    },
    {
      stageName: 'Group Discussion',
      stageType: 'GROUP_DISCUSSION',
      orderIndex: 2,
      description: 'Group discussion round to assess communication skills, teamwork, and analytical thinking.'
    },
    {
      stageName: 'Technical Interview',
      stageType: 'TECHNICAL_INTERVIEW',
      orderIndex: 3,
      description: 'Technical interview round covering data structures, algorithms, system design, and role-specific technical questions.'
    },
    {
      stageName: 'HR Discussion',
      stageType: 'HR_INTERVIEW',
      orderIndex: 4,
      description: 'HR round to discuss compensation, role expectations, cultural fit, and answer candidate queries.'
    }
  ]

  console.log('Creating workflow stages...\n')

  for (const stage of stages) {
    // Check if stage already exists
    const existing = await prisma.jobWorkflowStage.findFirst({
      where: {
        jobId: job.id,
        stageName: stage.stageName
      }
    })

    if (existing) {
      console.log(`⚠️  Stage already exists: ${stage.stageName}`)
      continue
    }

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

  // Verify all stages
  const allStages = await prisma.jobWorkflowStage.findMany({
    where: { jobId: job.id },
    orderBy: { orderIndex: 'asc' }
  })

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Verizon Hiring Workflow Summary:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Total Stages: ${allStages.length}\n`)

  allStages.forEach((stage) => {
    console.log(`${stage.orderIndex}. ${stage.stageName}`)
    console.log(`   Type: ${stage.stageType}`)
    console.log(`   Description: ${stage.description}\n`)
  })

  console.log('✅ Workflow stages added successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

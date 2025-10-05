import { prisma } from '../lib/db'

async function countStudents() {
  const total = await prisma.student.count()
  const byDepartment = await prisma.student.groupBy({
    by: ['department', 'section'],
    _count: true,
    orderBy: {
      department: 'asc',
    },
  })

  console.log(`\n📊 Total Students: ${total}\n`)
  console.log('📋 By Department & Section:')
  byDepartment.forEach(group => {
    console.log(`   ${group.department} (${group.section || 'N/A'}): ${group._count} students`)
  })

  await prisma.$disconnect()
}

countStudents()

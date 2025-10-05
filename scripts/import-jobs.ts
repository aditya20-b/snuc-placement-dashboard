import { readFileSync } from 'fs'
import { parse } from 'papaparse'
import { prisma } from '../lib/db'
import { JobType, JobCategory, JobStatus } from '@prisma/client'

interface JobCSVRow {
  company: string
  title: string
  type: string
  category: string
  status: string
  ctc?: string
  stipend?: string
  applyBy?: string
  eligibility?: string
  location?: string
  link?: string
  description?: string
}

async function importJobs(csvPath: string) {
  try {
    console.log(`📂 Reading CSV file: ${csvPath}`)
    const csvContent = readFileSync(csvPath, 'utf-8')

    console.log('📊 Parsing CSV data...')
    const parsed = parse<JobCSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    })

    if (parsed.errors.length > 0) {
      console.error('❌ CSV parsing errors:', parsed.errors)
      process.exit(1)
    }

    console.log(`✅ Found ${parsed.data.length} jobs to import\n`)

    let successCount = 0
    let errorCount = 0

    for (const [index, row] of parsed.data.entries()) {
      try {
        // Validate required fields
        if (!row.company || !row.title) {
          throw new Error('Missing required fields: company and title')
        }

        // Validate and parse type
        const type = row.type?.toUpperCase() as JobType
        if (!Object.values(JobType).includes(type)) {
          throw new Error(`Invalid type: ${row.type}. Must be INTERNSHIP, FTE, or BOTH`)
        }

        // Validate and parse category
        const category = row.category?.toUpperCase() as JobCategory
        if (!Object.values(JobCategory).includes(category)) {
          throw new Error(`Invalid category: ${row.category}. Must be DREAM, SUPER_DREAM, CORE, or OTHER`)
        }

        // Validate and parse status
        const status = row.status?.toUpperCase().replace(/\s/g, '_') as JobStatus
        if (!Object.values(JobStatus).includes(status)) {
          throw new Error(`Invalid status: ${row.status}. Must be OPEN, IN_PROGRESS, or CLOSED`)
        }

        // Parse applyBy date
        let applyBy: Date | null = null
        if (row.applyBy && row.applyBy.trim()) {
          applyBy = new Date(row.applyBy)
          if (isNaN(applyBy.getTime())) {
            throw new Error(`Invalid date format for applyBy: ${row.applyBy}. Use YYYY-MM-DD`)
          }
        }

        // Create job
        await prisma.job.create({
          data: {
            company: row.company.trim(),
            title: row.title.trim(),
            type,
            category,
            status,
            ctc: row.ctc?.trim() || null,
            stipend: row.stipend?.trim() || null,
            applyBy,
            eligibilityBranches: row.eligibility?.trim() || null,
            location: row.location?.trim() || null,
            link: row.link?.trim() || null,
            description: row.description?.trim() || null
          }
        })

        successCount++
        console.log(`✅ [${index + 1}/${parsed.data.length}] Imported: ${row.company} - ${row.title}`)
      } catch (error: any) {
        errorCount++
        console.error(`❌ [${index + 1}/${parsed.data.length}] Failed to import row:`, error.message)
        console.error(`   Data:`, row)
      }
    }

    console.log(`\n📊 Import Summary:`)
    console.log(`   ✅ Successfully imported: ${successCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    console.log(`   📝 Total rows: ${parsed.data.length}`)

    await prisma.$disconnect()
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

// Get CSV path from command line
const csvPath = process.argv[2]

if (!csvPath) {
  console.error('❌ Usage: pnpm import-jobs <path-to-csv>')
  console.error('   Example: pnpm import-jobs data/jobs.csv')
  process.exit(1)
}

importJobs(csvPath)

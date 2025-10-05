import { readFileSync } from 'fs'
import { parse } from 'papaparse'
import { prisma } from '../lib/db'
import { JobType, JobCategory, JobStatus } from '@prisma/client'

interface SSNJobRow {
  Company: string
  Title: string
  Status: string // "SNU Included", "SNU Company", "SNU Not Included", "Before Merger"
  'Target Branch': string
  'Apply By': string
  Type: string
  CTC: string
  Stipend: string
  'Status': string // This is the 9th column - job application status
  'Date Of Visit': string
}

// Map CSV Type to JobType enum
function mapJobType(typeStr: string): JobType {
  const normalized = typeStr.toLowerCase().trim()

  if (normalized.includes('intern + full time') || normalized.includes('intern+full time')) {
    return 'INTERN_PLUS_FTE'
  }
  if (normalized.includes('intern leads to full time')) {
    return 'INTERN_LEADS_TO_FTE'
  }
  if (normalized === 'full time' || normalized === 'full-time') {
    return 'FTE'
  }
  if (normalized.includes('summer intern')) {
    return 'SUMMER_INTERN'
  }
  if (normalized.includes('regular intern')) {
    return 'REGULAR_INTERN'
  }
  if (normalized === 'internship' || normalized === 'intern') {
    return 'INTERNSHIP'
  }

  return 'FTE' // Default
}

// Map CSV application status (column 9) to JobStatus enum
function mapJobStatus(statusStr: string): JobStatus {
  const normalized = statusStr.toLowerCase().trim()

  if (normalized.includes('open')) {
    return 'OPEN'
  }
  if (normalized.includes('in progress')) {
    return 'IN_PROGRESS'
  }
  if (normalized.includes('closed') || normalized.includes('completed')) {
    return 'CLOSED'
  }

  return 'OPEN' // Default
}

// Determine job category from CTC
function determineCategory(ctc: string | null): JobCategory {
  if (!ctc) return 'OTHER'

  const normalized = ctc.toLowerCase().replace(/\s+/g, '')

  // Extract numeric value
  const match = normalized.match(/(\d+(?:\.\d+)?)/)
  if (!match) return 'OTHER'

  const amount = parseFloat(match[1])

  // Category mapping:
  // MARQUE: 20L+
  // SUPER_DREAM: 10-20L
  // DREAM: 6-10L
  // REGULAR: 0-3.9L
  // OTHER: 4-6L

  if (amount >= 20) return 'MARQUE'
  if (amount >= 10) return 'SUPER_DREAM'
  if (amount >= 6) return 'DREAM'
  if (amount >= 4) return 'OTHER'

  return 'REGULAR'
}

// Parse date from CSV format "6 Oct 2025 by 09:00" or "15th Oct 2025"
function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || dateStr === 'N/A' || dateStr.trim() === '') return null

  try {
    // Remove "by HH:MM" part and ordinal indicators
    const cleaned = dateStr
      .replace(/by \d{2}:\d{2}/, '')
      .replace(/(\d+)(st|nd|rd|th)/g, '$1')
      .trim()

    const date = new Date(cleaned)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

// Clean CTC/Stipend strings
function cleanCompensation(value: string | null | undefined): string | null {
  if (!value || value === 'N/A' || value.trim() === '') return null
  return value.trim()
}

async function importSSNJobs(csvPath: string) {
  try {
    console.log(`📂 Reading CSV file: ${csvPath}`)
    const csvContent = readFileSync(csvPath, 'utf-8')

    console.log('📊 Parsing CSV data...')
    const parsed = parse<any>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    })

    if (parsed.errors.length > 0) {
      console.warn('⚠️  CSV parsing warnings:', parsed.errors)
    }

    console.log(`📋 Total rows found: ${parsed.data.length}`)

    // Filter for only "SNU Included" and "SNU Company"
    const filteredData = parsed.data.filter((row: any) => {
      const status = row['Status'] || row['status'] || ''
      return status === 'SNU Included' || status === 'SNU Company'
    })

    console.log(`✅ Filtered to ${filteredData.length} jobs (SNU Included + SNU Company)\n`)

    let successCount = 0
    let errorCount = 0
    const errors: any[] = []

    for (const [index, row] of filteredData.entries()) {
      try {
        const company = row['Company'] || row['company']
        const title = row['Title'] || row['title']
        const type = row['Type'] || row['type']
        const ctc = row['CTC'] || row['ctc']
        const stipend = row['Stipend'] || row['stipend']
        const targetBranch = row['Target Branch'] || row['target branch']
        const applyBy = row['Apply By'] || row['apply by']
        const dateOfVisit = row['Date Of Visit'] || row['date of visit']

        // Get application status from the 9th column (there are two "Status" columns)
        const keys = Object.keys(row)
        const statusKey = keys.find(k => k.toLowerCase().includes('status') && row[k] &&
          (row[k].includes('Open') || row[k].includes('Progress') || row[k].includes('Closed')))
        const applicationStatus = statusKey ? row[statusKey] : 'Open For Applications'

        if (!company || !title) {
          throw new Error('Missing required fields: Company or Title')
        }

        const jobData = {
          company: company.trim(),
          title: title.trim(),
          type: mapJobType(type || 'Full Time'),
          category: determineCategory(ctc),
          status: mapJobStatus(applicationStatus),
          ctc: cleanCompensation(ctc),
          stipend: cleanCompensation(stipend),
          applyBy: parseDate(applyBy),
          dateOfVisit: parseDate(dateOfVisit),
          eligibilityBranches: targetBranch?.trim() || null,
          description: `${title}\n\nEligible Branches: ${targetBranch || 'Not specified'}`,
        }

        await prisma.job.create({ data: jobData })

        successCount++
        console.log(
          `✅ [${index + 1}/${filteredData.length}] Imported: ${jobData.company} - ${jobData.title} (${jobData.category}, ${jobData.status})`
        )
      } catch (error: any) {
        errorCount++
        errors.push({ row: index + 1, data: row, error: error.message })
        console.error(`❌ [${index + 1}/${filteredData.length}] Failed:`, error.message)
      }
    }

    console.log(`\n📊 Import Summary:`)
    console.log(`   ✅ Successfully imported: ${successCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    console.log(`   📝 Total filtered rows: ${filteredData.length}`)

    if (errors.length > 0 && errors.length <= 5) {
      console.log(`\n❌ Errors:`)
      errors.forEach(e => {
        console.log(`   Row ${e.row}: ${e.error}`)
        console.log(`   Data:`, e.data)
      })
    }

    await prisma.$disconnect()
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message)
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

// Get CSV path from command line or use default
const csvPath = process.argv[2] || 'raw_data/SSN Placement Data - Sheet1.csv'

console.log('🚀 SSN Placement Data Import Script')
console.log('📌 Filtering: Only "SNU Included" and "SNU Company" entries\n')

importSSNJobs(csvPath)

import { readFileSync } from 'fs'
import { parse } from 'papaparse'
import { prisma } from '../lib/db'
import { EventCategory } from '@prisma/client'

interface EventCSVRow {
  title: string
  description?: string
  startTime: string
  endTime: string
  category: string
  link?: string
}

async function importEvents(csvPath: string) {
  try {
    console.log(`📂 Reading CSV file: ${csvPath}`)
    const csvContent = readFileSync(csvPath, 'utf-8')

    console.log('📊 Parsing CSV data...')
    const parsed = parse<EventCSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    })

    if (parsed.errors.length > 0) {
      console.error('❌ CSV parsing errors:', parsed.errors)
      process.exit(1)
    }

    console.log(`✅ Found ${parsed.data.length} events to import\n`)

    let successCount = 0
    let errorCount = 0

    for (const [index, row] of parsed.data.entries()) {
      try {
        // Validate required fields
        if (!row.title || !row.startTime || !row.endTime) {
          throw new Error('Missing required fields: title, startTime, and endTime are required')
        }

        // Validate and parse category
        const category = row.category?.toUpperCase().replace(/\s/g, '_') as EventCategory
        if (!Object.values(EventCategory).includes(category)) {
          throw new Error(
            `Invalid category: ${row.category}. Must be PLACEMENT, EXAM, INFO_SESSION, OA, INTERVIEW, DEADLINE, or OTHER`
          )
        }

        // Parse dates
        const startTime = new Date(row.startTime)
        const endTime = new Date(row.endTime)

        if (isNaN(startTime.getTime())) {
          throw new Error(`Invalid date format for startTime: ${row.startTime}. Use YYYY-MM-DD HH:MM`)
        }

        if (isNaN(endTime.getTime())) {
          throw new Error(`Invalid date format for endTime: ${row.endTime}. Use YYYY-MM-DD HH:MM`)
        }

        if (endTime < startTime) {
          throw new Error('endTime must be after startTime')
        }

        // Create event
        await prisma.event.create({
          data: {
            title: row.title.trim(),
            description: row.description?.trim() || null,
            startTime,
            endTime,
            category,
            link: row.link?.trim() || null
          }
        })

        successCount++
        console.log(`✅ [${index + 1}/${parsed.data.length}] Imported: ${row.title} (${row.category})`)
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
  console.error('❌ Usage: pnpm import-events <path-to-csv>')
  console.error('   Example: pnpm import-events data/events.csv')
  process.exit(1)
}

importEvents(csvPath)

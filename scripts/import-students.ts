import { readFileSync } from 'fs'
import { parse } from 'papaparse'
import { prisma } from '../lib/db'
import { PlacementStatus } from '@prisma/client'

interface StudentCSVRow {
  SN: string
  Name: string
  Rollno: string
  Dept: string
  Mobile: string
  'UG CGPA (upto 6th Semester)': string
  'History of Arrears': string
  'Current Backlogs/Arrears': string
}

function cleanValue(value: string | undefined | null): string | null {
  if (!value || value.trim() === '' || value.trim() === '_') return null
  return value.trim()
}

function parseFloatOrNull(value: string | undefined | null): number | null {
  const cleaned = cleanValue(value)
  if (!cleaned) return null

  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

function parseArrears(value: string | undefined | null): number {
  const cleaned = cleanValue(value)
  if (!cleaned) return 0

  const parsed = parseInt(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

// Extract batch year from department and roll number
function extractBatch(rollno: string, dept: string): string {
  // Roll numbers like "22110172" - first 2 digits are year (22 = 2022)
  const yearMatch = rollno.match(/^(\d{2})/)
  if (yearMatch) {
    const year = parseInt(yearMatch[1])
    const startYear = 2000 + year
    const endYear = startYear + 4
    return `${startYear}-${endYear}`
  }

  // Check if dept has batch info like "2022 - 2026"
  const batchMatch = dept.match(/(\d{4})\s*-\s*(\d{4})/)
  if (batchMatch) {
    return `${batchMatch[1]}-${batchMatch[2]}`
  }

  return '2022-2026' // Default
}

// Extract section from filename
function extractSection(filename: string): string | null {
  const match = filename.match(/\(([AB])\)/)
  return match ? match[1] : null
}

// Extract department from filename or dept column
function cleanDepartment(dept: string, filename: string): string {
  // Try to extract from filename first
  if (filename.includes('BTech AIDS')) return 'BTech AIDS'
  if (filename.includes('BTech CSE Cyber Security') || filename.includes('BTech CSE (CS)')) {
    return 'BTech CSE (Cyber Security)'
  }
  if (filename.includes('BTech CSE IoT')) return 'BTech CSE (IoT)'

  // Otherwise clean the dept value
  return dept.replace(/BTech\s+/gi, 'BTech ')
}

async function importStudents(csvPath: string) {
  try {
    console.log(`📂 Reading CSV file: ${csvPath}`)
    const csvContent = readFileSync(csvPath, 'utf-8')

    const filename = csvPath.split('/').pop() || ''
    const section = extractSection(filename)

    console.log('📊 Parsing CSV data...')

    // Split into lines and find the actual header row
    const lines = csvContent.split('\n')
    const headerIndex = lines.findIndex(line => line.includes('SN') && line.includes('Name') && line.includes('Rollno'))

    if (headerIndex === -1) {
      throw new Error('Could not find header row with SN, Name, Rollno')
    }

    console.log(`📋 Found header at line ${headerIndex + 1}`)

    // Join lines starting from header
    const cleanedContent = lines.slice(headerIndex).join('\n')

    const parsed = parse<any>(cleanedContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    })

    if (parsed.errors.length > 0) {
      console.warn('⚠️  CSV parsing warnings:', parsed.errors.slice(0, 3))
    }

    // Filter out header rows and empty rows
    const validData = parsed.data.filter((row: any) => {
      const name = row['Name'] || row['name']
      const rollno = row['Rollno'] || row['rollno'] || row['Rollno'] || row['Roll No']

      // Skip header rows and rows without required data
      if (!name || !rollno) return false
      if (name === 'Name' || name.includes('Shiv Nadar')) return false
      if (name.includes('Career Development') || name.includes('BTech AIDS')) return false

      return true
    })

    console.log(`📋 Total valid student rows: ${validData.length}`)
    console.log(`📌 Section: ${section || 'Not specified'}\n`)

    let successCount = 0
    let errorCount = 0
    let skippedCount = 0
    const errors: any[] = []

    for (const [index, row] of validData.entries()) {
      try {
        const name = row['Name'] || row['name']
        const rollno = row['Rollno'] || row['rollno']
        const dept = row['Dept'] || row['dept']
        const mobile = row['Mobile'] || row['mobile']
        const cgpaStr = row['UG CGPA (upto 6th Semester)'] || row['ug cgpa (upto 6th semester)'] || row['CGPA']
        const historyStr = row['History of Arrears'] || row['history of arrears']
        const currentStr = row['Current Backlogs/Arrears'] || row['current backlogs/arrears']

        if (!name || !rollno) {
          skippedCount++
          continue
        }

        // Check if student already exists
        const existing = await prisma.student.findUnique({
          where: { rollNumber: rollno.trim() }
        })

        if (existing) {
          console.log(`⏭️  [${index + 1}/${validData.length}] Skipped (exists): ${name} (${rollno})`)
          skippedCount++
          continue
        }

        const studentData = {
          name: name.trim(),
          rollNumber: rollno.trim(),
          email: null, // Can be added later by admin
          mobile: cleanValue(mobile),
          department: cleanDepartment(dept, filename),
          batch: extractBatch(rollno, dept),
          section: section,
          cgpa: parseFloatOrNull(cgpaStr),
          historyOfArrears: cleanValue(historyStr),
          currentArrears: parseArrears(currentStr),
          placementStatus: 'OPTED_IN' as PlacementStatus,
        }

        await prisma.student.create({ data: studentData })

        successCount++
        console.log(
          `✅ [${index + 1}/${validData.length}] Imported: ${studentData.name} (${studentData.rollNumber}) - CGPA: ${studentData.cgpa || 'N/A'}`
        )
      } catch (error: any) {
        errorCount++
        errors.push({ row: index + 1, data: row, error: error.message })
        console.error(`❌ [${index + 1}/${validData.length}] Failed:`, error.message)
      }
    }

    console.log(`\n📊 Import Summary:`)
    console.log(`   ✅ Successfully imported: ${successCount}`)
    console.log(`   ⏭️  Skipped (duplicates): ${skippedCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    console.log(`   📝 Total rows: ${validData.length}`)

    if (errors.length > 0 && errors.length <= 5) {
      console.log(`\n❌ Errors:`)
      errors.forEach(e => {
        console.log(`   Row ${e.row}: ${e.error}`)
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

// Get CSV path from command line
const csvPath = process.argv[2]

if (!csvPath) {
  console.error('❌ Usage: pnpm import-students <path-to-csv>')
  console.error('   Example: pnpm import-students "raw_data/BTech AIDS (A) 2026 batch.csv"')
  console.error('\n📁 Available files:')
  console.error('   • raw_data/BTech AIDS (A) 2026 batch(BTech AIDS (A) 2026 batch).csv')
  console.error('   • raw_data/BTech AIDS (B) 2026 batch 1(BTech AIDS (B) 2026 batch).csv')
  console.error('   • raw_data/BTech CSE Cyber Security 2026 batch(BTech CSE (CS) 2026 batch).csv')
  console.error('   • raw_data/BTech CSE IoT (A) 2026 batch(BTech CSE IoT (A) 2026 batch).csv')
  console.error('   • raw_data/BTech CSE IoT (B) 2026 batch(BTech CSE IoT (B) 2026 batch).csv')
  process.exit(1)
}

console.log('🚀 Student Data Import Script\n')
importStudents(csvPath)

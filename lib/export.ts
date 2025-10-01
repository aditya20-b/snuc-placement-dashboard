import { Event } from '@prisma/client'
import { createEvents, EventAttributes } from 'ics'
import Papa from 'papaparse'
import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { getCategoryLabel } from './utils'

// Define Job type to match Prisma schema
interface Job {
  id: string
  company: string
  title: string
  description: string | null
  aboutCompany: string | null
  ctc: string | null
  stipend: string | null
  type: string
  category: string
  status: string
  location: string | null
  link: string | null
  applyBy: Date | null
  dateOfVisit: Date | null
  hiringStartsOn: Date | null
  modeOfVisit: string | null
  minCGPA: number | null
  min10thPercentage: number | null
  min12thPercentage: number | null
  minDiplomaPercentage: number | null
  minSemPercentage: number | null
  maxCurrentArrears: number | null
  maxHistoryArrears: number | null
  genderRequirement: string
  eligibilityBranches: string | null
  otherEligibility: string | null
  pocName: string | null
  pocEmail: string | null
  pocPhone: string | null
  notAppliedPointsDeduct: number | null
  createdAt: Date
  updatedAt: Date
}

export function generateICS(events: Event[]): string {
  const icsEvents: EventAttributes[] = events.map(event => ({
    start: [
      event.startTime.getFullYear(),
      event.startTime.getMonth() + 1,
      event.startTime.getDate(),
      event.startTime.getHours(),
      event.startTime.getMinutes()
    ],
    end: [
      event.endTime.getFullYear(),
      event.endTime.getMonth() + 1,
      event.endTime.getDate(),
      event.endTime.getHours(),
      event.endTime.getMinutes()
    ],
    title: event.title,
    description: event.description || '',
    location: event.link || '',
    categories: [getCategoryLabel(event.category)],
    uid: event.id
  }))

  const { error, value } = createEvents(icsEvents)

  if (error) {
    throw new Error('Failed to generate ICS file')
  }

  return value || ''
}

export function generateCSV(events: Event[]): string {
  const csvData = events.map(event => ({
    Title: event.title,
    Description: event.description || '',
    'Start Time': format(event.startTime, 'yyyy-MM-dd HH:mm'),
    'End Time': format(event.endTime, 'yyyy-MM-dd HH:mm'),
    Category: getCategoryLabel(event.category),
    Link: event.link || '',
    'Created At': format(event.createdAt, 'yyyy-MM-dd HH:mm')
  }))

  return Papa.unparse(csvData)
}

export function generatePDF(events: Event[]): ArrayBuffer {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(20)
  doc.text('Placement Calendar', 20, 20)

  // Generated date
  doc.setFontSize(10)
  doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 20, 30)

  let yPosition = 50
  const pageHeight = doc.internal.pageSize.height

  events.forEach((event, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage()
      yPosition = 20
    }

    // Event title
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(event.title, 20, yPosition)
    yPosition += 10

    // Event details
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Category: ${getCategoryLabel(event.category)}`, 20, yPosition)
    yPosition += 5

    doc.text(`Start: ${format(event.startTime, 'yyyy-MM-dd HH:mm')}`, 20, yPosition)
    yPosition += 5

    doc.text(`End: ${format(event.endTime, 'yyyy-MM-dd HH:mm')}`, 20, yPosition)
    yPosition += 5

    if (event.description) {
      const splitDescription = doc.splitTextToSize(event.description, 170)
      doc.text(splitDescription, 20, yPosition)
      yPosition += splitDescription.length * 5
    }

    if (event.link) {
      doc.text(`Link: ${event.link}`, 20, yPosition)
      yPosition += 5
    }

    yPosition += 10 // Space between events
  })

  return doc.output('arraybuffer')
}

// Jobs export functions

export function generateJobsCSV(jobs: Job[]): string {
  const csvData = jobs.map(job => ({
    Company: job.company,
    Title: job.title,
    Type: job.type,
    Category: job.category,
    Status: job.status,
    CTC: job.ctc || 'N/A',
    Stipend: job.stipend || 'N/A',
    Location: job.location || 'N/A',
    'Apply By': job.applyBy ? format(job.applyBy, 'yyyy-MM-dd') : 'N/A',
    'Date of Visit': job.dateOfVisit ? format(job.dateOfVisit, 'yyyy-MM-dd') : 'N/A',
    'Mode of Visit': job.modeOfVisit || 'N/A',
    'Min CGPA': job.minCGPA || 'N/A',
    'Min 10th %': job.min10thPercentage || 'N/A',
    'Min 12th %': job.min12thPercentage || 'N/A',
    'Max Current Arrears': job.maxCurrentArrears ?? 'N/A',
    'Gender Requirement': job.genderRequirement || 'N/A',
    'Eligible Branches': job.eligibilityBranches || 'N/A',
    'POC Name': job.pocName || 'N/A',
    'POC Email': job.pocEmail || 'N/A',
    'POC Phone': job.pocPhone || 'N/A',
    Link: job.link || 'N/A',
    'Created At': format(job.createdAt, 'yyyy-MM-dd HH:mm')
  }))

  return Papa.unparse(csvData)
}

export function generateJobsPDF(jobs: Job[]): ArrayBuffer {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(20)
  doc.text('Placement Jobs Report', 20, 20)

  // Generated date
  doc.setFontSize(10)
  doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 20, 30)
  doc.text(`Total Jobs: ${jobs.length}`, 20, 37)

  let yPosition = 55
  const pageHeight = doc.internal.pageSize.height
  const pageWidth = doc.internal.pageSize.width
  const margin = 20
  const maxWidth = pageWidth - 2 * margin

  jobs.forEach((job, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = 20
    }

    // Job number and company
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${job.company}`, margin, yPosition)
    yPosition += 8

    // Job title
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    const titleText = doc.splitTextToSize(job.title, maxWidth)
    doc.text(titleText, margin, yPosition)
    yPosition += titleText.length * 6

    // Job details
    doc.setFontSize(9)
    yPosition += 2

    // Row 1
    doc.setFont('helvetica', 'bold')
    doc.text('Type:', margin, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(job.type, margin + 25, yPosition)

    doc.setFont('helvetica', 'bold')
    doc.text('Category:', margin + 80, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(job.category, margin + 110, yPosition)
    yPosition += 5

    // Row 2
    doc.setFont('helvetica', 'bold')
    doc.text('Status:', margin, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(job.status, margin + 25, yPosition)

    if (job.ctc) {
      doc.setFont('helvetica', 'bold')
      doc.text('CTC:', margin + 80, yPosition)
      doc.setFont('helvetica', 'normal')
      doc.text(job.ctc, margin + 110, yPosition)
    }
    yPosition += 5

    // Row 3 - Eligibility
    if (job.minCGPA || job.min10thPercentage) {
      doc.setFont('helvetica', 'bold')
      doc.text('Eligibility:', margin, yPosition)
      doc.setFont('helvetica', 'normal')
      let eligText = ''
      if (job.minCGPA) eligText += `CGPA: ${job.minCGPA}`
      if (job.min10thPercentage) eligText += ` | 10th: ${job.min10thPercentage}%`
      if (job.min12thPercentage) eligText += ` | 12th: ${job.min12thPercentage}%`
      doc.text(eligText, margin + 25, yPosition)
      yPosition += 5
    }

    // Row 4 - Dates
    if (job.applyBy) {
      doc.setFont('helvetica', 'bold')
      doc.text('Apply By:', margin, yPosition)
      doc.setFont('helvetica', 'normal')
      doc.text(format(job.applyBy, 'dd MMM yyyy'), margin + 25, yPosition)

      if (job.dateOfVisit) {
        doc.setFont('helvetica', 'bold')
        doc.text('Visit:', margin + 80, yPosition)
        doc.setFont('helvetica', 'normal')
        doc.text(format(job.dateOfVisit, 'dd MMM yyyy'), margin + 110, yPosition)
      }
      yPosition += 5
    }

    // Row 5 - POC
    if (job.pocName) {
      doc.setFont('helvetica', 'bold')
      doc.text('POC:', margin, yPosition)
      doc.setFont('helvetica', 'normal')
      let pocText = job.pocName
      if (job.pocEmail) pocText += ` (${job.pocEmail})`
      const pocSplit = doc.splitTextToSize(pocText, maxWidth - 25)
      doc.text(pocSplit, margin + 25, yPosition)
      yPosition += pocSplit.length * 5
    }

    // Description if available
    if (job.description && job.description.length > 0) {
      yPosition += 2
      doc.setFont('helvetica', 'italic')
      const descText = job.description.substring(0, 200) + (job.description.length > 200 ? '...' : '')
      const descSplit = doc.splitTextToSize(descText, maxWidth)
      doc.text(descSplit, margin, yPosition)
      yPosition += descSplit.length * 4
    }

    // Separator line
    yPosition += 3
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 8
  })

  return doc.output('arraybuffer')
}
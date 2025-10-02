'use client'

import { useState } from 'react'
import { Download, FileText, File } from 'lucide-react'
import toast from 'react-hot-toast'

interface JobsExportDropdownProps {
  status?: string
  type?: string
}

export function JobsExportDropdown({ status = 'all', type = 'all' }: JobsExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      if (status !== 'all') params.set('status', status)
      if (type !== 'all') params.set('type', type)

      const endpoint = format === 'csv' ? '/api/export/jobs-csv' : '/api/export/jobs-pdf'
      const url = `${endpoint}?${params.toString()}`

      const response = await fetch(url)
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `jobs-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)

      toast.success(`Jobs exported as ${format.toUpperCase()}`)
      setIsOpen(false)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export jobs')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  CSV
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Spreadsheet format
                </p>
              </div>
            </button>

            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors last:rounded-b-lg disabled:opacity-50"
            >
              <File className="w-4 h-4 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  PDF
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Document format
                </p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

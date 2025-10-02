'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

export function ExportDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const handleExport = async (format: 'ics' | 'csv' | 'pdf') => {
    setLoading(format)
    try {
      const response = await fetch(`/api/export/${format}`)

      if (!response.ok) {
        throw new Error(`Failed to export ${format.toUpperCase()}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `placement-calendar.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Calendar exported as ${format.toUpperCase()}!`)
      setIsOpen(false)
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()}`)
      console.error('Export error:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center space-x-2"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 z-10 border border-gray-200 dark:border-gray-700">
          <div className="py-1">
            <button
              onClick={() => handleExport('ics')}
              disabled={loading === 'ics'}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <span className="flex-1 text-left">
                {loading === 'ics' ? 'Exporting...' : 'Calendar (.ics)'}
              </span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={loading === 'csv'}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <span className="flex-1 text-left">
                {loading === 'csv' ? 'Exporting...' : 'Spreadsheet (.csv)'}
              </span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={loading === 'pdf'}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <span className="flex-1 text-left">
                {loading === 'pdf' ? 'Exporting...' : 'PDF Document (.pdf)'}
              </span>
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
'use client'

import { Download, File, FileText, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

interface Attachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedBy?: string | null
  createdAt: Date
}

interface JobAttachmentsProps {
  jobId: string
  attachments: Attachment[]
}

export function JobAttachments({ jobId, attachments }: JobAttachmentsProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return FileText
    if (fileType.includes('image')) return ImageIcon
    return File
  }

  const handleDownload = async (attachmentId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/attachments/${attachmentId}`)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('File downloaded')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  if (!attachments || attachments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No attachments available</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {attachments.map((attachment) => {
        const Icon = getFileIcon(attachment.fileType)
        return (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {attachment.fileName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(attachment.fileSize)}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDownload(attachment.id, attachment.fileName)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}

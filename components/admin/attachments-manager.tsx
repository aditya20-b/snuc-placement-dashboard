'use client'

import { useState, useRef } from 'react'
import { X, Upload, File, Download, Trash2, FileText, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

interface Attachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedBy?: string
  createdAt: Date
}

interface AttachmentsManagerProps {
  jobId: string
  jobTitle: string
  existingAttachments: Attachment[]
  onClose: () => void
  onSuccess: () => void
}

export function AttachmentsManager({
  jobId,
  jobTitle,
  existingAttachments,
  onClose,
  onSuccess
}: AttachmentsManagerProps) {
  const [attachments, setAttachments] = useState<Attachment[]>(existingAttachments)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/jobs/${jobId}/attachments`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const newAttachment = await response.json()
      setAttachments([newAttachment, ...attachments])
      toast.success('File uploaded successfully')

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload file')
    } finally {
      setIsUploading(false)
    }
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

  const handleDelete = async (attachmentId: string, fileName: string) => {
    if (!confirm(`Delete "${fileName}"?`)) return

    try {
      const response = await fetch(`/api/jobs/${jobId}/attachments/${attachmentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Delete failed')

      setAttachments(attachments.filter(a => a.id !== attachmentId))
      toast.success('File deleted')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete file')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manage Attachments
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {jobTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Upload Section */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              className="hidden"
              disabled={isUploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full flex flex-col items-center justify-center py-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
            >
              <Upload className="w-12 h-12 mb-2" />
              <p className="text-lg font-medium">
                {isUploading ? 'Uploading...' : 'Click to upload file'}
              </p>
              <p className="text-sm mt-1">
                PDF, DOC, DOCX, TXT, JPG, PNG (max 5MB)
              </p>
            </button>
          </div>

          {/* Attachments List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Uploaded Files ({attachments.length})
            </h3>

            {attachments.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No files uploaded yet
              </p>
            ) : (
              <div className="space-y-3">
                {attachments.map((attachment) => {
                  const Icon = getFileIcon(attachment.fileType)
                  return (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
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
                            {attachment.uploadedBy && ` • Uploaded by ${attachment.uploadedBy}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(attachment.id, attachment.fileName)}
                          className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(attachment.id, attachment.fileName)}
                          className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

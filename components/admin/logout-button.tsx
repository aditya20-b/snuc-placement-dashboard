'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to logout')
      }

      toast.success('Logged out successfully')
      router.push('/sign-in')
      router.refresh()
    } catch (error) {
      toast.error('Failed to logout')
      console.error('Logout error:', error)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="flex items-center space-x-2"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Logout</span>
    </Button>
  )
}
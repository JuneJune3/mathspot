import { createFileRoute } from '@tanstack/react-router'
import T9FlixHub from '../components/T9FlixHub'

export const Route = createFileRoute('/t9flix')({
  component: T9FlixPage,
})

function T9FlixPage() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <T9FlixHub />
      </div>
    </div>
  )
}
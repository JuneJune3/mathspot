import { createFileRoute } from '@tanstack/react-router'
import ProxyHub from '../components/ProxyHub'

export const Route = createFileRoute('/proxy')({
  component: ProxyPage,
})

function ProxyPage() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <ProxyHub />
      </div>
    </div>
  )
}
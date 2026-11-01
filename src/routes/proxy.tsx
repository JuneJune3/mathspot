import { createFileRoute } from '@tanstack/react-router'
import ProxyHub from '../components/ProxyHub'
import ProxySearch from '../components/ProxySearch'

export const Route = createFileRoute('/proxy')({
  component: ProxyPage,
})

function ProxyPage() {
  return (
    <div className="text-site-import-foreground">
      <div className="max-w-4xl mx-auto space-y-6">
        <ProxySearch />
        <ProxyHub />
      </div>
    </div>
  )
}
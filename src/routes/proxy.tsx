import { createFileRoute } from '@tanstack/react-router'
import ProxyHub from '../components/ProxyHub'
import ProxySearch from '../components/ProxySearch'

export const Route = createFileRoute('/proxy')({
  head: () => ({ meta: [{ title: 'Proxy — MathSpot' }, { name: 'description', content: 'Mathspot is the plsce where all math live' }, { property: 'og:title', content: 'Proxy — MathSpot' }, { property: 'og:description', content: 'Mathspot is the plsce where all math live' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
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
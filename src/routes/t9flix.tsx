import { createFileRoute } from '@tanstack/react-router'
import T9FlixHub from '../components/T9FlixHub'

export const Route = createFileRoute('/t9flix')({
  head: () => ({ meta: [{ title: 'T9Flix — MathSpot' }, { name: 'description', content: 'Mathspot is the plsce where all math live' }, { property: 'og:title', content: 'T9Flix — MathSpot' }, { property: 'og:description', content: 'Mathspot is the plsce where all math live' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
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
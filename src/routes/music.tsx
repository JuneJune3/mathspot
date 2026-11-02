import { createFileRoute } from '@tanstack/react-router'
import MusicPlayer from '../components/MusicPlayer'

export const Route = createFileRoute('/music')({
  head: () => ({ meta: [{ title: 'Music Hub — MathSpot' }, { name: 'description', content: 'Mathspot is the plsce where all math live' }, { property: 'og:title', content: 'Music Hub — MathSpot' }, { property: 'og:description', content: 'Mathspot is the plsce where all math live' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: MusicPage,
})

function MusicPage() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <MusicPlayer />
      </div>
    </div>
  )
}
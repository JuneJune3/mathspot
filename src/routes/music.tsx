import { createFileRoute } from '@tanstack/react-router'
import MusicPlayer from '../components/MusicPlayer'

export const Route = createFileRoute('/music')({
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
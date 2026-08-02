'use client'
// components/kids/kids-youtube.tsx
// YouTube channel section — featured video embed + recent video previews.
// Energetic gradient styling, lazy iframe, subscribe CTA.

import { motion, useReducedMotion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useState } from 'react'

// Inline YouTube logo (lucide-react doesn't ship this icon in the installed version)
function YoutubeLogo({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

// Real Qasberry Kids YouTube content
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/results?sp=mAEB&search_query=qasberrytech'
const FEATURED_VIDEO_ID   = '63k98uZzfi4'
const FEATURED_TITLE      = 'AI Can SEE?! 👀 | Fun AI Learning for Kids (Qasberry Kids)'

const RECENT_VIDEOS = [
  {
    id:    'hiXqtToKYVA',
    title: 'Robot Magic: Learning About AI for Toddlers',
    thumb: 'https://i.ytimg.com/vi/hiXqtToKYVA/hqdefault.jpg',
    url:   'https://youtu.be/hiXqtToKYVA',
  },
  {
    id:    'B1Jb6Kswb7k',
    title: 'What Is AI? 🤯 Kids Learn Artificial Intelligence with Qaz!',
    thumb: 'https://i.ytimg.com/vi/B1Jb6Kswb7k/hqdefault.jpg',
    url:   'https://youtu.be/B1Jb6Kswb7k',
  },
]

function VideoCard({ id, title, thumb, url }: { id: string; title: string; thumb: string; url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="group flex gap-3 items-start">
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-28 rounded-xl overflow-hidden border border-slate-700 group-hover:border-violet-500/40 transition-colors aspect-video bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumb}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <Play size={16} className="text-white ml-0.5" fill="white" />
        </div>
      </div>
      {/* Meta */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-violet-300 transition-colors">{title}</h4>
        <p className="mt-1 text-xs text-slate-500">QasberryTech</p>
      </div>
    </a>
  )
}

export function KidsYouTube() {
  const reduceMotion = useReducedMotion()
  const [videoLoaded, setVideoLoaded] = useState(false)

  return (
    <section className="py-16 sm:py-24 bg-slate-950 relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 h-[500px] w-[900px] bg-[radial-gradient(ellipse,rgba(239,68,68,0.08),transparent_60%)]" />
        <div className="absolute bottom-0 right-[5%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(99,91,255,0.1),transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-red-900/60 bg-red-950/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-300"
          >
            <YoutubeLogo size={13} className="text-red-400" />
            Free on YouTube
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="mt-5 text-3xl sm:text-[2.8rem] font-black tracking-tight text-white leading-tight"
          >
            Watch. Learn.{' '}
            <span className="bg-[linear-gradient(110deg,#f87171,#fb923c)] bg-clip-text text-transparent">
              Get inspired.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="mt-4 text-slate-400 text-base leading-relaxed"
          >
            The Qasberry Kids YouTube channel brings free AI education to every child — fun experiments, beginner-friendly lessons, and exciting AI projects you can try at home.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 items-start">
          {/* Featured video */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: reduceMotion ? 0 : 0.55 }}
          >
            <div className="relative rounded-[28px] overflow-hidden border border-slate-700 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.6)] aspect-video bg-slate-900">
              {videoLoaded ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${FEATURED_VIDEO_ID}?autoplay=1`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title="Qasberry Kids Featured Video"
                />
              ) : (
                <button
                  onClick={() => setVideoLoaded(true)}
                  id="kids-youtube-play-btn"
                  className="group w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 transition-all duration-300"
                  aria-label="Play featured video"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl scale-150" />
                    <div className="relative h-16 w-16 rounded-full bg-red-600 flex items-center justify-center shadow-[0_12px_30px_-8px_rgba(239,68,68,0.6)] group-hover:scale-110 transition-transform">
                      <Play size={26} className="text-white ml-1" fill="white" />
                    </div>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-white font-bold text-lg line-clamp-2 max-w-sm">{FEATURED_TITLE}</p>
                    <p className="text-slate-400 text-sm mt-1">QasberryTech</p>
                  </div>
                </button>
              )}
            </div>
          </motion.div>

          {/* Recent videos + subscribe */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: reduceMotion ? 0 : 0.55, delay: 0.1 }}
            className="space-y-6"
          >
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Recent Videos</h3>

            <div className="space-y-5">
              {RECENT_VIDEOS.map((video) => (
                <VideoCard key={video.id} id={video.id} title={video.title} thumb={video.thumb} url={video.url} />
              ))}
            </div>

            {/* Subscribe CTA */}
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              id="kids-youtube-subscribe-btn"
              className="group flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-[0_10px_28px_-12px_rgba(239,68,68,0.6)] hover:shadow-[0_14px_34px_-12px_rgba(239,68,68,0.7)] transition-all"
            >
              <YoutubeLogo size={18} />
              Subscribe on YouTube
            </a>
            <p className="text-xs text-slate-600 text-center">Free for everyone. No sign-up required.</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

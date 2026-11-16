'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import { Menu, X, ArrowRight } from 'lucide-react'
import { AUDIENCES } from './audiences'
import { ENABLED_TRACKS, SHOW_COMMUNITY } from '@/lib/features'
import { UserMenu } from '@/components/shared/user-menu'
import { ThemeToggle } from './robotics/theme-toggle'
import { useActiveSection } from './robotics/use-active-section'

const NAV_LINKS = [
	{ label: 'Courses', href: '/courses' },
	{ label: 'Why Qasberry', href: '/#features' },
	{ label: 'How it works', href: '/#how' },
	...(SHOW_COMMUNITY ? [{ label: 'Community', href: '/community' }] : []),
]

// The two audience tracks render as pill-style nav items
// Hidden tracks are filtered out via ENABLED_TRACKS (lib/features.ts)
const TRACK_NAV = [
	{
		key: 'kids',
		label: '✨ Kids & Teens',
		href: '/kids-teens',
		pill: 'bg-violet-100 text-violet-700 hover:bg-violet-200',
		pillDark: 'bg-rx-violet-tint text-rx-violet-ink hover:bg-rx-violet-line',
		mobile: 'text-violet-700 bg-violet-50 hover:bg-violet-100',
		mobileDark: 'text-rx-violet-ink bg-rx-violet-tint hover:bg-rx-violet-line',
	},
	{
		key: 'sales',
		label: '📈 Sales & Marketing',
		href: AUDIENCES[1].href,
		pill: 'bg-sky-100 text-sky-700 hover:bg-sky-200',
		pillDark: 'bg-rx-cyan-tint text-rx-cyan-ink hover:bg-rx-cyan-line',
		mobile: 'text-sky-700 bg-sky-50 hover:bg-sky-100',
		mobileDark: 'text-rx-cyan-ink bg-rx-cyan-tint hover:bg-rx-cyan-line',
	},
].filter((item) => ENABLED_TRACKS.includes(item.key))

// Homepage sections the in-page nav links point at (scroll-spied)
const SECTION_IDS = NAV_LINKS.filter((l) => l.href.startsWith('/#')).map((l) => l.href.slice(2))

type NavTheme = 'light' | 'robotics'

const THEME = {
	light: {
		shell: (scrolled: boolean) =>
			scrolled
				? 'bg-white/80 border-slate-200/80 backdrop-blur-xl shadow-[0_12px_40px_-24px_rgba(16,24,40,0.35)]'
				: 'bg-white/58 border-white/80 backdrop-blur-md shadow-[0_10px_35px_-26px_rgba(16,24,40,0.32)]',
		link: 'text-slate-600 hover:text-slate-950',
		linkActive: 'text-slate-950',
		activePill: 'bg-slate-100 border border-slate-200',
		trackActive: 'ring-1 ring-inset ring-violet-300',
		logo: '',
		signIn: 'text-slate-700 hover:text-slate-950',
		dashboard: 'border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-300',
		burger: 'border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-300',
		sheet: 'border-slate-200 bg-white',
		sheetLink: 'text-slate-700 hover:bg-slate-50 hover:text-slate-950',
		sheetLinkActive: 'bg-slate-100 text-slate-950',
		sheetBorder: 'border-slate-200',
		sheetSignIn: 'border-slate-200 text-slate-700',
		closeBtn: 'border-slate-200 text-slate-700',
	},
	// Robotics homepage: rx-* tokens, adapts to light and dark
	robotics: {
		shell: (scrolled: boolean) => (scrolled ? 'rx-nav rx-nav-scrolled' : 'rx-nav'),
		link: 'text-rx-body hover:text-rx-text',
		linkActive: 'text-rx-text',
		activePill: 'bg-rx-chip border border-rx-line-strong',
		trackActive: 'ring-1 ring-inset ring-rx-violet-line',
		logo: 'rx-logo',
		signIn: 'text-rx-text-2 hover:text-rx-text',
		dashboard: 'border-rx-line-strong text-rx-text-2 hover:text-rx-text hover:border-rx-line-hover',
		burger: 'border-rx-line-strong text-rx-text-2 hover:text-rx-text hover:border-rx-line-hover',
		sheet: 'border-rx-line-strong bg-rx-sheet',
		sheetLink: 'text-rx-text-2 hover:bg-rx-chip hover:text-rx-text',
		sheetLinkActive: 'bg-rx-violet-tint text-rx-violet-ink',
		sheetBorder: 'border-rx-line',
		sheetSignIn: 'border-rx-line-strong text-rx-text-2',
		closeBtn: 'border-rx-line-strong text-rx-text-2',
	},
} as const

export function MarketingNav({ theme = 'light' }: { theme?: NavTheme }) {
	const [scrolled, setScrolled] = useState(false)
	const [open, setOpen] = useState(false)
	const reduceMotion = useReducedMotion()
	const t = THEME[theme]
	const robotics = theme === 'robotics'
	const pathname = usePathname()
	const activeSection = useActiveSection(SECTION_IDS, pathname === '/')

	// Page links match their route and sub-routes (/courses/x → Courses);
	// homepage section links (/#id) match the section currently on screen.
	function isActive(href: string) {
		if (href.startsWith('/#')) return pathname === '/' && activeSection === href.slice(2)
		return pathname === href || pathname.startsWith(`${href}/`)
	}

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 12)
		onScroll()
		window.addEventListener('scroll', onScroll, { passive: true })
		return () => window.removeEventListener('scroll', onScroll)
	}, [])

	useEffect(() => {
		document.body.style.overflow = open ? 'hidden' : ''
		return () => {
			document.body.style.overflow = ''
		}
	}, [open])

	return (
		<header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4">
			{/* One size on every page and scroll position; scrolling only firms up the background */}
			<div
				className={`mx-auto h-[68px] max-w-[1200px] rounded-2xl border transition-[background-color,border-color,box-shadow] duration-300 ${t.shell(scrolled)}`}
			>
				<div className="h-full px-4 sm:px-5 flex items-center justify-between gap-5">
					<Link href="/" className="flex items-center" aria-label="Qasberry home">
						<Image
							src="/logo.png"
							alt="Qasberrytech logo"
							width={176}
							height={44}
							className={`h-8 w-auto ${t.logo}`}
							priority
						/>
					</Link>

					<nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
						{NAV_LINKS.map((item) => {
							const active = isActive(item.href)
							return (
								<Link
									key={item.href}
									href={item.href}
									aria-current={active ? 'page' : undefined}
									className={`relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${active ? t.linkActive : t.link}`}
								>
									{active && (
										// Shared layoutId: the pill slides from the old active link to the new one
										<motion.span
											layoutId="nav-active-pill"
											transition={reduceMotion ? { duration: 0 } : { type: 'spring', duration: 0.45, bounce: 0.15 }}
											className={`absolute inset-0 rounded-full ${t.activePill}`}
											aria-hidden
										/>
									)}
									<span className="relative">{item.label}</span>
								</Link>
							)
						})}
						{TRACK_NAV.map((item) => {
							const active = isActive(item.href)
							return (
								<Link
									key={item.href}
									href={item.href}
									aria-current={active ? 'page' : undefined}
									className={`ml-2 text-sm font-bold px-3 py-1 rounded-full transition-colors ${robotics ? item.pillDark : item.pill} ${active ? t.trackActive : ''}`}
								>
									{item.label}
								</Link>
							)
						})}
					</nav>

					<div className="hidden lg:flex items-center gap-2.5">
						{robotics && <ThemeToggle />}
						<SignedOut>
							<SignInButton mode="modal">
								<button className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors ${t.signIn}`}>
									Sign in
								</button>
							</SignInButton>
							<SignUpButton mode="modal">
								<button className="group inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[linear-gradient(120deg,#5b5ff7,#4f87ff,#3aa7fb)] text-white text-sm font-semibold shadow-[0_12px_28px_-16px_rgba(79,135,255,0.7)] hover:shadow-[0_16px_34px_-16px_rgba(79,135,255,0.8)] transition-all">
									Get started
									<ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
								</button>
							</SignUpButton>
						</SignedOut>
						<SignedIn>
							<Link
								href="/dashboard"
								className={`h-10 px-4 rounded-xl border text-sm font-semibold transition-colors inline-flex items-center ${t.dashboard}`}
							>
								Dashboard
							</Link>
							<UserMenu />
						</SignedIn>
					</div>

					<div className="lg:hidden flex items-center gap-2">
					{robotics && <ThemeToggle />}
					<button
						type="button"
						onClick={() => setOpen(true)}
						className={`h-10 w-10 rounded-xl border transition-colors inline-flex items-center justify-center ${t.burger}`}
						aria-label="Open menu"
					>
						<Menu size={18} />
					</button>
					</div>
				</div>
			</div>

			<AnimatePresence>
				{open && (
					<>
						<motion.button
							type="button"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setOpen(false)}
							className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
							aria-label="Close menu backdrop"
						/>
						<motion.div
							initial={{ opacity: 0, y: -8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: reduceMotion ? 0 : 0.22 }}
							className={`fixed top-4 inset-x-4 rounded-2xl border shadow-xl p-4 ${t.sheet}`}
						>
							<div className="flex items-center justify-between mb-4">
								<Image
									src="/logo.png"
									alt="Qasberrytech logo"
									width={160}
									height={40}
									className={`h-7 w-auto ${t.logo}`}
								/>
								<button
									type="button"
									onClick={() => setOpen(false)}
									className={`h-9 w-9 rounded-lg border inline-flex items-center justify-center ${t.closeBtn}`}
									aria-label="Close menu"
								>
									<X size={18} />
								</button>
							</div>
							<nav className="grid gap-1">
								{NAV_LINKS.map((item) => {
									const active = isActive(item.href)
									return (
										<Link
											key={item.href}
											href={item.href}
											onClick={() => setOpen(false)}
											aria-current={active ? 'page' : undefined}
											className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? t.sheetLinkActive : t.sheetLink}`}
										>
											{item.label}
										</Link>
									)
								})}
								{TRACK_NAV.map((item) => {
									const active = isActive(item.href)
									return (
										<Link
											key={item.href}
											href={item.href}
											onClick={() => setOpen(false)}
											aria-current={active ? 'page' : undefined}
											className={`px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${robotics ? item.mobileDark : item.mobile} ${active ? t.trackActive : ''}`}
										>
											{item.label}
										</Link>
									)
								})}
							</nav>
							<div className={`mt-4 pt-4 border-t ${t.sheetBorder}`}>
								<SignedOut>
									<SignInButton mode="modal">
										<button className={`w-full h-10 rounded-xl border text-sm font-semibold ${t.sheetSignIn}`}>
											Sign in
										</button>
									</SignInButton>
								</SignedOut>
								<SignedIn>
									<div className="flex items-center justify-between gap-3">
										<Link
											href="/dashboard"
											onClick={() => setOpen(false)}
											className={`flex-1 h-10 rounded-xl border text-sm font-semibold inline-flex items-center justify-center ${t.sheetSignIn}`}
										>
											Dashboard
										</Link>
										<UserMenu />
									</div>
								</SignedIn>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</header>
	)
}

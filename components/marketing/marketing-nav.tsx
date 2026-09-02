'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Menu, X, ArrowRight } from 'lucide-react'

const NAV_LINKS = [
	{ label: 'Features', href: '/#features' },
	{ label: 'Careers', href: '/#careers' },
	{ label: 'How it works', href: '/#how' },
	{ label: 'Community', href: '/community' },
]

// Kids is a special nav item rendered separately with a badge pill style
const KIDS_NAV = { label: '✨ Kids & Youth', href: '/kids' }

export function MarketingNav() {
	const [scrolled, setScrolled] = useState(false)
	const [open, setOpen] = useState(false)
	const reduceMotion = useReducedMotion()

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
			<motion.div
				initial={false}
				animate={{
					maxWidth: scrolled ? 1100 : 1200,
					height: scrolled ? 62 : 72,
				}}
				transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
				className={[
					'mx-auto rounded-2xl border',
					scrolled
						? 'bg-white/80 border-slate-200/80 backdrop-blur-xl shadow-[0_12px_40px_-24px_rgba(16,24,40,0.35)]'
						: 'bg-white/58 border-white/80 backdrop-blur-md shadow-[0_10px_35px_-26px_rgba(16,24,40,0.32)]',
				].join(' ')}
			>
				<div className="h-full px-4 sm:px-5 flex items-center justify-between gap-5">
					<Link href="/" className="flex items-center" aria-label="Qasberry home">
						<Image src="/logo.png" alt="Qasberrytech logo" width={176} height={44} className="h-8 w-auto" priority />
					</Link>

					<nav className="hidden md:flex items-center gap-7" aria-label="Primary navigation">
						{NAV_LINKS.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors"
							>
								{item.label}
							</Link>
						))}
						{/* Kids pill */}
						<Link
							href={KIDS_NAV.href}
							className="text-sm font-bold px-3 py-1 rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors"
						>
							{KIDS_NAV.label}
						</Link>
					</nav>

					<div className="hidden md:flex items-center gap-2.5">
						<SignedOut>
							<SignInButton mode="modal">
								<button className="h-10 px-4 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors">
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
							<Link href="/dashboard" className="h-10 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:text-slate-950 hover:border-slate-300 transition-colors inline-flex items-center">
								Dashboard
							</Link>
							<UserButton afterSignOutUrl="/" />
						</SignedIn>
					</div>

					<button
						type="button"
						onClick={() => setOpen(true)}
						className="md:hidden h-10 w-10 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-300 transition-colors inline-flex items-center justify-center"
						aria-label="Open menu"
					>
						<Menu size={18} />
					</button>
				</div>
			</motion.div>

			<AnimatePresence>
				{open && (
					<>
						<motion.button
							type="button"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setOpen(false)}
							className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm"
							aria-label="Close menu backdrop"
						/>
						<motion.div
							initial={{ opacity: 0, y: -8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: reduceMotion ? 0 : 0.22 }}
							className="fixed top-4 inset-x-4 rounded-2xl border border-slate-200 bg-white shadow-xl p-4"
						>
							<div className="flex items-center justify-between mb-4">
								<Image src="/logo.png" alt="Qasberrytech logo" width={160} height={40} className="h-7 w-auto" />
								<button
									type="button"
									onClick={() => setOpen(false)}
									className="h-9 w-9 rounded-lg border border-slate-200 text-slate-700 inline-flex items-center justify-center"
									aria-label="Close menu"
								>
									<X size={18} />
								</button>
							</div>
							<nav className="grid gap-1">
								{NAV_LINKS.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => setOpen(false)}
										className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors"
									>
										{item.label}
									</Link>
								))}
								{/* Kids pill */}
								<Link
									href={KIDS_NAV.href}
									onClick={() => setOpen(false)}
									className="px-3 py-2.5 rounded-lg text-sm font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors"
								>
									{KIDS_NAV.label}
								</Link>
							</nav>
							<div className="mt-4 pt-4 border-t border-slate-200">
								<SignedOut>
									<SignInButton mode="modal">
										<button className="w-full h-10 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold">
											Sign in
										</button>
									</SignInButton>
								</SignedOut>
								<SignedIn>
									<div className="flex items-center justify-between gap-3">
										<Link
											href="/dashboard"
											onClick={() => setOpen(false)}
											className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold inline-flex items-center justify-center"
										>
											Dashboard
										</Link>
										<UserButton />
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

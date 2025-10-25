'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const sitename = process.env.NEXT_PUBLIC_SITE_NAME;
const sitetag = process.env.NEXT_PUBLIC_SITE_TAGLINE;

const ANIM = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } };

export default function AboutPage() {
	const cardBase = 'rounded-2xl p-6 shadow-sm border transition-colors';

	const cardLight = 'bg-white border-gray-100';
	const cardDark = 'dark:bg-gray-800 dark:border-gray-700';

	const textMuted = 'text-gray-700 dark:text-gray-300';
	const heading = 'font-extrabold tracking-tight leading-tight';

	const features = [
		{
			title: 'What Sets Us Apart',
			body: 'We ground our coverage in research and expert review so the advice you read is practical and reliable.',
		},
		{
			title: 'Audience-First Writing',
			body: 'Complex ideas are broken down into concise, actionable pieces so anyone can follow them.',
		},
		{
			title: 'Community & Feedback',
			body: 'Reader feedback directly influences our topics — tell us what you want to see.',
		},
	];

	const bullets = [
		'Accurate, well-researched articles',
		'Actionable how-tos and guides',
		'Timely news and deep analysis',
	];

	return (
		<main className="min-h-screen  transition-colors duration-200">
			<div className="max-w-6xl mx-auto px-6 py-20">
				{/* HERO */}
				<section className="grid gap-12 lg:grid-cols-12 items-center">
					<div className="lg:col-span-7">
						<motion.h1
							initial="hidden"
							animate="visible"
							variants={ANIM}
							transition={{ duration: 0.45 }}
							className={`text-4xl sm:text-5xl ${heading} text-black dark:text-white`}>
							Welcome to{' '}
							<span className="text-indigo-600 dark:text-indigo-400">
								{sitename}
							</span>{' '}
							— {sitetag}
						</motion.h1>

						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.12, duration: 0.5 }}
							className={`mt-6 text-lg sm:text-xl ${textMuted} max-w-2xl`}>
							We explore the latest advancements in technology and gaming,
							delivering clear, reliable, and useful content — from practical
							how-tos to concise analysis.
						</motion.p>

						<div className="mt-8 flex flex-wrap gap-3">
							<Link
								href="/feed"
								className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-medium shadow-sm border border-indigo-100 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
								aria-label="Browse articles">
								Browse Articles
							</Link>

							<Link
								href="/contact-us"
								className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-medium border border-gray-200 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
								aria-label="Contact us">
								Contact Us
							</Link>
						</div>
					</div>

					<div className="lg:col-span-5">
						<motion.div
							initial={{ opacity: 0, scale: 0.995 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.45 }}
							className={`${cardBase} ${cardLight} ${cardDark}`}>
							<h3 className="text-lg font-semibold text-black dark:text-white">
								Our Mission
							</h3>
							<p className={`mt-3 ${textMuted}`}>
								To bridge the gap between complex technology concepts and
								everyday readers. We provide accessible, well-researched content
								that helps both newcomers and experienced readers make smarter
								decisions.
							</p>

							<ul className="mt-5 space-y-3">
								{bullets.map((b) => (
									<li
										key={b}
										className="flex items-start gap-3">
										<span
											className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold"
											aria-hidden>
											✓
										</span>
										<span className={`leading-tight ${textMuted}`}>{b}</span>
									</li>
								))}
							</ul>
						</motion.div>
					</div>
				</section>

				{/* FEATURES / WHY US */}
				<section className="mt-16 grid gap-8 lg:grid-cols-3">
					{features.map((f) => (
						<article
							key={f.title}
							className={`${cardBase} ${cardLight} ${cardDark}`}
							aria-labelledby={f.title}>
							<h4
								id={f.title}
								className="font-semibold text-black dark:text-white">
								{f.title}
							</h4>
							<p className={`mt-3 ${textMuted} text-sm`}>{f.body}</p>
						</article>
					))}
				</section>

				{/* TRANSPARENCY */}
				<section className="mt-16 max-w-3xl">
					<h3 className="text-xl font-semibold text-black dark:text-white">
						Transparency & AI Usage
					</h3>
					<p className={`mt-4 ${textMuted}`}>
						Some drafts or supporting materials may be created or enhanced using
						AI tools to speed research or copy-editing. Every piece is reviewed
						by our editorial team to ensure accuracy and relevance. We maintain
						a clear editorial standard.
					</p>
				</section>

				{/* FOOTER CTA */}
				<section className="mt-14 rounded-lg p-8 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 transition-colors">
					<div className="max-w-4xl">
						<h4 className="text-2xl font-semibold">Join the journey</h4>
						<p className={`mt-2 ${textMuted}`}>
							Follow {sitename} for the latest in tech and gaming. Have an idea
							or question? Reach out — we read every message.
						</p>

						<div className="mt-6 flex flex-col sm:flex-row gap-3">
							<Link
								href="/subscribe"
								className="rounded-full px-6 py-3 inline-block bg-indigo-600 text-white font-semibold hover:opacity-95 transition-opacity"
								aria-label="Subscribe">
								Subscribe
							</Link>

							<a
								href="mailto:hello@spechype.com"
								className="rounded-full px-6 py-3 inline-block border border-gray-200 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
								aria-label="Email us">
								Email Us
							</a>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
const sitename = process.env.NEXT_PUBLIC_SITE_NAME;
const sitetag = process.env.NEXT_PUBLIC_SITE_TAGLINE;



export default function AboutPage() {
	return (
		<main className="min-h-screen bg-white text-gray-900">
			<div className="max-w-6xl mx-auto px-6 py-20">
				{/* HERO */}
				<section className="grid gap-12 lg:grid-cols-12 items-center">
					<div className="lg:col-span-7">
						<motion.h1
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.45 }}
							className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-black">
							Welcome to <span className="text-indigo-600">{sitename}</span> —
							{sitetag}
						</motion.h1>

						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.12, duration: 0.5 }}
							className="mt-6 text-lg sm:text-xl text-gray-700 max-w-2xl">
							We explore the latest advancements in technology and gaming,
							delivering clear, reliable, and useful content — from practical
							how-tos to concise analysis.
						</motion.p>

						<div className="mt-8 flex flex-wrap gap-3">
							<Link
								href="/feed"
								className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-medium shadow-sm border border-indigo-100 bg-white text-indigo-600 hover:bg-indigo-50">
								Browse Articles
							</Link>

							<Link
								href="/contact"
								className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-medium border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50">
								Contact Us
							</Link>
						</div>
					</div>

					<div className="lg:col-span-5">
						<motion.div
							initial={{ opacity: 0, scale: 0.995 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.45 }}
							className="rounded-2xl p-6 shadow-sm bg-white border border-gray-100">
							<h3 className="text-lg font-semibold text-black">Our Mission</h3>
							<p className="mt-3 text-gray-700">
								To bridge the gap between complex technology concepts and
								everyday readers. We provide accessible, well-researched content
								that helps both newcomers and experienced readers make smarter
								decisions.
							</p>

							<ul className="mt-5 space-y-3">
								<li className="flex items-start gap-3">
									<span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 font-semibold">
										✓
									</span>
									<span className="text-gray-700">
										Accurate, well-researched articles
									</span>
								</li>
								<li className="flex items-start gap-3">
									<span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 font-semibold">
										✓
									</span>
									<span className="text-gray-700">
										Actionable how-tos and guides
									</span>
								</li>
								<li className="flex items-start gap-3">
									<span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 font-semibold">
										✓
									</span>
									<span className="text-gray-700">
										Timely news and deep analysis
									</span>
								</li>
							</ul>
						</motion.div>
					</div>
				</section>

				{/* FEATURES / WHY US */}
				<section className="mt-16 grid gap-8 lg:grid-cols-3">
					<article className="rounded-xl p-6 bg-white shadow-sm border border-gray-100">
						<h4 className="font-semibold text-black">What Sets Us Apart</h4>
						<p className="mt-3 text-gray-700 text-sm">
							We ground our coverage in research and expert review so the advice
							you read is practical and reliable.
						</p>
					</article>

					<article className="rounded-xl p-6 bg-white shadow-sm border border-gray-100">
						<h4 className="font-semibold text-black">Audience-First Writing</h4>
						<p className="mt-3 text-gray-700 text-sm">
							Complex ideas are broken down into concise, actionable pieces so
							anyone can follow them.
						</p>
					</article>

					<article className="rounded-xl p-6 bg-white shadow-sm border border-gray-100">
						<h4 className="font-semibold text-black">Community & Feedback</h4>
						<p className="mt-3 text-gray-700 text-sm">
							Reader feedback directly influences our topics — tell us what you
							want to see.
						</p>
					</article>
				</section>

				{/* TRANSPARENCY */}
				<section className="mt-16 max-w-3xl">
					<h3 className="text-xl font-semibold text-black">
						Transparency & AI Usage
					</h3>
					<p className="mt-4 text-gray-700">
						Some drafts or supporting materials may be created or enhanced using
						AI tools to speed research or copy-editing. Every piece is reviewed
						by our editorial team to ensure accuracy and relevance. We maintain
						a clear editorial standard.
					</p>
				</section>

				{/* FOOTER CTA */}
				<section className="mt-14 rounded-lg p-8 bg-gray-50 text-gray-900">
					<div className="max-w-4xl">
						<h4 className="text-2xl font-semibold">Join the journey</h4>
						<p className="mt-2 text-gray-700">
							Follow {sitename} for the latest in tech and gaming. Have an idea
							or question? Reach out — we read every message.
						</p>

						<div className="mt-6 flex flex-col sm:flex-row gap-3">
							<a
								href="/subscribe"
								className="rounded-full px-6 py-3 inline-block bg-indigo-600 text-white font-semibold hover:opacity-95">
								Subscribe
							</a>

							<a
								href="mailto:hello@spechype.com"
								className="rounded-full px-6 py-3 inline-block border border-gray-200 text-gray-800 font-semibold hover:bg-gray-100">
								Email Us
							</a>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}

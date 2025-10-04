// components/HomeClient.tsx
'use client';

import React, { useState } from 'react';
import {
	ArrowRight,
	Star,
	CheckCircle,
	ChevronRight,
	Users,
	BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { features, platformTabs, socialProofStats } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';

export default function HomeClient() {
	const [activeTab, setActiveTab] = useState(0);

	return (
		<div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 relative">
			{/* Hero — asymmetrical split with angled card */}
			<header
				className="relative z-10 pt-16 pb-6 px-4 sm:px-6 lg:pt-24 lg:pb-8"
				id="Home">
				<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
					{/* Left copy (stacked on mobile) */}
					<div className="lg:col-span-6 space-y-5">
						<div
							className="inline-flex items-center gap-3 px-3 py-1 rounded-full w-max
										bg-emerald-50/70 dark:bg-emerald-900/30">
							<Users className="w-4 h-4 text-emerald-600 dark:text-emerald-200" />
							<span className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
								Trusted by creators
							</span>
						</div>

						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
							Create content faster —{' '}
							<span className="text-indigo-600 dark:text-indigo-400">
								with focus
							</span>
							, not friction.
						</h1>

						<p className="max-w-2xl text-gray-600 dark:text-gray-300 text-sm sm:text-base">
							A clean, distraction-free workflow for creators who value speed
							and clarity. Minimal controls, maximum output.
						</p>

						<div className="flex flex-col sm:flex-row gap-3 mt-3 sm:mt-4">
							<Link
								href="/feed"
								className="w-full sm:w-auto">
								<Button
									size="lg"
									className="w-full sm:w-auto rounded-full px-6 py-3 flex items-center justify-center gap-3"
									aria-label="Start explore">
									Start Explore
									<ArrowRight className="w-4 h-4" />
								</Button>
							</Link>
						</div>

						{/* Compact trust strip */}
						<div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-600 dark:text-gray-300">
							<strong className="text-gray-800 dark:text-gray-100">10k+</strong>
							<span>active creators ·</span>

							<div className="flex items-center gap-1">
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										className="w-4 h-4 text-yellow-400 dark:text-yellow-400"
									/>
								))}
								<span className="ml-1">4.9</span>
							</div>
						</div>
					</div>

					{/* Right angled illustration (responsive) */}
					<div className="lg:col-span-6 relative flex justify-center lg:justify-end px-0 sm:px-6">
						<div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-md transform lg:rotate-2 rotate-0 shadow-2xl dark:shadow-none rounded-3xl overflow-hidden mx-auto">
							{/* Image wrapper - fixed aspect / responsive height */}
							<div className="bg-gradient-to-br from-indigo-50 to-emerald-50 dark:from-indigo-900 dark:to-emerald-900 p-5 sm:p-8">
								<div className="rounded-2xl overflow-hidden w-full h-[200px] sm:h-56 md:h-64 lg:h-72 bg-gray-50 dark:bg-gray-800">
									<Image
										src="/banner.png"
										alt="banner"
										width={520}
										height={420}
										className="object-cover w-full h-full"
										priority
									/>
								</div>
							</div>

							{/* card that overlaps the image */}
							<div className="bg-white dark:bg-gray-800 p-3 sm:p-6 -mt-8 sm:-mt-10 rounded-b-3xl border border-gray-100 dark:border-gray-700">
								<div className="flex items-center justify-between">
									<div>
										<div className="text-sm font-semibold text-gray-700 dark:text-gray-100">
											Creator Dashboard
										</div>
										<div className="text-xs text-gray-500 dark:text-gray-400">
											Drafts · Analytics · Monetization
										</div>
									</div>

									<div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
										<span className="px-2 py-1 text-xs rounded-full bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-700">
											New
										</span>
										<ChevronRight
											className="w-4 h-4"
											aria-hidden="true"
										/>
									</div>
								</div>

								<div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
									Quick actions, scheduled posts, and a live preview — all in
									one compact view.
								</div>
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Features — horizontal scroll + card peeking */}
			<section
				id="features"
				className="relative z-10 px-6 sm:px-12 py-12">
				<div className="max-w-7xl mx-auto">
					<h3 className="text-xl font-bold mb-4 dark:text-gray-100">
						Key features
					</h3>
					<p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
						A compact set of tools designed so you don't get lost in menus.
					</p>

					<div className="flex gap-4 overflow-x-auto pb-4">
						{features.map((f, idx) => (
							<div
								key={idx}
								className="min-w-[260px] bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
								<div
									className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-3`}>
									<f.icon className="w-5 h-5 text-white" />
								</div>
								<h4 className="font-semibold text-gray-800 dark:text-gray-100">
									{f.title}
								</h4>
								<p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
									{f.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Platform stepper (offset card) */}
			<section
				className="relative z-10 px-6 sm:px-12 py-8"
				id="How it works">
				<div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 items-start">
					<div className="lg:col-span-1">
						<div className="sticky top-28 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
							<h5 className="font-bold mb-2 dark:text-gray-100">
								How it works
							</h5>
							<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
								Follow three simple steps to go from idea to published post.
							</p>

							<div className="flex flex-col gap-3">
								{platformTabs.map((tab, i) => (
									<button
										key={i}
										onClick={() => setActiveTab(i)}
										className={`flex items-center gap-3 p-3 rounded-xl text-left w-full transition
											${
												activeTab === i ?
													'bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800 shadow-sm'
												:	'bg-white dark:bg-gray-800 border border-gray-50 dark:border-gray-700'
											}`}>
										<div
											className={`w-10 h-10 rounded-lg flex items-center justify-center ${
												activeTab === i ?
													'bg-indigo-600 text-white'
												:	'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
											}`}>
											<tab.icon className="w-5 h-5" />
										</div>
										<div>
											<div className="font-medium dark:text-gray-100">
												{tab.title}
											</div>
											<div className="text-xs text-gray-500 dark:text-gray-400">
												{tab.short}
											</div>
										</div>
									</button>
								))}
							</div>
						</div>
					</div>

					<div className="lg:col-span-2">
						<div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
							<CardHeader>
								<CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
									{platformTabs[activeTab].title}
								</CardTitle>
								<CardDescription className="text-sm text-gray-600 dark:text-gray-300">
									{platformTabs[activeTab].description}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid sm:grid-cols-2 gap-4">
									{platformTabs[activeTab].features.map((f, i) => (
										<div
											key={i}
											className="flex items-start gap-3">
											<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-1" />
											<div className="text-sm text-gray-700 dark:text-gray-200">
												{f}
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</div>
					</div>
				</div>
			</section>

			{/* Social proof compact chips */}
			<section className="px-6 sm:px-12 py-8">
				<div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center justify-center">
					{socialProofStats.map((s, i) => (
						<div
							key={i}
							className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-full px-4 py-2 border border-gray-100 dark:border-gray-700 shadow-sm">
							<div className="w-9 h-9 bg-white dark:bg-gray-900 rounded-full grid place-items-center">
								<s.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
							</div>
							<div className="text-sm">
								<div className="font-semibold text-gray-900 dark:text-gray-100">
									{s.metric}
								</div>
								<div className="text-xs text-gray-500 dark:text-gray-400">
									{s.label}
								</div>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Testimonials — speech bubble cards */}
			<section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 sm:mb-8">
						<span className="gradient-text-primary">Ready to create?</span>
					</h2>
					<p className="text-xl text-gray-400 dark:text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto">
						Join thousands of creators who are already building their audience
						and growing their business with our AI-powered platform.
					</p>

					<div className="flex flex-col sm:flex-row gap-6 justify-center">
						<Link href="/feed">
							<div className="rounded-full w-full sm:w-auto bg-gray-900 dark:bg-indigo-600 px-4 py-2 text-white hover:bg-gray-700 dark:hover:bg-indigo-500 transition">
								Explore the Feed
							</div>
						</Link>
					</div>
				</div>
			</section>

			{/* Compact bottom action bar for mobile (optional; not present) */}
		</div>
	);
}

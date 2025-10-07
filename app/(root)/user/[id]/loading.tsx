import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { StartupCardSkeleton } from '@/components/StartupCard';

export default function Loading() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 py-10">
			<div className="max-w-7xl mx-auto px-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
					{/* Profile Card (left) */}
					<aside className="lg:sticky lg:top-24">
						<div className="overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black/5 dark:ring-white/5">
							<div className="p-6 border-b border-gray-100 dark:border-gray-700">
								<div className="flex items-center gap-5">
									<Skeleton className="w-20 h-20 rounded-2xl" />
									<div className="flex-1">
										<Skeleton className="h-5 w-40 mb-2" />
										<Skeleton className="h-4 w-24" />
									</div>
								</div>
								<Skeleton className="h-16 w-full mt-4" />
							</div>
						</div>
					</aside>

					{/* Startups & content (right) */}
					<section className="lg:col-span-2">
						<div className="flex items-center justify-between mb-6">
							<Skeleton className="h-6 w-40" />
							<Skeleton className="h-4 w-32" />
						</div>

						<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
							<StartupCardSkeleton />
						</ul>

						<div className="rounded-xl p-6 bg-white dark:bg-gray-800 border border-gray-50 dark:border-gray-700 shadow-sm mt-6">
							<Skeleton className="h-5 w-32 mb-2" />
							<Skeleton className="h-16 w-full" />
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}

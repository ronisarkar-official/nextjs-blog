import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	const cards = Array.from({ length: 3 });

	return (
		<main
			role="status"
			aria-busy="true"
			className="min-h-screen bg-white dark:bg-[#020618] text-gray-900 dark:text-gray-100 transition-colors duration-200">
			<div className="max-w-7xl mx-auto px-16 py-12 mt-16">
				<span className="sr-only">Loading content…</span>

				<div className="mb-8 items-center">
					<Skeleton className="h-11 w-full max-w-3xl rounded-xl" />
				</div>

				<div className="mb-6">
					<Skeleton className="h-5 w-28 rounded-full" />
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{cards.map((_, idx) => (
						<article
							key={idx}
							className="relative rounded-xl overflow-hidden border bg-white/60 dark:bg-neutral-900/40 border-gray-200 dark:border-gray-800 p-4 shadow-sm backdrop-blur-sm">
							<div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
								<Skeleton className="absolute inset-0 w-full h-full" />

								<div className="absolute top-3 right-3">
									<div className="flex items-center gap-2">
										<Skeleton className="h-6 w-6 rounded-full" />
										<Skeleton className="h-5 w-10 rounded-full" />
									</div>
								</div>

								<div className="absolute left-3 bottom-3 flex items-center gap-2">
									<Skeleton className="h-8 w-8 rounded-full" />
									<Skeleton className="h-4 w-20 rounded-md" />
								</div>
							</div>

							<div className="mb-2">
								<Skeleton className="h-3 w-20 rounded-full" />
							</div>

							<div className="mb-3">
								<Skeleton className="h-6 w-11/12 rounded-md" />
							</div>

							<div className="space-y-2 mb-4">
								<Skeleton className="h-3 w-full rounded-md" />
								<Skeleton className="h-3 w-10/12 rounded-md" />
								<Skeleton className="h-3 w-8/12 rounded-md" />
							</div>

							<div className="flex items-center justify-between gap-3">
								<div className="flex items-center gap-3">
									<Skeleton className="h-7 w-20 rounded-full" />
									<Skeleton className="h-7 w-16 rounded-full" />
								</div>
								<div className="hidden sm:flex items-center gap-3">
									<Skeleton className="h-4 w-20" />
								</div>
							</div>
						</article>
					))}
				</div>
			</div>
		</main>
	);
}

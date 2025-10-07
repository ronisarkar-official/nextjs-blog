import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-200">
			<main className="flex-1 p-8">
				<div className="max-w-5xl mx-auto">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-4">
							<Skeleton className="h-6 w-24" />
							<Skeleton className="h-5 w-12" />
						</div>
					</div>

					{/* Search bar skeleton to match UserPostsList */}
					<div className="mt-4 mb-8 flex items-center justify-center px-4">
						<div className="w-full max-w-xl">
							<Skeleton className="h-11 w-full rounded-full" />
						</div>
					</div>

					{/* List skeletons matching post rows */}
					<div className="space-y-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<article
								key={i}
								className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
								<div className="flex items-center gap-4 w-full">
									<Skeleton className="w-20 h-14 rounded" />
									<div className="flex-1">
										<div className="flex items-start justify-between gap-4">
											<div className="space-y-2">
												<Skeleton className="h-4 w-56" />
												<div className="flex items-center gap-2">
													<Skeleton className="h-3 w-24" />
													<Skeleton className="h-5 w-16 rounded-full" />
												</div>
											</div>
											<div className="flex items-center gap-4">
												<div className="flex items-center gap-2">
													<Skeleton className="h-4 w-10" />
												</div>
												<Skeleton className="h-7 w-7 rounded-full" />
											</div>
										</div>
									</div>
								</div>
							</article>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}

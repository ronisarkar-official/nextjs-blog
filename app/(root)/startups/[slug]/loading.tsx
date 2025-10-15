import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<main className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
			<div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
				<article className="md:col-span-2">
					{/* Breadcrumbs */}
					<div className="mb-4">
						<Skeleton className="h-4 w-40" />
					</div>

					<header className="mb-8">
						<div className="mb-3">
							<Skeleton className="h-6 w-28 rounded-full" />
						</div>
						<Skeleton className="h-8 w-3/4 mb-3" />
						<div className="flex items-center justify-between gap-4">
							<div className="flex items-center gap-3">
								<Skeleton className="h-8 w-8 rounded-full" />
								<div>
									<Skeleton className="h-4 w-32 mb-1" />
									<Skeleton className="h-3 w-48" />
								</div>
							</div>
							<div className="hidden sm:flex items-center gap-3">
								<Skeleton className="h-5 w-16" />
								<Skeleton className="h-6 w-16" />
							</div>
						</div>
					</header>

					{/* Hero / Cover */}
					<div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
						<Skeleton className="absolute inset-0 w-full h-full" />
					</div>

					<section className="max-w-none space-y-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-4 w-full"
							/>
						))}
						<Skeleton className="h-4 w-2/3" />
						<hr className="my-8 border-t-2 border-gray-100 dark:border-gray-800 rounded" />
						<div className="flex items-center gap-3">
							<Skeleton className="h-8 w-28" />
							<Skeleton className="h-8 w-20" />
							<Skeleton className="h-8 w-24" />
						</div>

						<div className="mt-8 space-y-4">
							<Skeleton className="h-5 w-40" />
							{Array.from({ length: 3 }).map((_, i) => (
								<div
									key={i}
									className="space-y-2">
									<Skeleton className="h-4 w-1/2" />
									<Skeleton className="h-12 w-full" />
								</div>
							))}
						</div>
					</section>

					{/* Editor picks */}
					<section className="max-w-none mt-8">
						<Skeleton className="h-7 w-56 mb-4" />
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<div
									key={i}
									className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
									<Skeleton className="h-16 w-24 rounded-md" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-3 w-32" />
										<Skeleton className="h-4 w-48" />
									</div>
								</div>
							))}
						</div>
					</section>
				</article>

				{/* Sidebar */}
				<aside className="md:col-span-1">
					<div className="sticky top-6 space-y-6">
						<div>
							<Skeleton className="h-4 w-28 mb-3" />
							<div className="space-y-3">
								{Array.from({ length: 4 }).map((_, i) => (
									<div
										key={i}
										className="flex items-start gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
										<Skeleton className="h-16 w-24 rounded-md" />
										<div className="flex-1 space-y-2">
											<Skeleton className="h-3 w-24" />
											<Skeleton className="h-4 w-40" />
										</div>
									</div>
								))}
							</div>
						</div>

						<div>
							<Skeleton className="h-4 w-20 mb-3" />
							<div className="flex flex-wrap gap-2">
								{Array.from({ length: 6 }).map((_, i) => (
									<Skeleton
										key={i}
										className="h-6 w-14 rounded-full"
									/>
								))}
							</div>
						</div>
					</div>
				</aside>
			</div>
		</main>
	);
}

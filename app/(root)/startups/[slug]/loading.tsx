import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<main className="min-h-screen bg-gray-900 text-gray-100">
			<div className="max-w-6xl mx-auto px-6 py-10">
				{/* Search */}
				<div className="mb-8">
					<Skeleton className="h-11 w-full max-w-3xl rounded-xl" />
				</div>

				{/* Heading */}
				<div className="mb-6">
					<Skeleton className="h-5 w-28 rounded-full" />
				</div>

				{/* Cards grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{Array.from({ length: 3 }).map((_, idx) => (
						<article
							key={idx}
							className="relative rounded-xl overflow-hidden border border-gray-800/60 bg-gray-900/40 p-4 shadow-sm">
							{/* Thumbnail area */}
							<div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden mb-4 bg-gray-800">
								<Skeleton className="absolute inset-0 w-full h-full" />

								{/* views badge top-right */}
								<div className="absolute top-3 right-3">
									<div className="flex items-center gap-2">
										<Skeleton className="h-6 w-6 rounded-full" />
										<Skeleton className="h-5 w-10 rounded-full" />
									</div>
								</div>

								{/* author badge bottom-left */}
								<div className="absolute left-3 bottom-3 flex items-center gap-2">
									<Skeleton className="h-8 w-8 rounded-full" />
									<Skeleton className="h-4 w-20 rounded-md" />
								</div>
							</div>

							{/* category */}
							<div className="mb-2">
								<Skeleton className="h-3 w-20 rounded-full" />
							</div>

							{/* title */}
							<div className="mb-3">
								<Skeleton className="h-6 w-11/12 rounded-md" />
							</div>

							{/* excerpt lines */}
							<div className="space-y-2 mb-4">
								<Skeleton className="h-3 w-full rounded-md" />
								<Skeleton className="h-3 w-10/12 rounded-md" />
								<Skeleton className="h-3 w-8/12 rounded-md" />
							</div>

							{/* footer: published pill + date */}
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

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { StartupCardSkeleton } from '@/components/StartupCard';

export default function Loading() {
	return (
		<main className="pt-16 pb-5 max-w-screen-xl mx-auto min-h-screen px-2 sm:px-6 lg:px-14">
			{/* Search form skeleton */}
			<div className="flex items-center gap-2">
				<Skeleton className="h-10 w-full max-w-xl" />
				<Skeleton className="h-10 w-24 hidden sm:block" />
			</div>

			{/* Title */}
			<div className="mt-6">
				<Skeleton className="h-7 w-44" />
			</div>

			{/* Grid of card skeletons matching StartupCard */}
			<ul className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 pt-6">
				<StartupCardSkeleton />
			</ul>
		</main>
	);
}

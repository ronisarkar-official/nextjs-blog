import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
					<div className="px-6 py-8">
						<Skeleton className="h-7 w-48 mb-2" />
						<Skeleton className="h-4 w-72 mb-8" />

						{/* Form skeleton */}
						<div className="space-y-6">
							{[0, 1, 2, 3].map((i) => (
								<div
									key={i}
									className="space-y-2">
									<Skeleton className="h-4 w-28" />
									<Skeleton className="h-10 w-full" />
								</div>
							))}
							<div className="flex items-center gap-3 pt-2">
								<Skeleton className="h-10 w-24" />
								<Skeleton className="h-10 w-24" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

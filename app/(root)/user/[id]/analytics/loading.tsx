import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<main className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
				{/* Header */}
				<div className="space-y-2">
					<Skeleton className="h-8 w-56" />
					<Skeleton className="h-4 w-40" />
				</div>

				{/* Summary cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<div className="rounded-xl border p-6">
						<Skeleton className="h-4 w-24 mb-3" />
						<Skeleton className="h-6 w-12" />
					</div>
					<div className="rounded-xl border p-6">
						<Skeleton className="h-4 w-24 mb-3" />
						<Skeleton className="h-6 w-16" />
					</div>
					<div className="rounded-xl border p-6">
						<Skeleton className="h-4 w-28 mb-3" />
						<Skeleton className="h-6 w-14" />
					</div>
					<div className="rounded-xl border p-6">
						<Skeleton className="h-4 w-24 mb-3" />
						<Skeleton className="h-5 w-24" />
					</div>
				</div>

				{/* Table skeleton */}
				<div className="mt-4">
					<div className="rounded-xl border">
						<div className="p-6 pb-3">
							<Skeleton className="h-5 w-28" />
						</div>
						<div className="px-6 pb-6">
							<div className="overflow-x-auto">
								<table className="min-w-full text-sm table-fixed">
									<thead>
										<tr className="border-b">
											<th className="py-2 pr-4 w-1/2">
												<Skeleton className="h-4 w-20" />
											</th>
											<th className="py-2 pr-4">
												<Skeleton className="h-4 w-16" />
											</th>
											<th className="py-2 pr-4">
												<Skeleton className="h-4 w-16" />
											</th>
											<th className="py-2 pr-4">
												<Skeleton className="h-4 w-14" />
											</th>
											<th className="py-2 pr-4">
												<Skeleton className="h-4 w-20" />
											</th>
											<th className="py-2 pr-4">
												<Skeleton className="h-4 w-12" />
											</th>
										</tr>
									</thead>
									<tbody>
										{[0, 1, 2, 3, 4].map((i) => (
											<tr
												key={i}
												className="border-b">
												<td className="py-3 pr-4">
													<Skeleton className="h-4 w-[420px]" />
												</td>
												<td className="py-3 pr-4">
													<Skeleton className="h-4 w-24" />
												</td>
												<td className="py-3 pr-4">
													<Skeleton className="h-4 w-28" />
												</td>
												<td className="py-3 pr-4">
													<Skeleton className="h-4 w-12" />
												</td>
												<td className="py-3 pr-4">
													<Skeleton className="h-4 w-12" />
												</td>
												<td className="py-3 pr-4">
													<Skeleton className="h-4 w-10" />
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}

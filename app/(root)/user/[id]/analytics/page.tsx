// app/(root)/user/[id]/analytics/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import {
	AUTHOR_BY_ID_QUERY,
	STARTUPS_BY_AUTHOR_QUERY,
	COMMENT_COUNT_BY_STARTUP_QUERY,
} from '@/sanity/lib/queries';
import { auth } from '@/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
// Chart removed

export const dynamic = 'force-dynamic';

type Startup = {
	_id: string;
	title?: string;
	slug?: { current?: string } | string;
	_createdAt?: string;
	author?: { _id?: string; name?: string; image?: any; bio?: string };
	views?: number;
	description?: string;
	category?: string;
	image?: any;
};

function formatDate(iso?: string) {
	if (!iso) return '';
	try {
		const d = new Date(iso);
		return new Intl.DateTimeFormat(undefined, {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
		}).format(d);
	} catch {
		return iso;
	}
}

async function getPerPostCommentCounts(
	startups: Startup[],
): Promise<Record<string, number>> {
	const limited = startups.slice(0, 3); // only ever run at most 3 queries (fast)
	const results = await Promise.all(
		limited.map(async (s) => {
			const count = await client.fetch<number>(COMMENT_COUNT_BY_STARTUP_QUERY, {
				startupId: s._id,
			});
			return [s._id, Number(count) || 0] as const;
		}),
	);
	return Object.fromEntries(results);
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	// ensure session resolves but don't block if unauthenticated
	try {
		await auth();
	} catch {
		// ignore
	}

	const [user, startups] = (await Promise.all([
		client.fetch(AUTHOR_BY_ID_QUERY, { id }),
		client.fetch<Startup[]>(STARTUPS_BY_AUTHOR_QUERY, { id }),
	])) as [any, Startup[]];

	if (!user) return notFound();

	const posts = Array.isArray(startups) ? startups : [];
	const postsSortedByDate = posts.slice().sort((a, b) => {
		const da = a._createdAt ? Date.parse(a._createdAt) : 0;
		const db = b._createdAt ? Date.parse(b._createdAt) : 0;
		return db - da;
	});
	const totalPosts = posts.length;
	const totalViews = posts.reduce((sum, p) => sum + (p.views ?? 0), 0);
	const avgViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;
	const latestAt = postsSortedByDate[0]?._createdAt;

	const showDetailed = totalPosts > 0;
	const commentCounts =
		showDetailed ? await getPerPostCommentCounts(posts) : {};

	return (
		<main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
			<div className="max-w-6xl mx-auto px-6 py-10">
				<div className="mb-10">
					<h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
					<p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
						for {user.name}
					</p>
				</div>

				{/* Summary cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm text-gray-500">
								Total Posts
							</CardTitle>
						</CardHeader>
						<CardContent className="text-2xl font-semibold">
							{totalPosts}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm text-gray-500">
								Total Views
							</CardTitle>
						</CardHeader>
						<CardContent className="text-2xl font-semibold">
							{totalViews}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm text-gray-500">
								Avg Views/Post
							</CardTitle>
						</CardHeader>
						<CardContent className="text-2xl font-semibold">
							{avgViews}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm text-gray-500">
								Latest Post
							</CardTitle>
						</CardHeader>
						<CardContent className="text-lg font-medium">
							{formatDate(latestAt) || '—'}
						</CardContent>
					</Card>
				</div>

				{/* Chart removed by request */}

				{/* Conditional detailed section for users with up to 3 posts */}
				<div className="mt-10">
					{totalPosts === 0 && (
						<Card>
							<CardContent className="py-8">
								<p className="text-center text-gray-600 dark:text-gray-300">
									No posts yet. Create your first post to see analytics.
								</p>
							</CardContent>
						</Card>
					)}

					{showDetailed && totalPosts > 0 && (
						<div className="space-y-4">
							{/* Detailed table of posts */}
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Post Details</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="overflow-x-auto">
										<table className="min-w-full text-sm table-fixed">
											<thead className="text-left text-gray-600 dark:text-gray-300">
												<tr className="border-b border-gray-200 dark:border-gray-700">
													<th className="py-2 pr-4 w-1/2 align-middle">
														Title
													</th>
													<th className="py-2 pr-4">Category</th>
													<th className="py-2 pr-4">Created</th>
													<th className="py-2 pr-4">Views</th>
													<th className="py-2 pr-4">Comments</th>
													<th className="py-2 pr-4">Link</th>
												</tr>
											</thead>
											<tbody>
												{postsSortedByDate.map((p) => {
													const slugStr =
														typeof p.slug === 'string' ?
															p.slug
														:	(p.slug?.current ?? p._id);
													return (
														<tr
															key={p._id}
															className="border-b border-gray-100 dark:border-gray-800">
															<td className="py-2 pr-4 font-medium align-middle ">
																<div className="max-w-[420px] truncate whitespace-nowrap">
																	{p.title || 'Untitled'}
																</div>
															</td>
															<td className="py-2 pr-4">{p.category || '—'}</td>
															<td className="py-2 pr-4">
																{formatDate(p._createdAt)}
															</td>
															<td className="py-2 pr-4">{p.views ?? 0}</td>
															<td className="py-2 pr-4">
																{commentCounts[p._id] ?? 0}
															</td>
															<td className="py-2 pr-4">
																<Link
																	className="text-indigo-600 dark:text-indigo-400 hover:underline"
																	href={`/startups/${encodeURIComponent(slugStr)}`}>
																	View
																</Link>
															</td>
														</tr>
													);
												})}
											</tbody>
										</table>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Always showing details when posts exist */}
				</div>
			</div>
		</main>
	);
}

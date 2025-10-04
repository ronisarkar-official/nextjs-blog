// File: app/(root)/startups/page.tsx
import { auth } from '@/auth';
import { client } from '@/sanity/lib/client';
import {
	AUTHOR_BY_ID_QUERY,
	STARTUPS_BY_AUTHOR_QUERY,
} from '@/sanity/lib/queries';
import { ChartNoAxesColumnIncreasing } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';

export const dynamic = 'force-dynamic';

type StartupFromSanity = {
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

const DEFAULT_AVATAR = '/avatar-placeholder.png';

const safeImageUrl = (img: any): string => {
	if (!img) return DEFAULT_AVATAR;
	if (typeof img === 'string') return img;
	if (img.url) return img.url;
	if (img.asset && typeof img.asset === 'object' && img.asset.url)
		return img.asset.url;
	return DEFAULT_AVATAR;
};

const formatDate = (iso?: string) => {
	if (!iso) return '';
	try {
		return new Intl.DateTimeFormat('default', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		}).format(new Date(iso));
	} catch {
		return iso;
	}
};

const CARD_BASE = 'rounded p-4 flex items-center gap-4 transition-colors';
const CARD_BORDER = 'border border-gray-200 dark:border-gray-700';
const CARD_BG = 'bg-white dark:bg-gray-800';
const TITLE = 'text-sm font-medium text-gray-900 dark:text-gray-100';
const META =
	'mt-1 text-xs text-gray-500 dark:text-gray-300 flex items-center gap-2';
const BADGE =
	'px-2 py-0.5 rounded-full text-xs ml-2 bg-gray-100 dark:bg-gray-700';
const THUMB_BG =
	'flex-shrink-0 w-20 h-14 rounded overflow-hidden bg-gray-100 dark:bg-gray-700';

const Page = async ({ params }: { params: { id: string } }) => {
	const { id } = params;

	// try to ensure session but don't block on auth errors
	try {
		await auth();
	} catch {
		// ignore
	}

	// fetch both user and startups in parallel
	const [startupsDataRaw, user] = (await Promise.all([
		client.fetch(STARTUPS_BY_AUTHOR_QUERY, { id }),
		client.fetch(AUTHOR_BY_ID_QUERY, { id }),
	])) as [StartupFromSanity[] | null, any];

	if (!user) return notFound();

	const startups = Array.isArray(startupsDataRaw) ? startupsDataRaw : [];
	const image = safeImageUrl(user.image);
	const username = user.username || user.name || 'user';
	const startupsCount = startups.length;

	return (
		<div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-200">
			{/* Main content area */}
			<main className="flex-1 p-8">
				<div className="max-w-5xl mx-auto">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-4">
							<h2 className="text-lg font-semibold">
								All{' '}
								<span className="text-gray-400 dark:text-gray-500">
									({startupsCount})
								</span>
							</h2>
						</div>
					</div>

					{/* Posts / Startups list */}
					<div className="space-y-4">
						{startups.map((startup) => {
							const thumb = safeImageUrl(startup.image);
							const title = startup.title || 'Untitled';
							const createdAt = formatDate(startup._createdAt);
							const category = startup.category || '';
							const views = startup.views ?? 0;
							const authorAvatar = safeImageUrl(startup.author?.image);

							// robust slug handling
							const slugStr =
								typeof startup.slug === 'string' ?
									startup.slug
								:	(startup.slug?.current ?? startup._id);
							const posturl = `/startups/${encodeURIComponent(slugStr)}/edit`;

							return (
								<article
									key={startup._id}
									className={`${CARD_BASE} ${CARD_BG} ${CARD_BORDER}`}>
									<Link
										href={posturl}
										className="flex items-center gap-4 w-full">
										<div
											className={THUMB_BG}
											aria-hidden>
											<img
												src={thumb}
												alt={title}
												className="w-full h-full object-cover"
											/>
										</div>

										<div className="flex-1">
											<div className="flex items-start justify-between gap-4">
												<div>
													<h3 className={TITLE}>{title}</h3>

													<div className={META}>
														<span>{createdAt}</span>
														{category && (
															<span className={BADGE}>{category}</span>
														)}
													</div>
												</div>

												<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-300">
													<div className="flex items-center gap-2">
														<ChartNoAxesColumnIncreasing aria-hidden />
														<span>{views}</span>
													</div>

													<div className="flex items-center gap-2">
														<div className="h-7 w-7 rounded-full overflow-hidden">
															<img
																src={authorAvatar}
																alt={startup.author?.name || 'author'}
																className="h-full w-full object-cover"
															/>
														</div>
													</div>
												</div>
											</div>
										</div>
									</Link>
								</article>
							);
						})}

						{startups.length === 0 && (
							<div className="text-center text-gray-500 dark:text-gray-400 py-8">
								No startups found for this author.
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
};

export default Page;

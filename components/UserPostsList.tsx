'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChartNoAxesColumnIncreasing } from 'lucide-react';
import { Search } from 'lucide-react';

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
const DEFAULT_AVATAR = '/avatar-placeholder.png';

function safeImageUrl(img) {
	if (!img) return DEFAULT_AVATAR;
	if (typeof img === 'string') {
		try {
			new URL(img);
			return img;
		} catch {
			return DEFAULT_AVATAR;
		}
	}
	if (img?.url) {
		try {
			new URL(img.url);
			return img.url;
		} catch {
			return DEFAULT_AVATAR;
		}
	}
	if (img?.asset && typeof img.asset === 'object' && img.asset.url) {
		try {
			new URL(img.asset.url);
			return img.asset.url;
		} catch {
			return DEFAULT_AVATAR;
		}
	}
	return DEFAULT_AVATAR;
}

/**
 * NOTE:
 * This component expects the server page to pass `createdAtFormatted` on each startup:
 *   { ...startup, createdAtFormatted: formatDateServer(startup._createdAt) }
 *
 * If your server page does NOT provide createdAtFormatted, this component falls back
 * to showing the raw ISO string (startup._createdAt) to avoid client-side Intl formatting
 * which causes hydration mismatches.
 */

export default function UserPostsList({ startups }) {
	const [query, setQuery] = useState('');
	const filtered = useMemo(() => {
		if (!query.trim()) return startups || [];
		const q = query.toLowerCase();
		return (startups || []).filter(
			(s) =>
				s.title?.toLowerCase().includes(q) ||
				s.description?.toLowerCase().includes(q) ||
				s.category?.toLowerCase().includes(q),
		);
	}, [startups, query]);

	if (!Array.isArray(startups) || startups.length === 0) {
		return (
			<div className="text-center text-gray-500 dark:text-gray-400 py-8">
				No startups found for this author.
			</div>
		);
	}

	return (
		<div>
			<div className="mt-4 mb-8 flex items-center justify-center px-4">
				<div className="relative flex items-center w-full max-w-xl bg-white/80 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-full px-3 py-2 shadow-sm dark:shadow-none transition-colors duration-150 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:dark:ring-offset-gray-900">
					<div className="flex items-center pointer-events-none pl-1 pr-3">
						<Search
							className="w-5 h-5 text-zinc-500 dark:text-zinc-400"
							aria-hidden="true"
						/>
					</div>
					<input
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search your posts..."
						autoComplete="off"
						aria-label="Search your posts"
						className="flex-1 min-w-0 bg-transparent text-sm sm:text-base placeholder:text-zinc-500 dark:placeholder:text-zinc-400 text-zinc-900 dark:text-gray-100 outline-none px-1 py-2 rounded-full transition-colors duration-150 focus:placeholder-transparent"
					/>
					{query && (
						<button
							type="button"
							className="ml-2 text-black dark:text-gray-100"
							onClick={() => setQuery('')}
							aria-label="Clear search">
							<span className="sr-only">Clear</span>
							<svg
								className="size-5"
								viewBox="0 0 20 20"
								fill="none"
								stroke="currentColor">
								<path
									d="M6 6l8 8M6 14L14 6"
									strokeWidth="2"
									strokeLinecap="round"
								/>
							</svg>
						</button>
					)}
				</div>
			</div>

			<div className="space-y-4">
				{filtered.map((startup) => {
					const thumb = safeImageUrl(startup.image);
					const title = startup.title || 'Untitled';

					// <--- USE SERVER-PROVIDED FORMATTED STRING IF AVAILABLE
					// createdAtFormatted should be a string like "3 Oct 2025" prepared on the server.
					const createdAt =
						startup.createdAtFormatted ?? startup._createdAt ?? '';

					const category = startup.category || '';
					const views = startup.views ?? 0;
					const authorAvatar = safeImageUrl(startup.author?.image);
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
												{category && <span className={BADGE}>{category}</span>}
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
			</div>
		</div>
	);
}

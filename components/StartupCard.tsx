'use client';

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import imageUrlBuilder from '@sanity/image-url';
import { formatDate } from '@/lib/utils';
import { Author, Startup } from '@/sanity/types';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { client as sanityClient } from '@/sanity/lib/client';

export type StartupTypeCard = Omit<Startup, 'author'> & { author?: Author };

// --- Simple in-memory cache (shared across component instances)
const CACHE_TTL = 60_000; // 60 seconds
const startupCache = new Map<
	string,
	{ data: StartupTypeCard; ts: number; promise?: Promise<StartupTypeCard> }
>();

const builder = imageUrlBuilder(sanityClient);
const urlFor = (src: any) => (src ? builder.image(src) : null);

// --- Query used to fetch a single startup by id or slug
const STARTUP_QUERY = `*[_type == "startup" && (_id == $idOrSlug || slug.current == $idOrSlug)][0]{ ..., author->{name, image, _id} }`;

function isStale(ts?: number) {
	return !ts || Date.now() - ts > CACHE_TTL;
}

async function fetchStartup(idOrSlug: string, signal?: AbortSignal) {
	if (!idOrSlug) return null;

	const cached = startupCache.get(idOrSlug);
	if (cached && !isStale(cached.ts)) return cached.data; // still fresh
	if (cached && cached.promise) return cached.promise; // fetch in progress

	const promise = sanityClient
		.withConfig({ useCdn: false })
		.fetch(STARTUP_QUERY, { idOrSlug }, { signal } as any)
		.then((res: any) => {
			if (res) {
				startupCache.set(idOrSlug, { data: res, ts: Date.now() });
				return res;
			}
			return null as any;
		})
		.finally(() => {
			const entry = startupCache.get(idOrSlug);
			if (entry) delete entry.promise;
		});

	// store the promise so parallel callers reuse it
	startupCache.set(idOrSlug, {
		data: cached?.data ?? (null as any),
		ts: cached?.ts ?? 0,
		promise,
	});
	return promise;
}

/**
 * Startup card (client) — optimized for dark mode
 * - Adds dark: variants across backgrounds, borders, text, hover/focus states
 * - Keeps original perf/cache/realtime features
 */
const Startupposts = ({
	post,
	isLCP = false,
}: {
	post: StartupTypeCard;
	isLCP?: boolean;
}) => {
	const [freshPost, setFreshPost] = useState<StartupTypeCard>(post);
	const mounted = useRef(false);

	// stable id/slug
	const idOrSlug = useMemo(
		() => post._id ?? post.slug?.current ?? '',
		[post._id, post.slug?.current],
	);

	// initialize cache with the server snapshot (warm the cache)
	useEffect(() => {
		if (!idOrSlug) return;
		const existing = startupCache.get(idOrSlug);
		if (!existing || isStale(existing.ts)) {
			startupCache.set(idOrSlug, { data: post, ts: Date.now() });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [idOrSlug]);

	useEffect(() => {
		if (!idOrSlug) return;
		let controller = new AbortController();
		let unsub: any = null;
		mounted.current = true;

		// helper to update state only if changed
		const maybeSet = (newDoc: StartupTypeCard | null) => {
			if (!mounted.current || !newDoc) return;
			setFreshPost((cur) => {
				const curTs = (cur?._updatedAt ?? cur?._createdAt) as
					| string
					| undefined;
				const newTs = (newDoc?._updatedAt ?? newDoc?._createdAt) as
					| string
					| undefined;
				if (String(curTs) === String(newTs) && cur?._id === newDoc._id)
					return cur; // no change
				return newDoc;
			});
		};

		// initial fetch if cache is stale
		(async () => {
			try {
				const cached = startupCache.get(idOrSlug);
				if (cached && !isStale(cached.ts)) {
					// use cached
					maybeSet(cached.data);
				} else {
					const res = (await fetchStartup(
						idOrSlug,
						controller.signal,
					)) as StartupTypeCard | null;
					if (res) maybeSet(res);
				}
			} catch (err) {
				// ignore abort/network errors
			}
		})();

		// set up periodic revalidation every CACHE_TTL
		const interval = setInterval(async () => {
			const localController = new AbortController();
			try {
				const res = (await fetchStartup(
					idOrSlug,
					localController.signal,
				)) as StartupTypeCard | null;
				if (res) maybeSet(res);
			} catch (e) {
				// ignore
			}
		}, CACHE_TTL);

		// realtime listener (kept but optimized: only writes to cache/state if doc differs)
		unsub = sanityClient
			.withConfig({ useCdn: false })
			.listen(STARTUP_QUERY, { idOrSlug }, { includeResult: true })
			.subscribe((evt: any) => {
				const newDoc = evt?.result ?? evt?.document ?? null;
				if (!newDoc) return;
				const cached = startupCache.get(idOrSlug);
				const newTs = String(newDoc?._updatedAt ?? newDoc?._createdAt ?? '');
				const cachedTs = String(
					cached?.data?._updatedAt ?? cached?.data?._createdAt ?? '',
				);
				// update only when changed
				if (newDoc._id !== cached?.data?._id || newTs !== cachedTs) {
					startupCache.set(idOrSlug, { data: newDoc, ts: Date.now() });
					maybeSet(newDoc);
				}
			});

		return () => {
			mounted.current = false;
			controller.abort();
			clearInterval(interval);
			if (unsub && typeof unsub.unsubscribe === 'function') unsub.unsubscribe();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [idOrSlug]);

	// destructure from freshest available snapshot
	const {
		_id,
		slug,
		title,
		image: postImage,
		description,
		views,
		category,
		_createdAt,
		author,
		_updatedAt,
	} = (freshPost ?? post) as StartupTypeCard;

	// memoized derived values
	const displayText = useMemo(
		() => description ?? 'No description available.',
		[description],
	);
	const authorName = author?.name ?? '';
	const authorInitial = useMemo(() => authorName.charAt(0) || '', [authorName]);

	// stamp for cache-busting images (only changes when doc changes)
	const stamp = useMemo(() => {
		const t = (_updatedAt ?? _createdAt) as string | undefined;
		return t ? String(Date.parse(String(t))) : String(Date.now());
	}, [_updatedAt, _createdAt]);

	const postImageUrl: string = useMemo(() => {
		if (!postImage) return `/fallback-image.jpg?v=${stamp}`;
		if (typeof postImage === 'string') {
			// Validate URL format before using it
			try {
				new URL(postImage);
				return `${postImage}?v=${stamp}`;
			} catch {
				return `/fallback-image.jpg?v=${stamp}`;
			}
		}
		const url = urlFor(postImage)?.width(1200).quality(80).url();
		return url ? `${url}&v=${stamp}` : `/fallback-image.jpg?v=${stamp}`;
	}, [postImage, stamp]);

	const authorImageUrl: string | null = useMemo(() => {
		if (!author?.image) return null;
		if (typeof author.image === 'string') {
			// Validate URL format before using it
			try {
				new URL(author.image);
				return `${author.image}?v=${stamp}`;
			} catch {
				return null;
			}
		}
		const url = urlFor(author.image)?.width(200).quality(80).url();
		return url ? `${url}&v=${stamp}` : null;
	}, [author?.image, stamp]);

	const startupHref = slug?.current ? `/startups/${slug.current}` : '#';
	const authorHref = author?._id ? `/user/${author._id}` : '#';
	const feedHref =
		category ?
			`/feed?query=${encodeURIComponent(String(category).toLowerCase())}`
		:	'/feed';

	return (
		<article className="rounded-2xl overflow-hidden relative bg-transparent">
			<div className="relative">
				<div className="relative h-52 sm:h-60 md:h-48 lg:h-60 2xl:h-72">
					<Link
						href={startupHref}
						className="absolute inset-0 z-10"
						aria-label={`Open ${title}`}>
						<span className="sr-only">Open {title}</span>
					</Link>

					{/* Image + overlay */}
					<div className="absolute inset-2 rounded-xl overflow-hidden z-0 bg-black/10 dark:bg-black/30">
						<div className="relative w-full h-full border border-white/10 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
							{/* Next/Image with fill for better layout and performance */}
							<div className="relative w-full h-full">
								<Image
									src={postImageUrl}
									alt={title || 'Startup image'}
									fill
									sizes="(max-width: 768px) 100vw, 50vw"
									className="object-cover"
									priority={isLCP}
									loading={isLCP ? undefined : 'lazy'}
								/>
							</div>
						</div>

						{/* Views badge */}
						<div
							className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-white text-black border border-gray-300 backdrop-blur dark:bg-gray-900/80 dark:text-gray-100 dark:border-gray-700"
							aria-label="views">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="w-3 h-3"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
								<circle
									cx="12"
									cy="12"
									r="3"></circle>
							</svg>
							<span className="ml-1 font-bold">{views}</span>
						</div>
					</div>

					{/* Author chip */}
					<Link
						href={authorHref}
						className="absolute left-5 bottom-5 z-20 flex items-center gap-3 rounded-sm px-2 py-1 border border-gray-300 bg-white/95 dark:bg-gray-900/70 dark:border-gray-700 shadow-sm"
						aria-label={
							author?.name ?
								`Open ${author.name} profile`
							:	'Open author profile'
						}>
						<div className="w-5 h-5 rounded-full overflow-hidden ring-0 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
							{authorImageUrl ?
								<Image
									src={authorImageUrl}
									alt={'Author'}
									width={20}
									height={20}
									className="object-cover h-full w-full"
									loading="lazy"
									placeholder="empty"
								/>
							:	<div className="w-full h-full flex items-center justify-center text-xs text-gray-800 dark:text-gray-100">
									{authorInitial}
								</div>
							}
						</div>

						<div className="text-sm">
							<div className="flex items-center gap-2">
								<span className="font-medium text-black dark:text-gray-100 text-sm">
									{author?.name}
								</span>
							</div>
						</div>
					</Link>
				</div>
			</div>

			{/* Content */}
			<div className="px-4 pt-4 pb-2 bg-transparent">
				<Link
					href={feedHref}
					className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded">
					<p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
						in {category}
					</p>
				</Link>

				<h2 className="text-black dark:text-gray-100 text-lg font-semibold leading-tight mb-2 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
					<Link
						href={startupHref}
						className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded">
						{title}
					</Link>
				</h2>

				<p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
					{displayText}
				</p>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-md">
							Published
						</span>
						<span className="text-xs text-gray-600 dark:text-gray-400">
							{formatDate(_createdAt)}
						</span>
					</div>
				</div>
			</div>
		</article>
	);
};

// memo with shallow checks on post id/updatedAt to avoid re-renders
function areEqual(prev: any, next: any) {
	const p = prev.post ?? {};
	const n = next.post ?? {};
	return (
		p._id === n._id &&
		(p._updatedAt ?? p._createdAt) === (n._updatedAt ?? n._createdAt) &&
		prev.isLCP === next.isLCP
	);
}

export default memo(Startupposts, areEqual);

export const StartupCardSkeleton = () => (
	<>
		{[0, 1, 2, 3, 4].map((index: number) => (
			<li key={cn('skeleton', String(index))}>
				<Skeleton className="startup-card_skeleton" />
			</li>
		))}
	</>
);

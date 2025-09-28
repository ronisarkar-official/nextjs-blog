'use client';
import React, { memo, useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import imageUrlBuilder from '@sanity/image-url';
import { formatDate } from '@/lib/utils';
import { Author, Startup } from '@/sanity/types';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { client as sanityClient } from '@/sanity/lib/client';

export type StartupTypeCard = Omit<Startup, 'author'> & { author?: Author };

const builder = imageUrlBuilder(sanityClient);
const urlFor = (source: any) => (source ? builder.image(source) : null);

const Startupposts = ({ post }: { post: StartupTypeCard }) => {
	// Keep a local "fresh" copy of the post and re-fetch on mount to avoid CDN/SSG staleness.
	const [freshPost, setFreshPost] = useState<StartupTypeCard>(post);

	useEffect(() => {
		// Try to fetch the freshest version from Sanity when this component mounts or when id/slug changes.
		const idOrSlug = post._id ?? post.slug?.current;
		if (!idOrSlug) return;

		const query = `*[_type == "startup" && (_id == $idOrSlug || slug.current == $idOrSlug)][0]{
			..., 
			author->{name, image, _id}
		}`;

		// Force bypass CDN by using withConfig({ useCdn: false })
		sanityClient
			.withConfig({ useCdn: false, useReadOnlyToken: false })
			.fetch(query, { idOrSlug })
			.then((res: any) => {
				if (res) setFreshPost(res);
			})
			.catch(() => {
				/* ignore fetch errors and show the passed-in post */
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [post._id, post.slug?.current]);

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
		excerpt,
		_updatedAt,
	} = freshPost as StartupTypeCard;

	// Derived values memoized to avoid re-computation on each render
	const displayText = useMemo(
		() => excerpt ?? description ?? 'No description available.',
		[excerpt, description],
	);

	const authorName = author?.name ?? '';
	const authorInitial = useMemo(() => authorName.charAt(0) || '', [authorName]);

	// Normalize image sources to strings usable by next/image and add a small cache-buster (updatedAt) to force refresh
	const postImageUrl: string = useMemo(() => {
		const updatedStamp = (freshPost as any)?._updatedAt ?? _createdAt;
		if (!postImage)
			return `/fallback-image.jpg?v=${Date.parse(String(updatedStamp || _createdAt))}`;
		if (typeof postImage === 'string')
			return `${postImage}?v=${Date.parse(String(updatedStamp || _createdAt))}`;
		const url = urlFor(postImage)?.width(1200).url();
		return url ?
				`${url}&v=${Date.parse(String(updatedStamp || _createdAt))}`
			:	'/fallback-image.jpg';
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postImage, (freshPost as any)?._updatedAt, _createdAt]);

	const authorImageUrl: string | null = useMemo(() => {
		const updatedStamp = (freshPost as any)?._updatedAt ?? _createdAt;
		if (!author?.image) return null;
		if (typeof author.image === 'string')
			return `${author.image}?v=${Date.parse(String(updatedStamp || _createdAt))}`;
		const url = urlFor(author.image)?.width(200).url();
		return url ?
				`${url}&v=${Date.parse(String(updatedStamp || _createdAt))}`
			:	null;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [author?.image, (freshPost as any)?._updatedAt, _createdAt]);

	// Safe hrefs
	const startupHref = slug?.current ? `/startups/${slug.current}` : '#';
	const authorHref = author?._id ? `/user/${author._id}` : '#';
	const feedHref =
		category ?
			`/feed?query=${encodeURIComponent(String(category).toLowerCase())}`
		:	'/feed';

	return (
		<article className="rounded-2xl overflow-hidden relative">
			{/* HERO / VISUAL */}
			<div className="relative">
				<div className="relative h-52 sm:h-60 md:h-48 lg:h-60 2xl:h-72">
					{/* Single overlay link to reduce duplicate anchors */}
					<Link
						href={startupHref}
						className="absolute inset-0 z-10">
						<span className="sr-only">Open {title}</span>
					</Link>

					{/* Visual container (kept separate so avatar sits above) */}
					<div className="absolute inset-3 rounded-xl overflow-hidden z-0 bg-black/10">
						<div className="relative w-full h-full border border-white/10 rounded-xl overflow-hidden bg-gray-300 flex items-center justify-center">
							{/* next/image requires a string or StaticImageData for src — postImageUrl is normalized above */}
							<Image
								key={
									postImageUrl + String((freshPost as any)?._updatedAt ?? '')
								}
								src={postImageUrl || 'logo.png'}
								alt={title || 'Startup image'}
								fill
								priority={true} // <-- FIX: Use 'priority' to ensure immediate loading and set high fetch priority
								className="object-cover bg-transparent"
								sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
								placeholder="empty"
								// REMOVED: loading="lazy" (The cause of the LCP discovery issue)
								// REMOVED: fetchPriority="high" (Redundant when using priority={true})
								// REMOVED: unoptimized (To enable Next.js optimizations)
							/>
						</div>

						{/* Views badge (decorative) */}
						<div
							className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-white/50 text-black border border-gray-300 backdrop-blur"
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

					{/* profile chip (bottom-left) */}
					<Link
						href={authorHref}
						className="absolute left-5 bottom-5 z-20 flex items-center gap-3 bg-white rounded-sm px-2 py-1 border border-gray-300">
						<div className="w-5 h-5 rounded-full overflow-hidden ring-0 bg-white/10 flex-shrink-0">
							{authorImageUrl ?
								<Image
									key={
										authorImageUrl +
										String((freshPost as any)?._updatedAt ?? '')
									}
									src={authorImageUrl || 'logo.png'}
									alt={'Author'}
									width={20}
									height={20}
									className="object-cover h-full w-full"
									loading="lazy"
									placeholder="empty"
									unoptimized
								/>
							:	<div className="w-full h-full flex items-center justify-center text-xs text-white">
									{authorInitial}
								</div>
							}
						</div>

						<div className="text-sm">
							<div className="flex items-center gap-2">
								<span className="font-medium text-black text-sm">
									{author?.name}
								</span>
							</div>
						</div>
					</Link>
				</div>
			</div>

			<div className="px-4 bg-transparent">
				<Link
					href={feedHref}
					className="inline-block">
					<p className="text-sm text-gray-500 font-medium">in {category}</p>
				</Link>
				<h2 className="text-black text-lg font-semibold leading-tight mb-2 hover:text-indigo-600">
					<Link
						href={startupHref}
						className="inline-block">
						{title}
					</Link>
				</h2>

				<p className="text-gray-600 text-sm mb-4 line-clamp-3">{displayText}</p>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-md">
							Published
						</span>
						<span className="text-xs text-gray-600">
							{formatDate(_createdAt)}
						</span>
					</div>
				</div>
			</div>
		</article>
	);
};

// memo to prevent re-renders when props are unchanged
export default memo(Startupposts);
export const StartupCardSkeleton = () => (
	<>
		{[0, 1, 2, 3, 4].map((index: number) => (
			<li key={cn('skeleton', String(index))}>
				<Skeleton className="startup-card_skeleton" />
			</li>
		))}
	</>
);

import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { Author, Startup } from '@/sanity/types';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';

export type StartupTypeCard = Omit<Startup, 'author'> & { author?: Author };

const Startupposts = ({ post }: { post: StartupTypeCard }) => {
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
	} = post;

	// Derived values memoized to avoid re-computation on each render
	const displayText = useMemo(
		() => excerpt ?? description ?? 'No description available.',
		[excerpt, description],
	);

	const authorName = author?.name ?? '';
	const authorInitial = useMemo(() => authorName.charAt(0) || '', [authorName]);

	return (
		<article className="rounded-2xl overflow-hidden relative">
			{/* HERO / VISUAL */}
			<div className="relative">
				<div className="relative h-52 sm:h-60 md:h-48 lg:h-60 2xl:h-72">
					{/* Single overlay link to reduce duplicate anchors */}
					<Link
						href={`/startups/${slug?.current}`}
						className="absolute inset-0 z-10">
						<span className="sr-only">Open {title}</span>
					</Link>

					{/* Visual container (kept separate so avatar sits above) */}
					<div className="absolute inset-3 rounded-xl overflow-hidden z-0 bg-black/10">
						<div className="relative w-full h-full border border-white/10 rounded-xl overflow-hidden bg-gray-300 flex items-center justify-center">
							<Image
								src={postImage}
								alt={title}
								fill
								className="object-cover bg-transparent"
								sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
								loading="lazy"
								placeholder="empty"
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
						href={`/user/${author?._id}`}
						className="absolute left-5 bottom-5 z-20 flex items-center gap-3 bg-white rounded-sm px-2 py-1 border border-gray-300">
						<div className="w-5 h-5 rounded-full overflow-hidden ring-0 bg-white/10 flex-shrink-0">
							{author?.image ?
								<Image
									src={author.image}
									alt={authorName || 'Author'}
									width={20}
									height={20}
									className="object-cover h-full w-full"
									loading="lazy"
									placeholder="empty"
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

			{/* BODY */}
			<div className="px-4 bg-transparent">
				<Link
					href={`/?query=${category?.toLowerCase()}`}
					className="inline-block">
					<p className="text-sm text-gray-500 font-medium">in {category}</p>
				</Link>
				<h2 className="text-black text-lg font-semibold leading-tight mb-2 hover:text-indigo-600">
					<Link
						href={`/startups/${slug?.current}`}
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

					<Link
						href={`/startups/${slug?.current}`}
						className="text-sm text-indigo-400 font-medium">
						Read more
					</Link>
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
			<li key={cn('skeleton', index)}>
				<Skeleton className="startup-card_skeleton" />
			</li>
		))}
	</>
);

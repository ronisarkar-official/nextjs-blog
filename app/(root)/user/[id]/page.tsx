// File: app/(root)/[id]/page.tsx

import { auth } from '@/auth';
import { client } from '@/sanity/lib/client';
import {
	AUTHOR_BY_ID_QUERY,
	STARTUPS_BY_AUTHOR_QUERY,
} from '@/sanity/lib/queries';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import UserStartups from '@/components/UserStartups';
import { Suspense } from 'react';
import { StartupCardSkeleton } from '@/components/StartupCard';

export const experimental_ppr = true;

// small UI class constants for easy dark-mode tweaks
const PAGE_BG =
	'bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800';
const CARD =
	'overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black/5 dark:ring-white/5';
const CARD_BORDER_B = 'border-b border-gray-100 dark:border-gray-700';
const TEXT_MUTED = 'text-sm text-gray-500 dark:text-gray-300';
const TITLE = 'text-2xl font-semibold text-gray-900 dark:text-gray-100';
const SECTION_CARD =
	'rounded-xl p-6 bg-white dark:bg-gray-800 border border-gray-50 dark:border-gray-700 shadow-sm';

const DEFAULT_AVATAR = '/avatar-placeholder.png';

const safeImage = (img: any) => {
	if (!img) return DEFAULT_AVATAR;
	if (typeof img === 'string') {
		try {
			new URL(img);
			return img;
		} catch {
			return DEFAULT_AVATAR;
		}
	}
	if (img.url) {
		try {
			new URL(img.url);
			return img.url;
		} catch {
			return DEFAULT_AVATAR;
		}
	}
	if (img.asset && img.asset.url) {
		try {
			new URL(img.asset.url);
			return img.asset.url;
		} catch {
			return DEFAULT_AVATAR;
		}
	}
	return DEFAULT_AVATAR;
};

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
	const id = (await params).id;
	const session = await auth();
	const startups = await client.fetch(STARTUPS_BY_AUTHOR_QUERY, { id });
	const user = await client.fetch(AUTHOR_BY_ID_QUERY, { id });
	if (!user) return notFound();

	// small defensive defaults so UI never breaks
	const image = safeImage(user.image);
	const bio = user.bio || 'No bio provided.';
	const username = user.username || 'user';
	const startupsCount = Array.isArray(startups) ? startups.length : 0;

	return (
		<main
			className={`min-h-screen ${PAGE_BG} py-10 transition-colors duration-200`}>
			<div className="max-w-7xl mx-auto px-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
					{/* Profile Card (left) */}
					<aside className="lg:sticky lg:top-24">
						<div className={`${CARD}`}>
							<div className={`p-6 ${CARD_BORDER_B}`}>
								<div className="flex items-center gap-5">
									<div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-2xl ring-2 ring-gray-200 dark:ring-gray-700 shadow-sm">
										<Image
											src={image}
											alt={user.name}
											width={80}
											height={80}
											className="object-cover w-full h-full"
										/>
									</div>

									<div className="flex-1">
										<h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
											{user.name}
										</h1>
										<p className="text-sm text-gray-500 dark:text-gray-300">
											@{username}
										</p>
									</div>
								</div>

								{bio && (
									<p className={`mt-4 ${TEXT_MUTED} leading-relaxed`}>{bio}</p>
								)}
							</div>
						</div>
					</aside>

					{/* Startups & content (right) - spans 2 cols on large */}
					<section className="lg:col-span-2">
						<div className="flex items-center justify-between mb-6">
							<h2 className={TITLE}>
								{session?.id === id ? "Your" : `${user.name}'s`} Posts
							</h2>
							<div className="text-sm text-gray-500 dark:text-gray-300">
								Showing latest posts
							</div>
						</div>

						<div className="space-y-6">
							<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
								<Suspense fallback={<StartupCardSkeleton />}>
									{/* UserStartups should itself be dark-mode friendly; if not, we can wrap / style here */}
									<UserStartups id={id} />
								</Suspense>
							</ul>

							{/* empty state */}
							{startupsCount === 0 && (
								<div className="rounded-xl border border-dashed border-gray-200 dark:border-dashed dark:border-gray-700 bg-white/60 dark:bg-gray-800/50 p-6 text-center">
									<p className={`text-gray-600 dark:text-gray-300`}>
										{session?.id === id ?
											'No startups yet. Create your first startup to get started.'
										:	'No startups yet.'}
									</p>
								</div>
							)}

							{/* other profile content you might want to surface */}
							<div className={SECTION_CARD}>
								<h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
									About {user.name}
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
									{bio || 'No extended bio available.'}
								</p>
							</div>
						</div>
					</section>
				</div>
			</div>
		</main>
	);
};

export default Page;

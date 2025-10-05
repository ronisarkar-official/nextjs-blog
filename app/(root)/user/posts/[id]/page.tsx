// app/(root)/user/posts/[id]/page.tsx
import { auth } from '@/auth';
import { client } from '@/sanity/lib/client';
import {
	AUTHOR_BY_ID_QUERY,
	STARTUPS_BY_AUTHOR_QUERY,
} from '@/sanity/lib/queries';
import { notFound } from 'next/navigation';
import React from 'react';
import UserPostsList from '@/components/UserPostsList';

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
	// new: preformatted date string (server-side)
	createdAtFormatted?: string;
};

const DEFAULT_AVATAR = '/avatar-placeholder.png';

const safeImageUrl = (img: any): string => {
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
	if (img.asset && typeof img.asset === 'object' && img.asset.url) {
		try {
			new URL(img.asset.url);
			return img.asset.url;
		} catch {
			return DEFAULT_AVATAR;
		}
	}
	return DEFAULT_AVATAR;
};

/** Deterministic date formatting on the server.
 *  Use an explicit format so server and client don't differ.
 *  This runs on the server (Page is a server component), so it guarantees the HTML text is fixed.
 */
const formatDateServer = (iso?: string) => {
	if (!iso) return '';
	try {
		// Use an explicit locale + options for deterministic output.
		// Change 'en-GB' to 'en-US' if you prefer 'Oct 3, 2025' instead of '3 Oct 2025'.
		return new Intl.DateTimeFormat('en-GB', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		}).format(new Date(iso));
	} catch {
		return iso || '';
	}
};

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }> | { id: string };
}) {
	const { id } = await params;

	try {
		await auth();
	} catch {
		// ignore
	}

	const [startupsDataRaw, user] = (await Promise.all([
		client.fetch(STARTUPS_BY_AUTHOR_QUERY, { id }),
		client.fetch(AUTHOR_BY_ID_QUERY, { id }),
	])) as [StartupFromSanity[] | null, any];

	if (!user) return notFound();

	const startups = Array.isArray(startupsDataRaw) ? startupsDataRaw : [];

	// **Important**: create a new array with deterministic server-side formatted date
	const startupsWithFormattedDates: StartupFromSanity[] = startups.map((s) => ({
		...s,
		createdAtFormatted: formatDateServer(s._createdAt),
	}));

	const image = safeImageUrl(user.image);
	const username = user.username || user.name || 'user';
	const startupsCount = startupsWithFormattedDates.length;

	return (
		<div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-200">
			<main className="flex-1 p-8">
				<div className="max-w-5xl mx-auto">
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

					{/* Pass the preformatted date strings to the client component */}
					<UserPostsList startups={startupsWithFormattedDates} />
				</div>
			</main>
		</div>
	);
}

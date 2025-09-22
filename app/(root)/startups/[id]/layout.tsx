// app/startup/[id]/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { STARTUP_BY_ID_QUERY } from '@/sanity/lib/queries';

export const dynamic = 'force-dynamic';

function resolveImageUrl(img: any) {
	if (!img) return null;
	if (typeof img === 'string') return img;
	return img.url || img.asset?.url || null;
}

export async function generateMetadata({
	params,
}: {
	// params *may* be a promise-like value at runtime in some Next.js setups,
	// so we accept either an object or a Promise of an object.
	params: { id: string | string[] } | Promise<{ id: string | string[] }>;
}): Promise<Metadata> {
	// Await params so it works whether Next provided a plain object or a thenable.
	const paramsResolved = (await params) as { id: string | string[] };
	const id =
		Array.isArray(paramsResolved.id) ? paramsResolved.id[0] : paramsResolved.id;

	let post: any = null;
	try {
		post = await client.fetch(STARTUP_BY_ID_QUERY, { id });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('Sanity fetch error for metadata:', err);
	}

	const siteName = 'Startup Hub';
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

	if (!post) {
		return {
			title: siteName,
			description: 'A platform for startup enthusiasts',
			openGraph: {
				title: siteName,
				description: 'A platform for startup enthusiasts',
				url: baseUrl,
				siteName,
			},
			twitter: {
				card: 'summary',
				title: siteName,
				description: 'A platform for startup enthusiasts',
			},
			metadataBase: new URL(baseUrl),
		};
	}

	const title = post.title ?? siteName;
	const description =
		post.excerpt ??
		(typeof post.pitch === 'string' ?
			post.pitch.replace(/\s+/g, ' ').slice(0, 160)
		:	'') ??
		'A platform for startup enthusiasts';

	// Use the route param (id) to build canonical url — safer than assuming post._id exists
	const url = new URL(`/startup/${id}`, baseUrl).toString();
	const image =
		resolveImageUrl(post.image) ?? `${baseUrl}/images/cover-placeholder.jpg`;
	const authorName = post.author?.name ?? undefined;

	const metadata: Metadata = {
		title,
		description,
		authors: authorName ? [{ name: authorName }] : undefined,
		openGraph: {
			title,
			description,
			url,
			siteName,
			type: 'article',
			publishedTime: post._createdAt,
			images: [
				{
					url: image,
					alt: title,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [image],
		},
		metadataBase: new URL(baseUrl),
	};

	return metadata;
}

/** Correct nested layout — do NOT render <html> or <body> here */
export default function StartupLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { id: string | string[] };
}) {
	return <div className="min-h-screen bg-white text-gray-900">{children}</div>;
}

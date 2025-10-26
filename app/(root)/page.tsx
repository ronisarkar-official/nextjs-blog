// app/page.tsx  (server component)
import React from 'react';
import { auth } from '@/auth'; // must be a server-side helper
import { redirect } from 'next/navigation';
import HomeClient from '@/components/HomeClient'; // client component (no server calls)
import type { Metadata } from 'next';

// Generate metadata for landing page SEO
export async function generateMetadata(): Promise<Metadata> {
	const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'SpecHype';
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
	const description =
		process.env.NEXT_PUBLIC_SITE_TAGLINE ||
		'Discover and share innovative startups, cutting-edge technology, and entrepreneurial insights.';
	const twitterHandle = process.env.NEXT_PUBLIC_SOCIAL_TWITTER || '';

	return {
		title: {
			default: siteName,
			template: `%s | ${siteName}`,
		},
		description,
		keywords:
			'startups, innovation, entrepreneurship, technology, business ideas, startup community',
		openGraph: {
			title: siteName,
			description,
			url: baseUrl,
			siteName,
			type: 'website',
			images: [
				{
					url: `${baseUrl}/thumbnail.png`,
					width: 1200,
					height: 630,
					alt: siteName,
				},
			],
			locale: 'en_US',
		},
		twitter: {
			card: 'summary_large_image',
			title: siteName,
			description,
			images: [`${baseUrl}/thumbnail.png`],
			site: twitterHandle || undefined,
			creator: twitterHandle || undefined,
		},
		metadataBase: new URL(baseUrl),
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				'max-video-preview': -1,
				'max-image-preview': 'large',
				'max-snippet': -1,
			},
		},
		alternates: {
			canonical: baseUrl,
		},
	};
}

export default async function Page() {
	// server-side: check session
	const session = await auth(); // <-- must be usable on server

	if (session) {
		// server redirect (no client flash)
		redirect('/feed');
	}

	// not logged in -> render client UI
	return <HomeClient />;
}

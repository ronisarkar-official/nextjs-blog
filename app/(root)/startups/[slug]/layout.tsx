// app/startup/[id]/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { STARTUP_BY_SLUG_QUERY } from '@/sanity/lib/queries';

// Remove force-dynamic if not absolutely necessary
// export const dynamic = 'force-dynamic';

// Consider adding revalidation for better performance
export const revalidate = 3600; // 1 hour

interface StartupData {
	title?: string;
	excerpt?: string;
	description?: string;
	pitch?: string;
	image?: string | { url?: string; asset?: { url?: string } };
	author?: { name?: string };
	_createdAt?: string;
	_updatedAt?: string;
	_id?: string;
}

interface ResolvedParams {
	slug?: string | string[];
	id?: string | string[];
}

function resolveImageUrl(img: any): string | null {
	if (!img) return null;
	if (typeof img === 'string') return img;
	return img.url || img.asset?.url || null;
}

function truncateDescription(
	text: string = '',
	maxLength: number = 160,
): string {
	const cleaned = text.replace(/\s+/g, ' ').trim();
	return (
		cleaned.slice(0, maxLength) + (cleaned.length > maxLength ? '...' : '')
	);
}

export async function generateMetadata({
	params,
}: {
	params: ResolvedParams | Promise<ResolvedParams>;
}): Promise<Metadata> {
	const paramsResolved = await params;
	const slug =
		Array.isArray(paramsResolved.slug ?? paramsResolved.id) ?
			(paramsResolved.slug ?? paramsResolved.id)[0]
		:	((paramsResolved.slug ?? paramsResolved.id) as string);

	let post: StartupData | null = null;

	try {
		post = await client.fetch(STARTUP_BY_SLUG_QUERY, { slug });
	} catch (err) {
		console.error('Sanity fetch error for metadata:', err);
		// Return basic metadata without throwing error
		return getFallbackMetadata();
	}

	if (!post) {
		return getFallbackMetadata();
	}

	return generatePostMetadata(post, slug);
}

function getFallbackMetadata(): Metadata {
	const siteName = 'Startup Hub';
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

	return {
		title: `${siteName} - Discover Innovative Startups`,
		description:
			'A platform for startup enthusiasts to discover and share innovative businesses',
		keywords: 'startups, innovation, entrepreneurship, business ideas',
		openGraph: {
			title: siteName,
			description: 'A platform for startup enthusiasts',
			url: baseUrl,
			siteName,
			type: 'website',
			images: [`${baseUrl}/images/og-default.jpg`],
		},
		twitter: {
			card: 'summary_large_image',
			title: siteName,
			description: 'A platform for startup enthusiasts',
			images: [`${baseUrl}/images/og-default.jpg`],
		},
		metadataBase: new URL(baseUrl),
		robots: {
			index: true,
			follow: true,
		},
	};
}

function generatePostMetadata(post: StartupData, slug: string): Metadata {
	const siteName = 'SpecHype';
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
	const url = new URL(`/startups/${slug}`, baseUrl).toString();

	const title = post.title ?? siteName;

	const description = post.description ?? post.pitch ?? post.excerpt ?? '';

	const imageUrl =
		resolveImageUrl(post.image) || `${baseUrl}/images/og-default.jpg`;
	const authorName = post.author?.name;

	return {
		title,
		description,
		keywords: generateKeywords(post.title, post.pitch),
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
					url: imageUrl,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
			...(authorName && { authors: [authorName] }),
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [imageUrl],
		},
		metadataBase: new URL(baseUrl),
		alternates: {
			canonical: url,
		},
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
		...(post._createdAt && { publishTime: post._createdAt }),
	};
}

function generateKeywords(title?: string, pitch?: string): string {
	const baseKeywords = [
		'startup',
		'innovation',
		'entrepreneurship',
		'business',
		'technology',
	];

	if (!title) return baseKeywords.join(', ');

	const titleKeywords = title
		.toLowerCase()
		.split(/\s+/)
		.filter((word) => word.length > 3);
	const uniqueKeywords = [...new Set([...titleKeywords, ...baseKeywords])];

	return uniqueKeywords.slice(0, 10).join(', ');
}

export default async function StartupLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { id?: string | string[]; slug?: string | string[] };
}) {
	// allow both /startup/[slug] and /startup/[id] style params
	const rawParam = params?.slug ?? params?.id;
	const slug = Array.isArray(rawParam) ? rawParam[0] : rawParam;

	let post: StartupData | null = null;
	try {
		if (slug) {
			post = await client.fetch(STARTUP_BY_SLUG_QUERY, { slug });
		}
	} catch (err) {
		console.error('Sanity fetch error in layout:', err);
	}

	const siteName = 'SpecHype';
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
	const pageUrl =
		slug ? new URL(`/startups/${slug}`, baseUrl).toString() : baseUrl;
	const imageUrl =
		resolveImageUrl(post?.image) || `${baseUrl}/images/og-default.jpg`;
	const authorName = post?.author?.name ?? siteName;
	const datePublished = post?._createdAt;
	const dateModified = post?._updatedAt ?? post?._createdAt;

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'NewsArticle',
		mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
		headline: post?.title ?? `${siteName} - Startup`,
		image: [imageUrl],
		datePublished: datePublished,
		dateModified: dateModified,
		author: { '@type': 'Person', name: authorName },
		publisher: {
			'@type': 'Organization',
			name: siteName,
			logo: { '@type': 'ImageObject', url: `${baseUrl}/logo.png` },
		},
		description: truncateDescription(
			post?.description ?? post?.pitch ?? post?.excerpt ?? '',
			200,
		),
		keywords: generateKeywords(post?.title, post?.pitch),
		isAccessibleForFree: true,
		articleSection: 'Feed',
	};

	return (
		<div className="min-h-screen bg-white text-gray-900">
			{/* JSON-LD for NewsArticle */}
			{typeof window === 'undefined' && (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			)}

			<main
				itemScope
				itemType="https://schema.org/Article">
				{children}
			</main>
		</div>
	);
}

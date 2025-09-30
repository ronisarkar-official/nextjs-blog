// app/startup/[id]/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { STARTUP_BY_SLUG_QUERY } from '@/sanity/lib/queries';

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

function stripHtml(html = ''): string {
	return html
		.replace(/<[^>]*>/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function truncate(text = '', maxLength = 160): string {
	const cleaned = stripHtml(text);
	return cleaned.length > maxLength ?
			cleaned.slice(0, maxLength).trim() + '...'
		:	cleaned;
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
		.filter((w) => w.length > 3)
		.map((w) => w.replace(/[^a-z0-9]/g, ''))
		.filter(Boolean);

	const unique = Array.from(new Set([...titleKeywords, ...baseKeywords]));
	return unique.slice(0, 12).join(', ');
}

function isGameArticle(title?: string): boolean {
	if (!title) return false;
	const keywords = [
		'pc specs',
		'system requirements',
		'requirements',
		'battlefield',
		'game',
		'gpu',
		'fps',
	];
	const t = title.toLowerCase();
	return keywords.some((k) => t.includes(k));
}

function getSiteConfig() {
	const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'SpecHype';
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
	const siteTag = process.env.NEXT_PUBLIC_SITE_TAGLINE || '';
	const twitterHandle = process.env.NEXT_PUBLIC_SOCIAL_TWITTER || '';
	return { siteName, baseUrl, siteTag, twitterHandle };
}

export async function generateMetadata({
	params,
}: {
	params: ResolvedParams | Promise<ResolvedParams>;
}): Promise<Metadata> {
	const paramsResolved = await params;
	const raw = (paramsResolved.slug ?? paramsResolved.id) as
		| string
		| string[]
		| undefined;
	const slug = Array.isArray(raw) ? raw[0] : raw;

	if (!slug) return getFallbackMetadata();

	let post: StartupData | null = null;
	try {
		post = await client.fetch(STARTUP_BY_SLUG_QUERY, { slug });
	} catch (err) {
		console.error('Sanity fetch error for metadata:', err);
		return getFallbackMetadata();
	}

	if (!post) return getFallbackMetadata();

	return generatePostMetadata(post, slug);
}

function getFallbackMetadata(): Metadata {
	const { siteName, baseUrl, siteTag } = getSiteConfig();

	return {
		title: siteName,
		description:
			siteTag ||
			'A platform for startup enthusiasts to discover and share innovative businesses',
		keywords: 'startups, innovation, entrepreneurship',
		openGraph: {
			title: siteName,
			description: siteTag,
			url: baseUrl,
			siteName,
			type: 'website',
			images: [`${baseUrl}/og-default.png`],
		},
		twitter: {
			card: 'summary_large_image',
			title: siteName,
			description: siteTag,
			images: [`${baseUrl}/og-default.png`],
		},
		metadataBase: new URL(baseUrl),
		robots: { index: true, follow: true },
	};
}

function generatePostMetadata(post: StartupData, slug: string): Metadata {
	const { siteName, baseUrl, twitterHandle } = getSiteConfig();
	const url = new URL(`/startups/${slug}`, baseUrl).toString();

	// Use exact post title as the canonical title. Do NOT append site name here.
	const title = (post.title || siteName).trim();
	const description = truncate(
		post.description ?? post.pitch ?? post.excerpt ?? '',
	);
	const imageUrl =
		resolveImageUrl(post.image) || `${baseUrl}/images/og-default.jpg`;
	const authorName = post.author?.name;

	// OpenGraph and twitter explicitly use the same title to reduce the chances of search engines appending a site suffix.
	const metadata: Metadata = {
		title,
		description,
		keywords: generateKeywords(post.title, post.pitch),
		authors: authorName ? [{ name: authorName }] : undefined,
		openGraph: {
			title,
			description,
			url,
			siteName, // siteName can still exist in OG but keep title exact
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
			...(authorName ? { authors: [authorName] } : {}),
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [imageUrl],
			site: twitterHandle || undefined,
		},
		metadataBase: new URL(baseUrl),
		alternates: { canonical: url },
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
		// Keep publishTime only when available
		...(post._createdAt ? { publishTime: post._createdAt } : {}),
	};

	return metadata;
}

export default async function StartupLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { id?: string | string[]; slug?: string | string[] };
}) {
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

	const { siteName, baseUrl } = getSiteConfig();
	const pageUrl =
		slug ? new URL(`/startups/${slug}`, baseUrl).toString() : baseUrl;
	const imageUrl =
		resolveImageUrl(post?.image) || `${baseUrl}/images/og-default.png`;
	const authorName = post?.author?.name ?? siteName;
	const datePublished = post?._createdAt;
	const dateModified = post?._updatedAt ?? post?._createdAt;

	// Use TechArticle (better for technical / long-form guides). If it's not technical, Article is fine.
	const jsonLd: any = {
		'@context': 'https://schema.org',
		'@type': 'TechArticle',
		mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
		headline: post?.title || siteName,
		image: [imageUrl],
		datePublished,
		dateModified,
		author: { '@type': 'Person', name: authorName },
		publisher: {
			'@type': 'Organization',
			name: siteName,
			logo: { '@type': 'ImageObject', url: `${baseUrl}/logo.png` },
		},
		description: truncate(
			post?.description ?? post?.pitch ?? post?.excerpt ?? '',
		),
		keywords: generateKeywords(post?.title, post?.pitch),
		isAccessibleForFree: true,
		articleSection: 'Feed',
	};

	// If this looks like a game/system-requirements article, attach a VideoGame object.
	if (isGameArticle(post?.title)) {
		jsonLd.about = {
			'@type': 'VideoGame',
			name: post?.title,
			url: pageUrl,
			gamePlatform: 'PC',
			// These are optional placeholders — if you have the exact fields in Sanity, replace them.
			operatingSystem: 'Windows 10/11',
		};
	}

	// BreadcrumbList (helpful for SERP breadcrumbs)
	jsonLd.mainEntity = {
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Startups',
				item: new URL('/startups', baseUrl).toString(),
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: post?.title || 'Post',
				item: pageUrl,
			},
		],
	};

	return (
		<div className="min-h-screen bg-white text-gray-900">
			{/* JSON-LD renders server-side only */}
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

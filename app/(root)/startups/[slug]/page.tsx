// app/(root)/startups/[slug]/page.tsx
import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import markdownit from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import Greeting from '@/components/Greeting';

import { client } from '@/sanity/lib/client';
import {
	STARTUP_BY_SLUG_QUERY,
	PLAYLIST_BY_SLUG_QUERY,
	RECENT_STARTUPS_QUERY,
	RELATED_STARTUPS_BY_CATEGORY,
	PREV_STARTUP_IN_CATEGORY,
	NEXT_STARTUP_IN_CATEGORY,
	PREV_STARTUP_GLOBAL,
	NEXT_STARTUP_GLOBAL,
} from '@/sanity/lib/queries';
import { Skeleton } from '@/components/ui/skeleton';
import View from '@/components/View';
import StartupCard from '@/components/StartupCard';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import ShareButton from '@/components/ShareButton';
import {
	Facebook,
	Mail,
	Twitter,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';
import ArticleRenderer from '@/components/ArticleRender';
import { CommentSection } from '@/components/CommentSection';
import { auth } from '@/auth';
import { COMMENTS_BY_STARTUP_QUERY } from '@/sanity/lib/queries';
import TableOfContents from '@/components/TableOfContents';

// If you prefer ISR instead of fully dynamic responses, replace the above with a revalidate value like:
// export const revalidate = 60; // seconds

type StartupPost = any;

const md = new markdownit({ html: true, linkify: true });

// Sanitize options pulled out to top-level for reuse and performance
const SANITIZE_OPTIONS = {
	allowedTags: sanitizeHtml.defaults.allowedTags.concat([
		'img',
		'figure',
		'figcaption',
		'iframe',
		'table',
		'thead',
		'tbody',
		'tfoot',
		'tr',
		'th',
		'td',
		'pre',
		'code',
	]),
	allowedAttributes: {
		...sanitizeHtml.defaults.allowedAttributes,
		img: ['src', 'alt', 'width', 'height', 'loading'],
		a: ['href', 'name', 'target', 'rel'],
		iframe: [
			'src',
			'width',
			'height',
			'allow',
			'allowfullscreen',
			'frameborder',
			'loading',
			'referrerpolicy',
		],
		table: ['class'],
		'*': ['id'],
	},
	allowedSchemes: ['http', 'https', 'data', 'mailto'],
	allowIframeRelativeUrls: false,
	transformTags: {
		a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
	},
};

// small helpers
const slugify = (s: string) =>
	s
		.toLowerCase()
		.trim()
		.replace(/<[^>]*>/g, '')
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');

const formatDate = (dateString?: string) => {
	if (!dateString) return '';
	return new Date(dateString).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
};

// extract headings and inject ids into rendered HTML so TOC works without client JS
const renderMarkdownWithIds = (rawMd: string) => {
	const html = md.render(rawMd || '');

	const headingPattern = /<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi;
	const headings: { id: string; text: string; level: number }[] = [];

	const htmlWithIds = html.replace(
		headingPattern,
		(match, tag, attrs, inner) => {
			const text = inner.replace(/<[^>]*>/g, '');
			const id = slugify(text);
			const level = Number(tag.replace('h', ''));
			headings.push({ id, text, level });
			const hasId = /\bid\s*=/.test(attrs || '');
			const newAttrs =
				hasId ?
					attrs.replace(/\bid\s*=\s*"[^"]*"/i, `id="${id}"`)
				:	`${attrs} id="${id}"`;
			return `<${tag}${newAttrs}>${inner}</${tag}>`;
		},
	);

	return { html: htmlWithIds, headings };
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;

	// fetch the startup by slug
	let post: StartupPost | null = null;
	try {
		post = await client.fetch(STARTUP_BY_SLUG_QUERY, { slug });
	} catch (err) {
		// server-side logging
		// eslint-disable-next-line no-console
		console.error('Sanity fetch error (by slug):', err);
	}

	if (!post) return notFound();

	// fetch related posts (same category, exclude current)
	const relatedPosts =
		(await client.fetch(RELATED_STARTUPS_BY_CATEGORY, {
			category: post.category,
			slug: post.slug?.current,
		})) || [];

	// markdown -> html + headings
	const rawMd = post.pitch || '';
	const { html: htmlWithIds, headings } = renderMarkdownWithIds(rawMd);
	const safeHtml = sanitizeHtml(htmlWithIds, SANITIZE_OPTIONS);

	const authorImage = post.author?.image || '/images/avatar-placeholder.png';
	const heroImage = post.image || '/images/cover-placeholder.jpg';

	// fetch editor picks / popular posts (done server-side)
	const editorPosts = (await client.fetch(RECENT_STARTUPS_QUERY)) || [];
	const popularPosts = (await client.fetch(RECENT_STARTUPS_QUERY)) || [];

	// Prev/Next: prefer same category; fallback to global by created date
	const [prevInCat, nextInCat] = await Promise.all([
		client.fetch(PREV_STARTUP_IN_CATEGORY, {
			category: post.category,
			createdAt: post._createdAt,
		}),
		client.fetch(NEXT_STARTUP_IN_CATEGORY, {
			category: post.category,
			createdAt: post._createdAt,
		}),
	]);

	const [prevGlobal, nextGlobal] = await Promise.all([
		prevInCat ?
			Promise.resolve(null)
		:	client.fetch(PREV_STARTUP_GLOBAL, { createdAt: post._createdAt }),
		nextInCat ?
			Promise.resolve(null)
		:	client.fetch(NEXT_STARTUP_GLOBAL, { createdAt: post._createdAt }),
	]);

	const prevPost = prevInCat || prevGlobal;
	const nextPost = nextInCat || nextGlobal;

	// fetch comment data
	const session = await auth();
	const comments = await client.fetch(COMMENTS_BY_STARTUP_QUERY, {
		startupId: post._id,
	});

	// Structured data (Article) for SEO — server-rendered JSON-LD
	const siteBase = process.env.NEXT_PUBLIC_SITE_URL || '';
	const postUrl = `${siteBase}/startups/${post.slug?.current}`;

	return (
		<main className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
			{/* Floating Table of Contents trigger (client-side); fixed so no layout shift */}
			<TableOfContents headings={headings} />
			<div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
				<article className="md:col-span-2">
					{/* Breadcrumbs */}
					<Breadcrumb className="mb-4">
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link
										href="/feed"
										className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
										Home
									</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />

							<BreadcrumbItem>
								<Link
									href={`/feed?query=${post.category?.toLowerCase()}`}
									className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
									<BreadcrumbPage>{post.category}</BreadcrumbPage>
								</Link>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>

					<header className="mb-8">
						<Greeting className="inline-block text-xs px-3 py-2 rounded-full mb-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200" />

						<h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3 dark:text-gray-100">
							{post.title}
						</h1>

						<div className="flex items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
							<Link
								href={`/user/${post.author?._id}`}
								className="group inline-block"
								prefetch>
								<div className="flex items-center gap-3">
									<div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700">
										<Image
											src={authorImage || '/logo.png'}
											alt={post.author?.name || 'Author'}
											fill
											style={{ objectFit: 'cover' }}
											sizes="32px"
										/>
									</div>
									<div>
										<div className="font-medium text-gray-900 dark:text-gray-100">
											{post.author?.name || 'Unknown author'}
										</div>

										<div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
											<div className="text-xs">
												Published: {formatDate(post._createdAt)}
											</div>
										</div>
									</div>
								</div>
							</Link>

							<div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
								<Suspense fallback={<Skeleton className="view-skeleton" />}>
									{/* View component expects id; keep that contract */}
									<View id={post._id} />
								</Suspense>

								<div className="hidden sm:inline text-xs bg-gray-100 dark:bg-gray-800 px-2 py-2 shadow-sm dark:shadow-none rounded text-gray-700 dark:text-gray-200">
									{post.category}
								</div>
							</div>
						</div>
					</header>

					{/* Hero / Cover */}
					<div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
						<Image
							src={heroImage || '/logo.png'}
							alt={post.title || 'Cover image'}
							fill
							className="object-cover object-center"
							priority
							fetchPriority="high"
						/>
						{/* subtle overlay for legibility in dark mode */}
						<div
							className="absolute inset-0 pointer-events-none bg-black/0 dark:bg-black/20"
							aria-hidden
						/>
					</div>

					{/* Article content or placeholder */}
					<section className="max-w-none">
						{safeHtml ?
							<article className="prose prose-lg max-w-none dark:prose-invert">
								{/* Pass pre-sanitized HTML; skip internal sanitize to avoid double work */}
								<ArticleRenderer
									html={safeHtml}
									sanitize={false}
								/>
							</article>
						:	<div className="mx-auto max-w-4xl py-8 text-center">
								<p className="text-sm text-gray-500 dark:text-gray-400">
									No content available.
								</p>
							</div>
						}

						<hr className="my-8 border-t-2 border-gray-100 dark:border-gray-800 rounded" />

						{/* Social share links (use the slug URL for share target) */}
						<div className="flex items-center gap-3 text-sm">
							<ShareButton
								postTitle={post.title}
								postUrl={postUrl}
							/>
							<a
								href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
									post.title,
								)}&url=${encodeURIComponent(postUrl)}`}
								target="_blank"
								rel="noreferrer"
								aria-label="Share on Twitter"
								className="flex items-center space-x-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer">
								<Twitter className="w-5 h-5" />
								<span className="hidden sm:inline">Twitter</span>
							</a>

							{/* Share on Facebook */}
							<a
								href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
								target="_blank"
								rel="noreferrer"
								aria-label="Share on Facebook"
								className="flex items-center space-x-1 text-blue-800 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200 transition-colors cursor-pointer">
								<Facebook className="w-5 h-5" />
								<span className="hidden sm:inline">Facebook</span>
							</a>

							{/* Email Link */}
							<a
								href={`mailto:?subject=${encodeURIComponent(
									post.title,
								)}&body=${encodeURIComponent((post.description || '') + '\n\n' + postUrl)}`}
								aria-label="Share via Email"
								className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors cursor-pointer">
								<Mail className="w-5 h-5" />
								<span className="hidden sm:inline">Email</span>
							</a>
						</div>

						{/* Comment Section */}
						<div className="mt-8">
							<CommentSection
								slug={post.slug?.current || post._id}
								initialComments={comments || []}
								initialIsAuthenticated={!!session?.id}
								authorId={post.author?._id}
							/>
						</div>
					</section>

					{/* Prev/Next navigation (compact pill buttons) */}
					{(prevPost || nextPost) && (
						<nav className="mt-6 grid grid-cols-2 gap-3 items-center">
							<div>
								{prevPost && (
									<Link
										className="inline-flex max-w-full items-center gap-2 text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
										href={`/startups/${prevPost.slug}`}
										prefetch>
										<ChevronLeft
											className="w-3.5 h-3.5"
											aria-hidden
										/>
										<span className="truncate max-w-[14rem]">
											{prevPost.title}
										</span>
									</Link>
								)}
							</div>
							<div className="text-right">
								{nextPost && (
									<Link
										className="inline-flex max-w-full items-center gap-2 text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
										href={`/startups/${nextPost.slug}`}
										prefetch>
										<span className="truncate max-w-[14rem]">
											{nextPost.title}
										</span>
										<ChevronRight
											className="w-3.5 h-3.5"
											aria-hidden
										/>
									</Link>
								)}
							</div>
						</nav>
					)}

					{/* Related posts */}
					{relatedPosts?.length > 0 && (
						<section className="max-w-none mt-8">
							<p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 border-b-2 border-gray-200 dark:border-gray-800 pb-3">
								Related posts
							</p>
							<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mt-4 gap-4">
								{relatedPosts.map((p: any) => (
									<StartupCard
										key={p._id}
										post={p}
									/>
								))}
							</ul>
						</section>
					)}
				</article>

				{/* Sidebar */}
				<aside className="md:col-span-1">
					<div className="sticky top-6 space-y-6">
						<div>
							<div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
								Popular Posts
							</div>

							<div className="space-y-3">
								{popularPosts.map((p: any) => (
									<Link
										key={p._id}
										href={`/startups/${p.slug}`}
										className="block group"
										prefetch>
										<div className="flex items-start gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md dark:shadow-none hover:border-gray-300 transition-all duration-200">
											<div className="w-24 h-16 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 border border-transparent">
												<Image
													src={p.image || '/images/cover-placeholder.jpg'}
													alt={p.title}
													fill
													className="object-cover group-hover:scale-105 transition-transform duration-300"
													sizes="96px"
												/>
											</div>

											<div className="flex-1">
												<div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
													{formatDate(p._createdAt)}{' '}
													<span className="mx-1">•</span> {p.category}
												</div>
												<div className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
													{p.title}
												</div>
											</div>
										</div>
									</Link>
								))}
							</div>
						</div>

						<div>
							<div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
								Labels
							</div>
							{(() => {
								const labels = Array.from(
									new Set(
										[
											post.category,
											...relatedPosts.map((p: any) => p.category),
											...popularPosts.map((p: any) => p.category),
										].filter(Boolean),
									),
								).slice(0, 12);

								if (labels.length === 0)
									return (
										<div className="text-xs text-gray-500 dark:text-gray-400">
											No labels
										</div>
									);

								return (
									<div className="flex flex-wrap gap-2">
										{labels.map((label) => (
											<Link
												key={label}
												href={`/feed?query=${encodeURIComponent(label.toLowerCase())}`}
												className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
												prefetch
												aria-label={`Filter by ${label}`}>
												{label}
											</Link>
										))}
									</div>
								);
							})()}
						</div>
					</div>
				</aside>
			</div>
			{/* JSON-LD Article structured data for SEO */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'Article',
						headline: post.title,
						datePublished: post._createdAt,
						author:
							post.author?.name ?
								{ '@type': 'Person', name: post.author?.name }
							:	undefined,
						image: heroImage,
						mainEntityOfPage: postUrl,
						articleSection: post.category,
						description: post.description,
					}),
				}}
			/>
		</main>
	);
}

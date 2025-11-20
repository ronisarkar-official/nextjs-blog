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
	RECENT_STARTUPS_QUERY,
	RELATED_STARTUPS_BY_CATEGORY,
	PREV_STARTUP_IN_CATEGORY,
	NEXT_STARTUP_IN_CATEGORY,
	PREV_STARTUP_GLOBAL,
	NEXT_STARTUP_GLOBAL,
	COMMENTS_BY_STARTUP_QUERY,
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
import TableOfContents from '@/components/TableOfContents';
import { formatDate } from '@/lib/utils';

// ISR: Revalidate every 60 seconds for better performance
export const revalidate = 60;

// Generate static params for top posts at build time
export async function generateStaticParams() {
	const posts = await client.fetch(
		`*[_type == "startup"][0...50]{ "slug": slug.current }`,
	);
	return posts.map((post: any) => ({ slug: post.slug }));
}

// Generate metadata for SEO
export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = await client.fetch(STARTUP_BY_SLUG_QUERY, { slug });

	if (!post) return { title: 'Not Found' };

	const siteBase = process.env.NEXT_PUBLIC_SITE_URL || '';
	const postUrl = `${siteBase}/startups/${post.slug?.current}`;

	return {
		title: post.title,
		description: post.description || post.title,
		openGraph: {
			title: post.title,
			description: post.description,
			url: postUrl,
			images: [{ url: post.image || '/images/cover-placeholder.jpg' }],
			type: 'article',
			publishedTime: post._createdAt,
		},
		twitter: {
			card: 'summary_large_image',
			title: post.title,
			description: post.description,
			images: [post.image || '/images/cover-placeholder.jpg'],
		},
	};
}

type StartupPost = any;

// Singleton markdown instance
const md = new markdownit({ html: true, linkify: true });

// Sanitize options - constant reference
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

// Optimized helpers
const slugify = (s: string) =>
	s
		.toLowerCase()
		.trim()
		.replace(/<[^>]*>/g, '')
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');

// Memoized markdown rendering with heading extraction
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
				:	`\n${attrs} id="${id}"`;
			return `<${tag}${newAttrs}>${inner}</${tag}>`;
		},
	);

	return { html: htmlWithIds, headings };
};

export default async function Page({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	// Parallel data fetching with Promise.all for better performance
	const [post, session] = await Promise.all([
		client.fetch(STARTUP_BY_SLUG_QUERY, { slug }).catch(() => null),
		auth(),
	]);

	if (!post) return notFound();

	// Parallel fetch for all related data
	const [relatedPosts, editorPosts, comments, prevInCat, nextInCat] =
		await Promise.all([
			client
				.fetch(RELATED_STARTUPS_BY_CATEGORY, {
					category: post.category,
					slug: post.slug?.current,
				})
				.catch(() => []),
			client.fetch(RECENT_STARTUPS_QUERY).catch(() => []),
			client
				.fetch(COMMENTS_BY_STARTUP_QUERY, { startupId: post._id })
				.catch(() => []),
			client
				.fetch(PREV_STARTUP_IN_CATEGORY, {
					category: post.category,
					createdAt: post._createdAt,
				})
				.catch(() => null),
			client
				.fetch(NEXT_STARTUP_IN_CATEGORY, {
					category: post.category,
					createdAt: post._createdAt,
				})
				.catch(() => null),
		]);

	// Fetch global prev/next only if category-specific not found
	const [prevGlobal, nextGlobal] = await Promise.all([
		!prevInCat ?
			client
				.fetch(PREV_STARTUP_GLOBAL, { createdAt: post._createdAt })
				.catch(() => null)
		:	null,
		!nextInCat ?
			client
				.fetch(NEXT_STARTUP_GLOBAL, { createdAt: post._createdAt })
				.catch(() => null)
		:	null,
	]);

	const prevPost = prevInCat || prevGlobal;
	const nextPost = nextInCat || nextGlobal;

	// Process markdown
	const { html: htmlWithIds, headings } = renderMarkdownWithIds(
		post.pitch || '',
	);
	const safeHtml = sanitizeHtml(htmlWithIds, SANITIZE_OPTIONS);

	// Optimized image handling
	const authorImage = post.author?.image || '/images/avatar-placeholder.png';
	const heroImage = post.image || '/images/cover-placeholder.jpg';

	const siteBase = process.env.NEXT_PUBLIC_SITE_URL || '';
	const postUrl = `${siteBase}/startups/${post.slug?.current}`;

	// Deduplicate and extract unique labels
	const uniqueLabels = Array.from(
		new Set(
			[
				post.category,
				...relatedPosts.map((p: any) => p.category),
				...editorPosts.map((p: any) => p.category),
			].filter(Boolean),
		),
	).slice(0, 12);

	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: post.title,
		datePublished: post._createdAt,
		author:
			post.author?.name ?
				{ '@type': 'Person', name: post.author.name }
			:	undefined,
		image: heroImage,
		mainEntityOfPage: postUrl,
		articleSection: post.category,
		description: post.description,
	};

	return (
		<>
			<main className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
				<TableOfContents headings={headings} />

				<div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
					<article className="md:col-span-2">
						{/* Breadcrumbs */}
						<Breadcrumb className="mb-4">
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink asChild>
										<Link
											href="/"
											className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
											Home
										</Link>
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<Link
										href={`/?query=${post.category?.toLowerCase()}`}
										className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
										<BreadcrumbPage>{post.category}</BreadcrumbPage>
									</Link>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>

						<header className="mb-8">
							<Suspense
								fallback={
									<Skeleton className="inline-block h-6 w-28 rounded-full mb-3" />
								}>
								<Greeting className="inline-block text-xs px-3 py-2 rounded-full mb-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200" />
							</Suspense>
							<h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3 dark:text-gray-100">
								{post.title}
							</h1>

							<div className="flex items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
								<Link
									href="https://ronisarkar.spechype.com"
									target="_blank"
									rel="noopener noreferrer"
									className="group inline-block"
									prefetch={false}>
									<div className="flex items-center gap-3">
										<div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700">
											<Image
												src={authorImage}
												alt={post.author?.name || 'Author'}
												fill
												sizes="32px"
												className="object-cover"
											/>
										</div>
										<div>
											<div className="font-medium text-gray-900 dark:text-gray-100">
												{post.author?.name || 'Unknown author'}
											</div>
											<div className="text-xs text-gray-500 dark:text-gray-400">
												Published: {formatDate(post._createdAt)}
											</div>
										</div>
									</div>
								</Link>

								<div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
									<Suspense
										fallback={<Skeleton className="w-12 h-5 rounded" />}>
										<View id={post._id} />
									</Suspense>
									<div className="hidden sm:inline text-xs bg-gray-100 dark:bg-gray-800 px-2 py-2 shadow-sm dark:shadow-none rounded text-gray-700 dark:text-gray-200">
										{post.category}
									</div>
								</div>
							</div>
						</header>

						{/* Hero Image - keep out of Suspense to preserve LCP */}
						<div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4 border border-gray-200 dark:border-gray-700">
							<Image
								src={heroImage}
								alt={post.title || 'Cover image'}
								fill
								priority
								fetchPriority="high"
								sizes="100vw"
								style={{ objectFit: 'cover' }}
								className="rounded-lg"
							/>
							<div
								className="absolute inset-0 pointer-events-none "
								aria-hidden
							/>
						</div>

						{/* Article Content */}
						<section className="max-w-none">
							{safeHtml ?
								<article className="prose prose-lg max-w-none dark:prose-invert">
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

							{/* Social Share */}
							<div className="flex items-center gap-3 text-sm">
								<Suspense
									fallback={
										<div className="w-10 h-8 rounded bg-gray-100 dark:bg-gray-800" />
									}>
									<ShareButton
										postTitle={post.title}
										postUrl={postUrl}
									/>
								</Suspense>
								<a
									href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`}
									target="_blank"
									rel="noreferrer"
									aria-label="Share on Twitter"
									className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 transition-colors">
									<Twitter className="w-5 h-5" />
									<span className="hidden sm:inline">Twitter</span>
								</a>
								<a
									href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
									target="_blank"
									rel="noreferrer"
									aria-label="Share on Facebook"
									className="flex items-center space-x-1 text-blue-800 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200 transition-colors">
									<Facebook className="w-5 h-5" />
									<span className="hidden sm:inline">Facebook</span>
								</a>
								<a
									href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent((post.description || '') + '\n\n' + postUrl)}`}
									aria-label="Share via Email"
									className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors">
									<Mail className="w-5 h-5" />
									<span className="hidden sm:inline">Email</span>
								</a>
							</div>

							{/* Comments */}
							<div className="mt-8">
								<Suspense fallback={<Skeleton className="h-40 w-full" />}>
									<CommentSection
										slug={post.slug?.current || post._id}
										initialComments={comments}
										initialIsAuthenticated={!!session?.id}
										authorId={post.author?._id}
									/>
								</Suspense>
							</div>
						</section>

						{/* Prev/Next Navigation */}
						{(prevPost || nextPost) && (
							<nav className="mt-6 grid grid-cols-2 gap-3">
								<div>
									{prevPost && (
										<Link
											className="inline-flex max-w-full items-center gap-2 text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
											href={`/startups/${prevPost.slug}`}
											prefetch={false}>
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
											prefetch={false}>
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

						{/* Related Posts */}
						{relatedPosts.length > 0 && (
							<section className="max-w-none mt-8">
								<p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 border-b-2 border-gray-200 dark:border-gray-800 pb-3">
									Related posts
								</p>
								<ul className="grid grid-cols-1 sm:grid-cols-2 mt-4 gap-4">
									{relatedPosts.map((p: any) => (
										<li key={p._id}>
											<Suspense
												fallback={
													<div className="h-40 rounded-lg bg-gray-100 dark:bg-gray-800" />
												}>
												<StartupCard post={p} />
											</Suspense>
										</li>
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
									{editorPosts.map((p: any) => (
										<Suspense
											key={p._id}
											fallback={
												<div className="w-full h-20 rounded-xl bg-gray-100 dark:bg-gray-800" />
											}>
											<Link
												href={`/startups/${p.slug}`}
												className="block group"
												prefetch={false}>
												<div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md dark:shadow-none hover:border-gray-300 transition-all duration-200 justify-between">
													<div className="w-24 h-16 relative rounded-lg overflow-hidden flex-shrink-0  bg-gray-100 dark:bg-gray-700">
														<Image
															src={p.image || '/images/cover-placeholder.jpg'}
															alt={p.title}
															fill
															sizes="96px"
															className="object-cover group-hover:scale-105 transition-transform duration-300"
														/>
													</div>
													<div className="flex-1">
														<div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
															{formatDate(p._createdAt)}
															<span className="mx-1">•</span> {p.category}
														</div>
														<div className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
															{p.title}
														</div>
													</div>
												</div>
											</Link>
										</Suspense>
									))}
								</div>
							</div>

							<div>
								<div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
									Labels
								</div>
								{uniqueLabels.length > 0 ?
									<div className="flex flex-wrap gap-2">
										{uniqueLabels.map((label) => (
											<Link
												key={label}
												href={`/?query=${encodeURIComponent(label.toLowerCase())}`}
												className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
												prefetch={false}
												aria-label={`Filter by ${label}`}>
												{label}
											</Link>
										))}
									</div>
								:	<div className="text-xs text-gray-500 dark:text-gray-400">
										No labels
									</div>
								}
							</div>
						</div>
					</aside>
				</div>
			</main>

			{/* Structured Data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>
		</>
	);
}

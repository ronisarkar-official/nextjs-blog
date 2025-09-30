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
import { Facebook, Mail, Twitter } from 'lucide-react';
import ArticleRenderer from '@/components/ArticleRender';

// Server rendering policy: change to `force-dynamic` if you need always-fresh data.
export const experimental_ppr = true;
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
	]),
	allowedAttributes: {
		...sanitizeHtml.defaults.allowedAttributes,
		img: ['src', 'alt', 'width', 'height', 'loading'],
		a: ['href', 'name', 'target', 'rel'],
		'*': ['id'],
	},
	allowedSchemes: ['http', 'https', 'data', 'mailto'],
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

	const headingPattern = /<(h[1-6])>(.*?)<\/\1>/gi;
	const headings: { id: string; text: string; level: number }[] = [];

	const htmlWithIds = html.replace(headingPattern, (match, tag, inner) => {
		const text = inner.replace(/<[^>]*>/g, '');
		const id = slugify(text);
		headings.push({ id, text, level: Number(tag.replace('h', '')) });
		return `<${tag} id="${id}">${inner}</${tag}>`;
	});

	return { html: htmlWithIds, headings };
};

export default async function Page({ params }: { params: { slug: string } }) {
	const { slug } = params;

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

	// markdown -> html + headings
	const rawMd = post.pitch || '';
	const { html: htmlWithIds, headings } = renderMarkdownWithIds(rawMd);
	const safeHtml = sanitizeHtml(htmlWithIds, SANITIZE_OPTIONS);

	const authorImage = post.author?.image || '/images/avatar-placeholder.png';
	const heroImage = post.image || '/images/cover-placeholder.jpg';

	// fetch editor picks / popular posts (done server-side)
	const editorPosts = (await client.fetch(RECENT_STARTUPS_QUERY)) || [];
	const popularPosts = (await client.fetch(RECENT_STARTUPS_QUERY)) || [];

	// Structured data (Article) for SEO — server-rendered JSON-LD
	const siteBase = process.env.NEXT_PUBLIC_SITE_URL || '';
	const postUrl = `${siteBase}/startups/${post.slug?.current}`;

	return (
		<main className="min-h-screen bg-white text-gray-900">
			<div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
				<article className="md:col-span-2">
					<Breadcrumb className="mb-4">
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link href="/feed">Home</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />

							<BreadcrumbItem>
								<Link href={`/feed?query=${post.category?.toLowerCase()}`}>
									<BreadcrumbPage>{post.category}</BreadcrumbPage>
								</Link>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>

					<header className="mb-8">
						<Greeting className="inline-block text-xs px-3 py-2 rounded-full mb-3" />

						<h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
							{post.title}
						</h1>

						<div className="flex items-center justify-between gap-4 text-sm text-gray-600">
							<Link
								href={`/user/${post.author?._id}`}
								className="group inline-block"
								prefetch>
								<div className="flex items-center gap-3">
									<div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-300">
										<Image
											src={authorImage || '/logo.png'}
											alt={post.author?.name || 'Author'}
											fill
											style={{ objectFit: 'cover' }}
											sizes="32px"
										/>
									</div>
									<div>
										<div className="font-medium">
											{post.author?.name || 'Unknown author'}
										</div>

										<div className="text-xs text-gray-500 flex items-center gap-3">
											<div className="text-xs">
												Published: {formatDate(post._createdAt)}
											</div>
										</div>
									</div>
								</div>
							</Link>

							<div className="text-xs text-gray-500 flex items-center gap-3">
								<Suspense fallback={<Skeleton className="view-skeleton" />}>
									{/* View component expects id; keep that contract */}
									<View id={post._id} />
								</Suspense>

								<div className="hidden sm:inline text-xs bg-gray-100 px-2 py-2 shadow-sm rounded">
									{post.category}
								</div>
							</div>
						</div>
					</header>

					<div
						className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 
					 mb-4">
						<Image
							src={heroImage || '/logo.png'}
							alt={post.title || 'Cover image'}
							fill
							className="object-cover object-center"
							priority
						/>
					</div>

					<section className="max-w-none">
						{safeHtml ?
							<article>
								<ArticleRenderer html={safeHtml} />
							</article>
						:	<div className="mx-auto max-w-4xl py-8 text-center">
								<p className="text-sm text-gray-500">No content available.</p>
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
								className="flex items-center space-x-1 text-blue-500 hover:text-blue-700 transition-colors cursor-pointer">
								<Twitter className="w-5 h-5" />
								<span className="hidden sm:inline">Twitter</span>{' '}
								{/* Keep text for accessibility, hide on smaller screens if desired */}
							</a>

							{/* Share on Facebook */}
							<a
								href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
								target="_blank"
								rel="noreferrer"
								aria-label="Share on Facebook"
								// Consider changing the className to a custom utility class
								className="flex items-center space-x-1 text-blue-800 hover:text-blue-900 transition-colors cursor-pointer">
								<Facebook className="w-5 h-5" />
								<span className="hidden sm:inline">Facebook</span>
							</a>

							{/* Email Link */}
							<a
								href={`mailto:?subject=${encodeURIComponent(
									post.title,
								)}&body=${encodeURIComponent((post.description || '') + '\n\n' + postUrl)}`}
								aria-label="Share via Email"
								className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
								<Mail className="w-5 h-5" />
								<span className="hidden sm:inline">Email</span>
							</a>
						</div>
					</section>

					{editorPosts?.length > 0 && (
						<section className="max-w-none mt-4">
							<p className="text-80-semibold text-2xl border-b-2 border-gray-400">
								You Might Like
							</p>
							<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mt-4 gap-4">
								{editorPosts.map((p: any) => (
									<StartupCard
										key={p._id}
										post={p}
									/>
								))}
							</ul>
						</section>
					)}
				</article>

				<aside className="md:col-span-1">
					<div className="sticky top-6 space-y-6">
						<div>
							<div className="text-sm font-semibold text-gray-700 mb-3">
								Popular Posts
							</div>

							<div className="space-y-3">
								{popularPosts.map((p: any) => (
									<Link
										key={p._id}
										href={`/startups/${p.slug}`}
										className="block group"
										prefetch>
										<div className="flex items-start gap-2 bg-white border border-gray-300 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
											<div className="w-24 h-16 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border-gray-300">
												<Image
													src={p.image || '/images/cover-placeholder.jpg'}
													alt={p.title}
													fill
													className="object-cover group-hover:scale-107 transition-transform duration-300 border-gray-300"
													sizes="96px"
												/>
											</div>

											<div className="flex-1">
												<div className="text-xs text-gray-500 mb-1">
													{formatDate(p._createdAt)}{' '}
													<span className="mx-1">•</span> {p.category}
												</div>
												<div className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
													{p.title}
												</div>
											</div>
										</div>
									</Link>
								))}
							</div>
						</div>

						<div>
							<div className="text-sm font-semibold text-gray-700 mb-3">
								Labels
							</div>
							<div className="flex flex-wrap gap-2">
								<span className="text-xs bg-gray-100 px-2 py-1 rounded">
									games
								</span>
								<span className="text-xs bg-gray-100 px-2 py-1 rounded">
									reviews
								</span>
								<span className="text-xs bg-gray-100 px-2 py-1 rounded">
									news
								</span>
							</div>
						</div>
					</div>
				</aside>
			</div>
		</main>
	);
}

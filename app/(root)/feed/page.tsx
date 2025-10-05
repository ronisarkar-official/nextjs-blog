export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import type { StartupTypeCard } from '@/components/StartupCard';
import SearchForm from '@/components/SearchForm';
import { client } from '@/sanity/lib/client'; // use client directly to control useCdn
import { SanityLive } from '@/sanity/lib/live';
import FeedClient from '@/components/FeedClient';

export default async function Home({
	searchParams,
}: {
	searchParams: Promise<{ query?: string }>;
}) {
	const { query: rawQuery } = (await searchParams) || {};
	const query = (rawQuery || '').trim();
	const searchParam = query ? `*${query}*` : null;

	// fetch initial page (SSR) — limit to page size for faster TTFB
	const PAGE_SIZE = 12;
	const INITIAL_QUERY = `*[_type == "startup" && defined(slug.current) && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(_createdAt desc)[0...$limit] {
  _id,
  title,
  slug,
  _createdAt,
  author -> { _id, name, image, bio },
  views,
  description,
  category,
  image,
}`;
	const posts: StartupTypeCard[] = await client
		.withConfig({ useCdn: false })
		.fetch(INITIAL_QUERY, {
			search: searchParam,
			limit: PAGE_SIZE,
		});
	const nextCursor =
		posts?.length === PAGE_SIZE ? posts[posts.length - 1]?._createdAt : null;

	return (
		<main className="pt-16 pb-5 max-w-screen-xl mx-auto min-h-screen px-2 sm:px-6 lg:px-14">
			<SearchForm query={query} />
			<p className="text-30-semibold mt-6">
				{query ? `Showing results for "${query}"` : 'All Posts'}
			</p>

			<FeedClient
				initialPosts={posts}
				initialNextCursor={nextCursor}
				query={query}
				pageSize={PAGE_SIZE}
			/>

			<SanityLive />
		</main>
	);
}

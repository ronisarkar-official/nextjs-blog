export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import StartupCard, { StartupTypeCard } from '@/components/StartupCard';
import SearchForm from '@/components/SearchForm';
import { STARTUPS_QUERY } from '@/sanity/lib/queries';
import { client } from '@/sanity/lib/client'; // use client directly to control useCdn
import { SanityLive } from '@/sanity/lib/live';

export default async function Home({
	searchParams,
}: {
	searchParams: Promise<{ query?: string }>;
}) {
	const { query: rawQuery } = (await searchParams) || {};
	const query = (rawQuery || '').trim();
	const searchParam = query ? `*${query}*` : null;

	// fetch fresh data (client configured with useCdn: false)
	const posts: StartupTypeCard[] = await client.fetch(STARTUPS_QUERY, {
		search: searchParam,
	});

	return (
		<main className="pt-16 pb-5 max-w-screen-xl mx-auto min-h-screen px-2 sm:px-6 lg:px-14">
			<SearchForm query={query} />
			<p className="text-30-semibold mt-6">
				{query ? `Showing results for "${query}"` : 'All Posts'}
			</p>

			<section className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 pt-6">
				{posts?.length > 0 ?
					posts.map((post) => (
						<StartupCard
							key={post._id}
							post={post}
						/>
					))
				:	<p className="no-results">No startups found</p>}
			</section>

			<SanityLive />
		</main>
	);
}

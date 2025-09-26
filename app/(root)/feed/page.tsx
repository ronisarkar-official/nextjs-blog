import React from 'react';
import Link from 'next/link';
import StartupCard, { StartupTypeCard } from '@/components/StartupCard';
import SearchForm from '@/components/SearchForm';
import { STARTUPS_QUERY } from '@/sanity/lib/queries';
import { sanityFetch, SanityLive } from '@/sanity/lib/live';
import { auth } from '@/auth';

export default async function Home({
	searchParams,
}: {
	searchParams: Promise<{ query?: string }>;
}) {
	const { query: rawQuery } = (await searchParams) || {};
	const query = (rawQuery || '').trim();

	// Always pass $search param to avoid GROQ parse error
	const searchParam = query ? `*${query}*` : null;

	// Fetch startups from Sanity with search param guaranteed
	const { data: posts } = await sanityFetch({
		query: STARTUPS_QUERY,
		params: { search: searchParam },
	});

	// Optional: fetch user session
	const session = await auth();

	return (
		<main className="pt-16 pb-5 max-w-screen-xl mx-auto min-h-screen px-2 sm:px-6 lg:px-14">
			

			<SearchForm query={query} />

			<p className="text-30-semibold mt-6">
				{query ? `Showing results for "${query}"` : 'All Posts'}
			</p>

			<section className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 pt-6">
				{posts?.length > 0 ?
					posts.map((post: StartupTypeCard) => (
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

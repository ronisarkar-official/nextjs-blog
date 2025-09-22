// app/page.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import SearchForm from '../../components/SearchForm';
import { promises } from 'dns';
import StartupCard, { StartupTypeCard } from '@/components/StartupCard';
import { STARTUPS_QUERY } from '@/sanity/lib/queries';
import { sanityFetch, SanityLive } from '@/sanity/lib/live';
import { auth } from '@/auth';



export default async function Home({
	searchParams,
}: {
	searchParams: Promise<{ query?: string }>;
}) {
	
	const query = (await searchParams).query || '';
	const params = { search: query || null };

	const session = await auth();
	
console.log(session?.id);
	const { data: posts } = await sanityFetch({ query: STARTUPS_QUERY, params });

	const defaultImage = '/images/hero/default.jpg';

	return (
		<main className="pt-16 pb-5 max-w-screen-xl mx-auto min-h-screen px-2 sm:px-6 lg:px-14">
			<article className="w-fit mx-auto 2xl:max-w-5xl xl:max-w-4xl max-w-2xl text-center space-y-6">
				<div
					data-scroll
					className="2xl:text-7xl text-black xl:text-6xl sm:text-5xl text-4xl leading-[100%]">
					Pitch Your{' '}
					<span className="font-semibold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
						Startups,
					</span>{' '}
					Connect with{' '}
					<span className="font-semibold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
						Entrepreneurs
					</span>
				</div>
			</article>

			<SearchForm query={query} />
			<p className="text-30-semibold mt-6">
				{query ? `Showing results for "${query}"` : 'All Posts'}
			</p>
			<section className=" grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 pt-6 ">
				{posts?.length > 0 ?
					posts.map((post: StartupTypeCard) => (
						<StartupCard
							key={post?._id}
							post={post}
						/>
					))
				:	<p className="no-results">No startups found</p>}
			</section>
			<SanityLive />
		</main>
	);
}

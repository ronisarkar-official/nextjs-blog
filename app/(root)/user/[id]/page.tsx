import { auth } from '@/auth';
import { client } from '@/sanity/lib/client';
import {
	AUTHOR_BY_ID_QUERY,
	STARTUPS_BY_AUTHOR_QUERY,
} from '@/sanity/lib/queries';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import UserStartups from '@/components/UserStartups';
import { Suspense } from 'react';
import { StartupCardSkeleton } from '@/components/StartupCard';

export const experimental_ppr = true;

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
	const id = (await params).id;
	const session = await auth();
	const startups = await client.fetch(STARTUPS_BY_AUTHOR_QUERY, { id });
	const user = await client.fetch(AUTHOR_BY_ID_QUERY, { id });
	if (!user) return notFound();

	// small defensive defaults so UI never breaks
	const image = user.image || '/avatar-placeholder.png';
	const bio = user.bio || 'No bio provided.';
	const username = user.username || 'user';
	const startupsCount = startups ?? 0;

	return (
		<main className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-10">
			<div className="max-w-7xl mx-auto px-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
					{/* Profile Card (left) */}
					<aside className="lg:sticky lg:top-24">
						<div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
							<div className="p-6 border-b border-gray-100 bg-white">
								<div className="flex items-center gap-5">
									<div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-2xl ring-2 ring-gray-200 shadow-sm">
										<Image
											src={image}
											alt={user.name}
											width={80}
											height={80}
											className="object-cover w-full h-full"
										/>
									</div>

									<div className="flex-1">
										<h1 className="text-xl font-semibold text-gray-900 tracking-tight">
											{user.name}
										</h1>
										<p className="text-sm text-gray-500">@{username}</p>
									</div>
								</div>

								{bio && (
									<p className="mt-4 text-sm text-gray-700 leading-relaxed">
										{bio}
									</p>
								)}
							</div>
						</div>
					</aside>

					{/* Startups & content (right) - spans 2 cols on large */}
					<section className="lg:col-span-2">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-2xl font-semibold text-gray-900">
								{session?.id === id ? 'Your' : `${user.name}'s`} Startups
							</h2>
							<div className="text-sm text-gray-500">
								Showing latest projects
							</div>
						</div>

						<div className="space-y-6">
							<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
								<Suspense fallback={<StartupCardSkeleton />}>
									<UserStartups id={id} />
								</Suspense>
							</ul>

							{/* empty state */}
							{startupsCount === 0 && (
								<div className="rounded-xl border border-dashed border-gray-200 bg-white/60 p-6 text-center">
									<p className="text-gray-600">
										No startups yet.
										{session?.id === id ?
											' Create your first startup to get started.'
										:	''}
									</p>
								</div>
							)}

							{/* other profile content you might want to surface */}
							<div className="rounded-xl p-6 bg-white shadow-sm border border-gray-50">
								<h3 className="text-sm font-medium text-gray-900 mb-2">
									About {user.name}
								</h3>
								<p className="text-sm text-gray-600 leading-relaxed">
									{user.longBio || 'No extended bio available.'}
								</p>
							</div>
						</div>
					</section>
				</div>
			</div>
		</main>
	);
};

export default Page;

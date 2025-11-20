import { client } from '@/sanity/lib/client';
import Ping from './Ping';
import { STARTUP_VIEWS_QUERY } from '@/sanity/lib/queries';
import { writeClient } from '@/sanity/lib/write-client';
import { after } from 'next/server';
import { addDays } from '@/lib/utils';

const View = async ({ id }: { id: string }) => {
	if (!id) return null;

	// safer fetch handling
	const doc = await client
		.withConfig({ useCdn: false })
		.fetch(STARTUP_VIEWS_QUERY, { id });
	const totalViews = doc?.views ?? 0;

	// ensure views exists before incrementing (atomic)
	after(async () => {
		try {
			const res = await writeClient
				.patch(id)
				.setIfMissing({ views: 0 }) // <- ensures field exists
				.inc({ views: 1 })
				.commit();
			const newViews = (totalViews ?? 0) + 1;
			// If a views milestone reached (100, 200, ...), notify the author
			if (newViews % 100 === 0) {
				try {
					// fetch author id minimally to avoid heavy query
					const doc = await client.fetch(
						`*[_type == "startup" && _id == $id][0]{ _id, title, "authorId": author->_id, "slug": slug.current }`,
						{ id },
					);
					const authorId = doc?.authorId;
					if (authorId) {
						const expires = addDays(new Date(), 4).toISOString();
						await writeClient.create({
							_type: 'notification',
							recipient: { _type: 'reference', _ref: authorId },
							type: 'views_milestone',
							message: `Your post "${doc?.title ?? ''}" reached ${newViews} views`,
							link: `/startups/${encodeURIComponent(doc?.slug || '')}`,
							read: false,
							createdAt: new Date().toISOString(),
							expiresAt: expires,
							meta: {
								startupId: id,
								startupSlug: doc?.slug,
								milestone: newViews,
							},
						});
					}
				} catch (e) {
					console.warn('Failed to create views milestone notification', e);
				}
			}
		} catch (err) {
			console.error('Failed to increment views:', err);
		}
	});

	const displayCount = totalViews + 1;

	// Format view count like YouTube (1.2K, 1M, etc.)
	const formatViewCount = (count: number): string => {
		if (count >= 1_000_000) {
			return (count / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
		}
		if (count >= 1_000) {
			return (count / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
		}
		return count.toString();
	};

	return (
		<div className="relative inline-flex items-center gap-2 px-2 py-2 rounded-xs bg-gray-100 dark:bg-gray-800 shadow-sm dark:shadow-lg transition-colors">
			<div className="absolute -top-1 -right-1">
				{/* make the ping icon adapt to theme */}
				<Ping aria-hidden />
			</div>

			<p className="text-xs">
				<span className="font-bold text-gray-900 dark:text-gray-100">
					{formatViewCount(displayCount)}
				</span>
				<span className="ml-1 text-gray-600 dark:text-gray-300">views</span>
			</p>
		</div>
	);
};

export default View;

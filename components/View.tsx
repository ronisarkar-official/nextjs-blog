import { client } from '@/sanity/lib/client';
import Ping from './Ping';
import { STARTUP_VIEWS_QUERY } from '@/sanity/lib/queries';
import { writeClient } from '@/sanity/lib/write-client';
import { after } from 'next/server';

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
			await writeClient
				.patch(id)
				.setIfMissing({ views: 0 }) // <- ensures field exists
				.inc({ views: 1 })
				.commit();
		} catch (err) {
			console.error('Failed to increment views:', err);
		}
	});

	const displayCount = totalViews + 1;

	return (
		<div className="relative inline-flex items-center gap-2 px-2 py-2 rounded-xs bg-gray-100 dark:bg-gray-800 shadow-sm dark:shadow-lg transition-colors">
			<div className="absolute -top-1 -right-1">
				{/* make the ping icon adapt to theme */}
				<Ping
					 
					aria-hidden
				/>
			</div>

			<p className="text-xs">
				<span className="font-bold text-gray-900 dark:text-gray-100">
					{displayCount}
				</span>
				<span className="ml-1 text-gray-600 dark:text-gray-300">views</span>
			</p>
		</div>
	);
};

export default View;

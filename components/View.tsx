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
		<div className="relative inline-flex items-center gap-2 px-2 py-2 rounded-xs bg-gray-100 shadow-sm ">
			<div className="absolute -top-1 -right-1">
				<Ping />
			</div>

			<p className="text-xs bg-gray-100 rounded">
				<span className="font-bold text-gray-900">{displayCount}</span> views
			</p>
		</div>
	);
};

export default View;

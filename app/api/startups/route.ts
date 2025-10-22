import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

// GET /api/startups?q=search&cursor=ISO_DATE&limit=12
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const q = (searchParams.get('q') || '').trim();
		const cursor = (searchParams.get('cursor') || '').trim();
		const limitParam = Number(searchParams.get('limit') || '12');
		const limit = Math.min(
			Math.max(Number.isNaN(limitParam) ? 12 : limitParam, 1),
			50,
		);

		const hasSearch = q.length > 0;
		const hasCursor = cursor.length > 0;

		// Build filter parts (these are safe because $search and $cursor are used as GROQ values)
		const filterParts: string[] = [
			'_type == "startup" && defined(slug.current)',
		];
		if (hasSearch) {
			filterParts.push(
				'(title match $search || category match $search || author->name match $search)',
			);
		}
		if (hasCursor) {
			filterParts.push('_createdAt < $cursor');
		}
		const filter = filterParts.join(' && ');

		// Insert the filter string into the query (GROQ does not accept query fragments as params)
		const query = `*[${filter}] | order(_createdAt desc)[0...$limit]{
      _id,
      title,
      slug,
      _createdAt,
      author->{ _id, name, image, bio },
      views,
      description,
      category,
      image
    }`;

		// Only pass values as params (prevents injection and uses GROQ paramization)
		const params: Record<string, any> = { limit };
		if (hasSearch) params.search = `*${q}*`; // match operator supports wildcard patterns
		if (hasCursor) params.cursor = cursor; // must be ISO date string, e.g. 2025-10-05T12:34:56Z

		const posts = await client
			.withConfig({ useCdn: false })
			.fetch(query, params);

		const nextCursor =
			posts?.length === limit ? posts[posts.length - 1]._createdAt : null;
		return NextResponse.json({ posts, nextCursor });
	} catch (err: any) {
		console.error('GET /api/startups error:', err);
		return NextResponse.json(
			{ error: 'Failed to load startups' },
			{ status: 500 },
		);
	}
}

import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

// GET /api/startups?q=search&cursor=ISO_DATE&limit=12
export async function GET(req: NextRequest) {
\ttry {
\t\tconst { searchParams } = new URL(req.url);
\t\tconst q = (searchParams.get('q') || '').trim();
\t\tconst cursor = (searchParams.get('cursor') || '').trim();
\t\tconst limitParam = Number(searchParams.get('limit') || '12');
\t\tconst limit = Math.min(Math.max(limitParam || 12, 1), 50);

\t\t// Build GROQ filter with optional search and cursor conditions
\t\tconst hasSearch = q.length > 0;
\t\tconst hasCursor = cursor.length > 0;

\t\t// We use createdAt seek pagination: fetch items older than cursor
\t\tconst filterParts: string[] = [
\t\t\t`_type == "startup" && defined(slug.current)`,
\t\t];
\t\tif (hasSearch) {
\t\t\tconst searchExpr = `title match $search || category match $search || author->name match $search`;
\t\t\tfilterParts.push(`(${searchExpr})`);
\t\t}
\t\tif (hasCursor) {
\t\t\tfilterParts.push(`_createdAt < datetime($cursor)`);
\t\t}

\t\tconst filter = filterParts.join(' && ');

\t\tconst query = `*[$filter] | order(_createdAt desc)[0...$limit]{
\t\t\t_id,
\t\t\ttitle,
\t\t\tslug,
\t\t\t_createdAt,
\t\t\tauthor->{ _id, name, image, bio },
\t\t\tviews,
\t\t\tdescription,
\t\t\tcategory,
\t\t\timage
\t\t}`;

\t\tconst params: Record<string, any> = {
\t\t\tfilter,
\t\t\tlimit,
\t\t};
\t\tif (hasSearch) params.search = `*${q}*`;
\t\tif (hasCursor) params.cursor = cursor;

\t\tconst posts = await client.withConfig({ useCdn: false }).fetch(query, params);

\t\tconst nextCursor = posts?.length === limit ? posts[posts.length - 1]?._createdAt : null;
\t\treturn NextResponse.json({ posts, nextCursor });
\t} catch (err: any) {
\t\treturn NextResponse.json({ error: 'Failed to load startups' }, { status: 500 });
\t}
}



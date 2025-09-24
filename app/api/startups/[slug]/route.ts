// app/api/startups/[slug]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * NOTE:
 * - Replace the placeholder DB functions with your actual database / ORM calls.
 * - This handler supports:
 *    GET  -> returns a startup by slug
 *    PUT  -> updates a startup by slug (expects JSON or multipart form data)
 */

// ----- Placeholder DB helpers: replace these with your real DB logic -----
async function DB_findBySlug(slug: string) {
	// Example: query your DB or CMS for the startup with this slug
	// return await db.startups.findUnique({ where: { slug } });
	return {
		slug,
		title: 'Example title',
		pitch: 'Example pitch in markdown',
		category: 'Tech',
		link: 'https://example.com/image.jpg',
		description: 'Short description',
	};
}

async function DB_updateBySlug(slug: string, payload: Record<string, any>) {
	// Replace with your DB update call and return the updated record
	// e.g. return await db.startups.update({ where: { slug }, data: payload });
	return { ...payload, slug };
}
// -------------------------------------------------------------------------

export async function GET(
	request: NextRequest,
	{ params }: { params: { slug: string } },
) {
	const { slug } = params;
	try {
		const item = await DB_findBySlug(slug);
		if (!item)
			return NextResponse.json({ message: 'Not found' }, { status: 404 });
		return NextResponse.json(item);
	} catch (err: any) {
		console.error('GET /api/startups/[slug] error', err);
		return NextResponse.json({ message: 'Server error' }, { status: 500 });
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { slug: string } },
) {
	const { slug } = params;

	// If the client sends JSON
	const contentType = request.headers.get('content-type') ?? '';
	try {
		let payload: any = null;

		if (contentType.includes('application/json')) {
			payload = await request.json();
		} else {
			// Fallback: try form data (for image uploads). Convert to a plain object
			const form = await request.formData();
			payload = {};
			for (const [k, v] of form.entries()) {
				// if file, keep it or handle accordingly; here we just keep file name placeholder
				// Replace with your file handling/upload logic
				payload[k] = typeof v === 'string' ? v : ((v as File).name ?? null);
			}
		}

		// Validate as necessary here (or rely on client validation)
		const updated = await DB_updateBySlug(slug, payload);
		return NextResponse.json({ message: 'Updated', data: updated });
	} catch (err: any) {
		console.error('PUT /api/startups/[slug] error', err);
		return NextResponse.json({ message: 'Server error' }, { status: 500 });
	}
}

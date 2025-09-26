// app/api/startups/delete/route.ts
import 'server-only';
import { NextResponse } from 'next/server';
import { client as readClient } from '@/sanity/lib/client'; // read-only client
import { writeClient } from '@/sanity/lib/write-client'; // server-side write client
import { STARTUP_ID_BY_SLUG } from '@/sanity/lib/queries';

export async function DELETE(req: Request) {
	try {
		const body = await req.json();
		const slug = body?.slug;
		if (!slug || typeof slug !== 'string') {
			return NextResponse.json(
				{ error: 'Missing or invalid slug' },
				{ status: 400 },
			);
		}

		// find the _id by slug
		const id: string | null = await readClient.fetch(STARTUP_ID_BY_SLUG, {
			slug,
		});
		if (!id) {
			return NextResponse.json(
				{ error: `No startup found for slug "${slug}"` },
				{ status: 404 },
			);
		}

		// TODO: Add authentication/authorization checks here (ensure user can delete)

		// delete document by id
		await writeClient.delete(id);

		return NextResponse.json({ ok: true, deletedId: id }, { status: 200 });
	} catch (err: any) {
		console.error('Delete startup error:', err);
		return NextResponse.json(
			{ error: err?.message ?? 'Internal server error' },
			{ status: 500 },
		);
	}
}

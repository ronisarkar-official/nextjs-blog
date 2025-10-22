import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeClient } from '@/sanity/lib/write-client';
import { client } from '@/sanity/lib/client';

// PUT - Update a redirect
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();

		if (!session?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;
		const body = await request.json();
		const { source, destination, permanent, active } = body;

		// Validate required fields
		if (!source || !destination) {
			return NextResponse.json(
				{ error: 'Source and destination URLs are required' },
				{ status: 400 },
			);
		}

		// Validate source URL format
		if (!source.startsWith('/')) {
			return NextResponse.json(
				{ error: 'Source URL must start with /' },
				{ status: 400 },
			);
		}

		if (source.includes('://')) {
			return NextResponse.json(
				{ error: 'Source URL should be a path only (no http:// or https://)' },
				{ status: 400 },
			);
		}

		// Verify the redirect belongs to this user
		const redirect = await client
			.withConfig({ useCdn: false })
			.fetch(
				`*[_type == "redirect" && _id == $redirectId && authorId == $authorId][0]`,
				{
					redirectId: id,
					authorId: session.id,
				},
			);

		if (!redirect) {
			return NextResponse.json(
				{ error: 'Redirect not found or unauthorized' },
				{ status: 404 },
			);
		}

		// Check if source already exists for another redirect
		const existingRedirect = await client
			.withConfig({ useCdn: false })
			.fetch(
				`*[_type == "redirect" && source == $source && authorId == $authorId && _id != $redirectId][0]`,
				{
					source: source.trim(),
					authorId: session.id,
					redirectId: id,
				},
			);

		if (existingRedirect) {
			return NextResponse.json(
				{ error: 'A redirect for this source URL already exists' },
				{ status: 400 },
			);
		}

		// Update the redirect
		const updatedRedirect = await writeClient
			.patch(id)
			.set({
				source: source.trim(),
				destination: destination.trim(),
				permanent: permanent !== false,
				active: active !== false,
			})
			.commit();

		return NextResponse.json({
			success: true,
			redirect: updatedRedirect,
		});
	} catch (error) {
		console.error('Error updating redirect:', error);
		return NextResponse.json(
			{ error: 'Failed to update redirect' },
			{ status: 500 },
		);
	}
}

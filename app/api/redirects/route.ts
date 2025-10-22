import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeClient } from '@/sanity/lib/write-client';
import { client } from '@/sanity/lib/client';

// GET all redirects for the current user
export async function GET(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const redirects = await client
			.withConfig({ useCdn: false })
			.fetch(
				`*[_type == "redirect" && authorId == $authorId] | order(createdAt desc)`,
				{
					authorId: session.id,
				},
			);

		return NextResponse.json({ redirects });
	} catch (error) {
		console.error('Error fetching redirects:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch redirects' },
			{ status: 500 },
		);
	}
}

// POST - Create a new redirect
export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

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

		// Check if source already exists for this user
		const existingRedirect = await client
			.withConfig({ useCdn: false })
			.fetch(
				`*[_type == "redirect" && source == $source && authorId == $authorId][0]`,
				{
					source: source.trim(),
					authorId: session.id,
				},
			);

		if (existingRedirect) {
			return NextResponse.json(
				{ error: 'A redirect for this source URL already exists' },
				{ status: 400 },
			);
		}

		// Create redirect in Sanity
		const newRedirect = await writeClient.create({
			_type: 'redirect',
			source: source.trim(),
			destination: destination.trim(),
			permanent: permanent !== false, // default to true
			active: active !== false, // default to true
			authorId: session.id,
			createdAt: new Date().toISOString(),
		});

		return NextResponse.json({
			success: true,
			redirect: newRedirect,
		});
	} catch (error) {
		console.error('Error creating redirect:', error);
		return NextResponse.json(
			{ error: 'Failed to create redirect' },
			{ status: 500 },
		);
	}
}

// DELETE - Delete a redirect
export async function DELETE(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const redirectId = searchParams.get('id');

		if (!redirectId) {
			return NextResponse.json(
				{ error: 'Redirect ID is required' },
				{ status: 400 },
			);
		}

		// Verify the redirect belongs to this user
		const redirect = await client
			.withConfig({ useCdn: false })
			.fetch(
				`*[_type == "redirect" && _id == $redirectId && authorId == $authorId][0]`,
				{
					redirectId,
					authorId: session.id,
				},
			);

		if (!redirect) {
			return NextResponse.json(
				{ error: 'Redirect not found or unauthorized' },
				{ status: 404 },
			);
		}

		// Delete the redirect
		await writeClient.delete(redirectId);

		return NextResponse.json({
			success: true,
			message: 'Redirect deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting redirect:', error);
		return NextResponse.json(
			{ error: 'Failed to delete redirect' },
			{ status: 500 },
		);
	}
}

// app/api/startups/[slug]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeClient } from '@/sanity/lib/write-client';
import { client } from '@/sanity/lib/client';
import {
	STARTUP_ID_BY_SLUG,
	COMMENTS_BY_STARTUP_QUERY,
	STARTUP_BY_SLUG_QUERY,
} from '@/sanity/lib/queries';
import { addDays } from '@/lib/utils';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const { slug } = await params;

		// Get startup ID from slug
		const startupId = await client.fetch(STARTUP_ID_BY_SLUG, { slug });

		if (!startupId) {
			return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
		}

		// Get comments for this startup
		const comments = await client.fetch(COMMENTS_BY_STARTUP_QUERY, {
			startupId: startupId,
		});

		return NextResponse.json({ comments });
	} catch (error) {
		console.error('Get comments error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch comments' },
			{ status: 500 },
		);
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const session = await auth();

		const { slug } = await params;
		const body = await request.json();
		const { content, parentCommentId, guestName } = body;

		// Validate content
		if (!content || content.trim().length === 0) {
			return NextResponse.json(
				{ error: 'Comment content is required' },
				{ status: 400 },
			);
		}

		if (content.length > 1000) {
			return NextResponse.json(
				{ error: 'Comment must be less than 1000 characters' },
				{ status: 400 },
			);
		}

		// Get startup ID from slug
		const startupId = await client.fetch(STARTUP_ID_BY_SLUG, { slug });

		if (!startupId) {
			return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
		}

		// Create comment
		const commentData: any = {
			_type: 'comment',
			startup: {
				_type: 'reference',
				_ref: startupId,
			},
			content: content.trim(),
			isApproved: true,
			createdAt: new Date().toISOString(),
		};

		// If logged-in, attach user reference; otherwise, attach guestName if provided
		if (session?.id) {
			commentData.user = {
				_type: 'reference',
				_ref: session.id,
			};
		} else if (
			guestName &&
			typeof guestName === 'string' &&
			guestName.trim().length > 0
		) {
			commentData.guestName = guestName.trim().slice(0, 50);
		}

		// Add parent comment reference if replying to a comment
		if (parentCommentId) {
			commentData.parentComment = {
				_type: 'reference',
				_ref: parentCommentId,
			};
		}

		const created = await writeClient.create(commentData);
		// Read back populated comment shape used by client list
		const comment = await client.fetch(
			`*[_type == "comment" && _id == $id][0]{
			  _id, content, createdAt, guestName, user->{ _id, name, image }
			}`,
			{ id: created._id },
		);

		// Notifications removed per request

		return NextResponse.json({ success: true, comment });
	} catch (error) {
		console.error('Create comment error:', error);
		return NextResponse.json(
			{ error: 'Failed to create comment' },
			{ status: 500 },
		);
	}
}

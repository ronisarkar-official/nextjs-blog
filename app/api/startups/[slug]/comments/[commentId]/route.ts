// app/api/startups/[slug]/comments/[commentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeClient } from '@/sanity/lib/write-client';
import { client } from '@/sanity/lib/client';

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string; commentId: string }> },
) {
	try {
		const session = await auth();

		if (!session?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { slug, commentId } = await params;

		// Get the comment to verify ownership
		const comment = await client.fetch(
			`*[_type == "comment" && _id == $commentId][0]{
				_id,
				user->{ _id },
				startup->{ _id }
			}`,
			{ commentId },
		);

		if (!comment) {
			return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
		}

		// Check if the user owns this comment
		if (comment.user._id !== session.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Delete the comment
		await writeClient.delete(commentId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Delete comment error:', error);
		return NextResponse.json(
			{ error: 'Failed to delete comment' },
			{ status: 500 },
		);
	}
}

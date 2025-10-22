import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * Force revalidation of redirects
 * This endpoint can be called after creating/updating/deleting redirects
 * to ensure the middleware picks up the changes immediately
 */
export async function POST() {
	try {
		// Revalidate the entire site to pick up new redirects
		revalidatePath('/', 'layout');

		return NextResponse.json({
			success: true,
			message: 'Redirect cache cleared successfully',
		});
	} catch (error) {
		console.error('Error revalidating redirects:', error);
		return NextResponse.json(
			{ error: 'Failed to clear redirect cache' },
			{ status: 500 },
		);
	}
}

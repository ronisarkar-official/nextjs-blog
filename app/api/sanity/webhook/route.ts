// app/api/sanity/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Verify this is a Sanity webhook
		if (!body._type || !body._id) {
			return NextResponse.json(
				{ error: 'Invalid webhook payload' },
				{ status: 400 },
			);
		}

		// Only process startup document changes
		if (body._type !== 'startup') {
			return NextResponse.json({ message: 'Ignored - not a startup document' });
		}

		// Check if this is a create, update, or delete operation
		const operation = body._rev ? 'update' : 'create';

		console.log(
			`Sanity webhook received: ${operation} for startup ${body._id}`,
		);

		// Revalidate sitemap and related pages
		revalidatePath('/sitemap.xml');
		revalidatePath('/');
		revalidatePath('/feed');
		revalidatePath('/startups');
		revalidatePath('/rss.xml');

		// If it's a specific startup, revalidate its page too
		if (body.slug?.current) {
			revalidatePath(`/startups/${body.slug.current}`);
		}

		// Also trigger our custom sitemap revalidation endpoint
		try {
			const baseUrl =
				process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
			const revalidateUrl = `${baseUrl}/api/sitemap/revalidate`;

			// Make internal request to revalidate sitemap
			await fetch(revalidateUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});
		} catch (revalidateError) {
			console.warn('Failed to trigger sitemap revalidation:', revalidateError);
		}

		return NextResponse.json({
			success: true,
			message: `Sitemap revalidated for ${operation} operation`,
			documentId: body._id,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Sanity webhook processing failed:', error);
		return NextResponse.json(
			{ error: 'Webhook processing failed' },
			{ status: 500 },
		);
	}
}

// Allow GET for testing
export async function GET() {
	return NextResponse.json({
		message: 'Sanity webhook endpoint is active',
		endpoint: '/api/sanity/webhook',
		method: 'POST',
		note: 'Configure this URL in your Sanity project webhooks',
	});
}

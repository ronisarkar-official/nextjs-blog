// app/api/rss/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
	try {
		// Verify the request is authorized (optional but recommended)
		const authHeader = request.headers.get('authorization');
		const expectedToken = process.env.RSS_REVALIDATE_TOKEN;

		if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Revalidate the RSS feed
		revalidatePath('/rss.xml');

		// Also revalidate related pages
		revalidatePath('/');
		revalidatePath('/feed');
		revalidatePath('/startups');
		revalidatePath('/sitemap.xml');

		console.log('RSS feed revalidated successfully');

		return NextResponse.json({
			success: true,
			message: 'RSS feed revalidated',
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('RSS revalidation failed:', error);
		return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
	}
}

// Allow GET for testing
export async function GET() {
	return NextResponse.json({
		message: 'RSS revalidation endpoint is active',
		endpoint: '/api/rss/revalidate',
		method: 'POST',
	});
}

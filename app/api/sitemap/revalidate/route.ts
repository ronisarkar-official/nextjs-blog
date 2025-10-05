// app/api/sitemap/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
	try {
		// Verify the request is authorized (optional but recommended)
		const authHeader = request.headers.get('authorization');
		const expectedToken = process.env.SITEMAP_REVALIDATE_TOKEN;

		if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Revalidate the sitemap
		revalidatePath('/sitemap.xml');

		// Also revalidate the main pages that might be affected
		revalidatePath('/');
		revalidatePath('/feed');
		revalidatePath('/startups');
		revalidatePath('/rss.xml');

		console.log('Sitemap revalidated successfully');

		return NextResponse.json({
			success: true,
			message: 'Sitemap revalidated',
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Sitemap revalidation failed:', error);
		return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
	}
}

// Allow GET for testing
export async function GET() {
	return NextResponse.json({
		message: 'Sitemap revalidation endpoint is active',
		endpoint: '/api/sitemap/revalidate',
		method: 'POST',
	});
}

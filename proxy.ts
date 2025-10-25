import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { client } from '@/sanity/lib/client';

// Cache for redirects to avoid fetching on every request
let redirectsCache: Array<{
	source: string;
	destination: string;
	permanent: boolean;
	active: boolean;
}> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute in milliseconds

async function getRedirects() {
	const now = Date.now();

	// Return cached redirects if still valid
	if (redirectsCache && now - lastFetchTime < CACHE_DURATION) {
		return redirectsCache;
	}

	try {
		// Fetch all active redirects from Sanity
		const redirects = await client
			.withConfig({ useCdn: false })
			.fetch(
				`*[_type == "redirect" && active == true] {
					source,
					destination,
					permanent,
					active
				}`,
			);

		redirectsCache = redirects || [];
		lastFetchTime = now;

		return redirectsCache;
	} catch (error) {
		console.error('Error fetching redirects:', error);
		// Return cached data even if stale, or empty array
		return redirectsCache || [];
	}
}

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Skip middleware for static files, API routes, and Next.js internals
	if (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/api') ||
		pathname.startsWith('/static') ||
		pathname.startsWith('/studio') ||
		pathname.includes('.') // Skip files with extensions (images, fonts, etc.)
	) {
		return NextResponse.next();
	}

	try {
		// Get active redirects
		const redirects = await getRedirects();

		// Find matching redirect
		const matchingRedirect = redirects?.find(
			(redirect) => redirect.source === pathname,
		);

		if (matchingRedirect) {
			const { destination, permanent } = matchingRedirect;

			// Check if destination is an external URL
			if (destination.startsWith('http://') || destination.startsWith('https://')) {
				return NextResponse.redirect(destination, permanent ? 301 : 302);
			}

			// Internal redirect
			const url = request.nextUrl.clone();
			url.pathname = destination;

			return NextResponse.redirect(url, permanent ? 301 : 302);
		}
	} catch (error) {
		console.error('Middleware error:', error);
		// Continue to next middleware/route on error
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder files
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|studio).*)',
	],
};

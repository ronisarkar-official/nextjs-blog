// app/sitemap.ts
import { MetadataRoute } from 'next';
import { client } from '@/sanity/lib/client';
import { ALL_STARTUP_ROUTES_QUERY } from '@/sanity/lib/queries';

// Optimized revalidation: shorter for dynamic content, longer for static
export const revalidate = 30; // Reduced from 60 to 30 seconds for faster updates
export const dynamic = 'force-dynamic'; // Ensure sitemap is always fresh

interface SanityRoute {
	slug: string;
	lastModified: string;
}

// Cache for sitemap data to reduce Sanity API calls
const sitemapCache = new Map<
	string,
	{ data: MetadataRoute.Sitemap; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

async function fetchStartupRoutes(): Promise<SanityRoute[]> {
	try {
		// Add timeout and retry logic for better reliability
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

		const startups = await client.fetch(
			ALL_STARTUP_ROUTES_QUERY,
			{},
			{
				signal: controller.signal,
				next: { revalidate: 30 }, // Cache for 30 seconds
			},
		);

		clearTimeout(timeoutId);
		return startups || [];
	} catch (error) {
		console.error('Failed to fetch startup routes for sitemap:', error);
		// Return empty array as fallback
		return [];
	}
}

function getStaticRoutes(baseUrl: string): MetadataRoute.Sitemap {
	const now = new Date().toISOString();

	return [
		{
			url: `${baseUrl}`,
			lastModified: now,
			changeFrequency: 'daily',
			priority: 1.0,
		},

		{
			url: `${baseUrl}/about-us`,
			lastModified: now,
			changeFrequency: 'yearly',
			priority: 0.5,
		},
		{
			url: `${baseUrl}/contact-us`,
			lastModified: now,
			changeFrequency: 'yearly',
			priority: 0.5,
		},
		{
			url: `${baseUrl}/privacy-policy`,
			lastModified: now,
			changeFrequency: 'yearly',
			priority: 0.3,
		},
		{
			url: `${baseUrl}/terms-and-condition`,
			lastModified: now,
			changeFrequency: 'yearly',
			priority: 0.3,
		},
		{
			url: `${baseUrl}/disclaimer`,
			lastModified: now,
			changeFrequency: 'yearly',
			priority: 0.3,
		},
		{
			url: `${baseUrl}/dmca`,
			lastModified: now,
			changeFrequency: 'yearly',
			priority: 0.3,
		},
	];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL || 'https://www.spechype.com';
	const cacheKey = `sitemap-${baseUrl}`;

	// Check cache first
	const cached = sitemapCache.get(cacheKey);
	const now = Date.now();

	if (cached && now - cached.timestamp < CACHE_DURATION) {
		return cached.data;
	}

	try {
		// Fetch startup routes with error handling
		const startups = await fetchStartupRoutes();

		// Generate startup routes with optimized mapping
		const startupRoutes: MetadataRoute.Sitemap = startups.map((item) => ({
			url: `${baseUrl}/startups/${item.slug}`,
			lastModified: new Date(item.lastModified).toISOString(),
			changeFrequency: 'weekly',
			priority: 0.8,
		}));

		// Get static routes
		const staticRoutes = getStaticRoutes(baseUrl);

		// Combine all routes
		const allRoutes = [...staticRoutes, ...startupRoutes];

		// Cache the result
		sitemapCache.set(cacheKey, {
			data: allRoutes,
			timestamp: now,
		});

		// Log sitemap generation for monitoring
		console.log(
			`Sitemap generated with ${allRoutes.length} routes (${startupRoutes.length} startup routes)`,
		);

		return allRoutes;
	} catch (error) {
		console.error('Sitemap generation failed:', error);

		// Return at least static routes as fallback
		const staticRoutes = getStaticRoutes(baseUrl);
		console.log('Returning fallback sitemap with static routes only');

		return staticRoutes;
	}
}

// app/sitemap.ts
import { MetadataRoute } from 'next';
import { client } from '@/sanity/lib/client'; // Ensure this path is correct
// Only import the necessary query for Startups
import { ALL_STARTUP_ROUTES_QUERY } from '@/sanity/lib/queries'; // Ensure this path is correct

// Define the common structure for the fetched slug/date data
interface SanityRoute {
	slug: string;
	lastModified: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL || 'https://www.xxxxxxxxx.com'; // CRITICAL: Set your production domain

	// 1. Fetch Dynamic Routes from Sanity (ONLY STARTUPS)
	// A. Startups (e.g., /startup/my-first-idea)
	const startups: SanityRoute[] = await client.fetch(ALL_STARTUP_ROUTES_QUERY);
	const startupRoutes: MetadataRoute.Sitemap = startups.map((item) => ({
		url: `${baseUrl}/startup/${item.slug}`,
		lastModified: new Date(item.lastModified).toISOString(),
		changeFrequency: 'weekly',
		priority: 0.8,
	}));

	// Removed: Playlists fetch and mapping (B)
	// Removed: Authors fetch and mapping (C)

	// 2. Define Static Routes
	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: `${baseUrl}`,
			lastModified: new Date().toISOString(),
			changeFrequency: 'daily',
			priority: 1.0,
		},
		{
			url: `${baseUrl}/startups`, // List page for all startups
			lastModified: new Date().toISOString(),
			changeFrequency: 'weekly',
			priority: 0.9,
		},
		{
			url: `${baseUrl}/about`,
			lastModified: new Date().toISOString(),
			changeFrequency: 'yearly',
			priority: 0.5,
		},
		// Add all other static pages like /contact, /faq, etc.
	];

	// 3. Combine and Return (ONLY Startups and Static Routes)
	return [...staticRoutes, ...startupRoutes];
}

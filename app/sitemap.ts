// app/sitemap.ts
import { MetadataRoute } from 'next';
import { client } from '@/sanity/lib/client';
import { ALL_STARTUP_ROUTES_QUERY } from '@/sanity/lib/queries';

export const revalidate = 60; // keep or adjust as needed

interface SanityRoute {
	slug: string;
	lastModified: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL || 'https://www.spechype.com';

	// fetch should return { "slug": slug.current, "lastModified": _updatedAt } (see GROQ below)
	const startups: SanityRoute[] = await client.fetch(ALL_STARTUP_ROUTES_QUERY);

	const startupRoutes: MetadataRoute.Sitemap = startups.map((item) => ({
		// ---- FIXED: use plural "startups" to match your real URLs ----
		url: `${baseUrl}/startups/${item.slug}`,
		lastModified: new Date(item.lastModified).toISOString(),
		changeFrequency: 'weekly',
		priority: 0.8,
	}));

	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: `${baseUrl}`,
			lastModified: new Date().toISOString(),
			changeFrequency: 'daily',
			priority: 1.0,
		},
		{
			url: `${baseUrl}/feed`,
			lastModified: new Date().toISOString(),
			changeFrequency: 'weekly',
			priority: 0.9,
		},
		{
			url: `${baseUrl}/about-us`,
			lastModified: new Date().toISOString(),
			changeFrequency: 'yearly',
			priority: 0.5,
		},
	];

	return [...staticRoutes, ...startupRoutes];
}

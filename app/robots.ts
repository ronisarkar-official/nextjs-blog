// app/robots.ts
import type { MetadataRoute } from 'next';

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
const siteUrl = (rawSiteUrl || 'https://www.spechype.com').replace(/\/$/, '');

const isProduction =
	process.env.VERCEL_ENV === 'production' ||
	process.env.NODE_ENV === 'production';

export default function robots(): MetadataRoute.Robots {
	// On non-prod (preview / local) block indexing to avoid duplicate-content issues
	if (!isProduction) {
		return {
			rules: [
				{
					userAgent: '*',
					disallow: ['/'],
				},
			],
			// no sitemap advertised for non-prod
		};
	}

	return {
		rules: [
			{
				userAgent: '*',
				allow: ['/'],
				disallow: ['/private/'],
			},
		],
		// declare absolute sitemap(s) that match your production host exactly
		sitemap: [`${siteUrl}/sitemap.xml`, `${siteUrl}/rss.xml`],
	};
}

// app/rss.xml/route.js
import { client } from '@/sanity/lib/client';
import { RSS_STARTUPS_QUERY } from '@/sanity/lib/queries';
import { NextResponse } from 'next/server';

// Optimized revalidation for RSS feed
export const revalidate = 30; // 30 seconds for faster updates
export const dynamic = 'force-dynamic'; // Ensure RSS is always fresh

const baseUrl = (
	process.env.NEXT_PUBLIC_SITE_URL || 'https://www.spechype.com'
).replace(/\/$/, '');
const currentYear = new Date().getFullYear();

// Cache for RSS data to reduce Sanity API calls
const rssCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

function escapeXml(text) {
	return (text || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function wrapCdata(str) {
	if (!str) return '<![CDATA[]]>';
	return '<![CDATA[' + str.replace(/]]>/g, ']]]]><![CDATA[>') + ']]>';
}

function getSlug(slug) {
	if (!slug) return null;
	if (typeof slug === 'string') return slug;
	if (typeof slug === 'object' && slug.current) return slug.current;
	return null;
}

function generateRssXml(items, lastBuildDateIso) {
	const rssItemsXml = items
		.map((item) => {
			const title = escapeXml(item.title || 'Untitled');
			const guid = escapeXml(item.url);
			const author = escapeXml(item.author || 'SpecHype');
			const pubDate = new Date(item.pubDateIso).toUTCString();
			const descriptionCdata = wrapCdata(
				item.description || 'No summary available.',
			);

			return `
    <item>
      <title>${title}</title>
      <link>${guid}</link>
      <guid isPermaLink="true">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${author}</author>
      <description>${descriptionCdata}</description>
    </item>`;
		})
		.join('');

	const lastBuildDate = new Date(lastBuildDateIso).toUTCString();

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SpecHype: Real-time feed of technical publications.</title>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <description>The SpecHype RSS Feed provides structured, real-time data allowing any external platform or reader application to automatically ingest and display our latest technical publications and startup features.</description>
    <language>en-us</language>
    <copyright>Copyright ${currentYear}, SpecHype</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>SpecHype RSS Generator</generator>
    <ttl>60</ttl>
${rssItemsXml}
  </channel>
</rss>`;
}

async function fetchRssData() {
	try {
		// Add timeout and retry logic for better reliability
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

		const raw = await client.fetch(
			RSS_STARTUPS_QUERY,
			{},
			{
				signal: controller.signal,
				next: { revalidate: 30 }, // Cache for 30 seconds
			},
		);

		clearTimeout(timeoutId);
		return raw || [];
	} catch (error) {
		console.error('Failed to fetch RSS data:', error);
		// Return empty array as fallback
		return [];
	}
}

export async function GET(_request) {
	const cacheKey = `rss-${baseUrl}`;

	// Check cache first
	const cached = rssCache.get(cacheKey);
	const now = Date.now();

	if (cached && now - cached.timestamp < CACHE_DURATION) {
		return new NextResponse(cached.data, {
			status: 200,
			headers: {
				'Content-Type': 'application/rss+xml; charset=utf-8',
				'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=3600',
			},
		});
	}

	try {
		const raw = await fetchRssData();

		const normalized = raw
			.map((r) => {
				const slug = getSlug(r.slug);
				if (!slug) return null;

				const pubIso =
					r.pubDate || r._createdAt || r._updatedAt || new Date().toISOString();

				// ---- FIXED: use plural "startups" to match your public URL path ----
				const url = `${baseUrl}/startups/${encodeURIComponent(slug)}`;

				const authorName =
					typeof r.author === 'string' ?
						r.author
					:	(r.author && r.author.name) || 'SpecHype';

				return {
					id: r._id,
					title: r.title || 'Untitled',
					url,
					pubDateIso: pubIso,
					description: r.description || '',
					author: authorName,
				};
			})
			.filter(Boolean);

		normalized.sort(
			(a, b) => +new Date(b.pubDateIso) - +new Date(a.pubDateIso),
		);
		const items = normalized.slice(0, 50);
		const lastBuildDateIso =
			items.length > 0 ? items[0].pubDateIso : new Date().toISOString();

		const rssXml = generateRssXml(items, lastBuildDateIso);

		// Cache the result
		rssCache.set(cacheKey, {
			data: rssXml,
			timestamp: now,
		});

		// Log RSS generation for monitoring
		console.log(`RSS feed generated with ${items.length} items`);

		return new NextResponse(rssXml, {
			status: 200,
			headers: {
				'Content-Type': 'application/rss+xml; charset=utf-8',
				// ---- RECOMMENDATION: control edge freshness with s-maxage ----
				// balanced: edge caches for 60s but will serve stale while revalidating for an hour
				'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=3600',
			},
		});
	} catch (err) {
		console.error('RSS Generation Error:', err);

		// Return a minimal RSS feed as fallback
		const fallbackRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SpecHype: Real-time feed of technical publications.</title>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <description>The SpecHype RSS Feed provides structured, real-time data allowing any external platform or reader application to automatically ingest and display our latest technical publications and startup features.</description>
    <language>en-us</language>
    <copyright>Copyright ${currentYear}, SpecHype</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>SpecHype RSS Generator</generator>
    <ttl>60</ttl>
    <item>
      <title>Feed temporarily unavailable</title>
      <link>${baseUrl}</link>
      <guid isPermaLink="true">${baseUrl}</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <author>SpecHype</author>
      <description><![CDATA[RSS feed is temporarily unavailable. Please try again later.]]></description>
    </item>
  </channel>
</rss>`;

		return new NextResponse(fallbackRss, {
			status: 200,
			headers: {
				'Content-Type': 'application/rss+xml; charset=utf-8',
				'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=3600',
			},
		});
	}
}

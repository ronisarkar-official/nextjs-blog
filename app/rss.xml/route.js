// app/rss.xml/route.js
import { client } from '@/sanity/lib/client';
import { RSS_STARTUPS_QUERY } from '@/sanity/lib/queries';
import { NextResponse } from 'next/server';

const baseUrl = (
	process.env.NEXT_PUBLIC_SITE_URL || 'https://www.xxxxxxxxx.com'
).replace(/\/$/, '');
const currentYear = new Date().getFullYear();

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

export async function GET(_request) {
	try {
		const raw = (await client.fetch(RSS_STARTUPS_QUERY)) || [];

		const normalized = raw
			.map((r) => {
				const slug = getSlug(r.slug);
				if (!slug) return null;
				const pubIso =
					r.pubDate || r._createdAt || r._updatedAt || new Date().toISOString();
				const url = `${baseUrl}/startup/${encodeURIComponent(slug)}`;
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

		return new NextResponse(rssXml, {
			status: 200,
			headers: {
				'Content-Type': 'application/rss+xml; charset=utf-8',
				'Cache-Control': 'public, max-age=600, stale-while-revalidate=3600',
			},
		});
	} catch (err) {
		console.error('RSS Generation Error:', err);
		return new NextResponse('Error generating RSS feed.', { status: 500 });
	}
}

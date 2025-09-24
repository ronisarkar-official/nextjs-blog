// app/startups/[slug]/edit/page.tsx
import { notFound } from 'next/navigation';
import EditStartupForm from '@/components/EditStartupForm';
import { client } from '@/sanity/lib/client';
import { STARTUP_BY_SLUG_QUERY } from '@/sanity/lib/queries';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

type Props = {
	params: { slug?: string | string[] };
};

type Startup = {
	_id?: string;
	title?: string;
	slug?: { current?: string } | string;
	pitch?: string;
	description?: string;
	category?: string;
	image?: any;
	// add more fields you rely on if desired
};

export default async function Page({ params }: Props) {
	const session = await auth();
	if (!session) redirect('/'); 
	const rawSlug = params?.slug;

	// slug can be string | string[] | undefined in Next params
	if (!rawSlug) {
		// No slug provided — show 404
		return notFound();
	}
	const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

	if (typeof slug !== 'string' || slug.trim() === '') {
		return notFound();
	}

	let data: Startup | null = null;

	try {
		// Fetch the startup by slug from Sanity
		// If your client is configured to use CDN, this will be cached.
		// If you want always-fresh data, consider using a server client or a server route.
		data = await client.fetch(STARTUP_BY_SLUG_QUERY, { slug });
	} catch (err) {
		// Log with context — still render the page so the client form can handle null initialData
		// In production consider using a structured logger (Sentry/Logflare/etc.)
		// eslint-disable-next-line no-console
		console.error(
			`[app/startups/[slug]/edit] failed to fetch startup for slug="${slug}"`,
			err,
		);
		data = null;
	}
	 

	return (
		<div className="">
			<div className="max-w-xl px-4 ml-8 m-auto ">
				<h1 className="text-2xl font-semibold mb-6">Edit startup</h1>
				<EditStartupForm
					initialData={data}
					slug={slug}
					
				/>
			</div>
		</div>
	);
}

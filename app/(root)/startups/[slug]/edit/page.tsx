// FILE: app/startups/[slug]/edit/page.tsx
// Server component: decides whether to render the Edit form or show client-side toast+redirect for non-authors
import { notFound } from 'next/navigation';
import EditStartupForm from '@/components/EditStartupForm';
import ClientAccessDenied from '@/components/ClientAccessDenied';
import { client } from '@/sanity/lib/client';
import { STARTUP_BY_SLUG_QUERY } from '@/sanity/lib/queries';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

type Props = { params: { slug?: string | string[] } };

type Startup = { _id?: string; author?: any };

function extractAuthorId(data: Startup | null): string | null {
	if (!data) return null;
	const a = (data as any).author;
	return (
		a?._ref ??
		a?._id ??
		(typeof a === 'string' ? a : undefined) ??
		(data as any).authorId ??
		(data as any)._createdBy ??
		null
	);
}

function extractUserId(session: any): string | null {
	if (!session) return null;
	return (
		session.user?.id ??
		session.user?.sub ??
		session.user?.uid ??
		session.user?._id ??
		session.id ??
		null
	);
}

export default async function Page({ params }: Props) {
	const session = await auth();
	if (!session) redirect('/');

	const rawSlug = params?.slug;
	if (!rawSlug) return notFound();
	const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
	if (typeof slug !== 'string' || slug.trim() === '') return notFound();

	let data: Startup | null = null;
	try {
		data = await client.fetch(STARTUP_BY_SLUG_QUERY, { slug });
	} catch (err) {
		console.error(err);
		data = null;
	}

	if (!data) return notFound();

	const authorId = extractAuthorId(data);
	const userId = extractUserId(session);

	// If not able to conclusively prove user is author, render client gate that will show a toast and redirect
	if (!authorId || !userId || String(authorId) !== String(userId)) {
		return (
			<ClientAccessDenied
				slug={slug}
				redirectTo={`/startups/${slug}`}
			/>
		);
	}

	// user is author — render edit form (client component)
	return (
		<div className="max-w-xl px-4 ml-4 m-auto">
			<h1 className="text-2xl font-semibold mb-6">Edit Post</h1>
			<EditStartupForm
				initialData={data}
				slug={slug}
			/>
		</div>
	);
}

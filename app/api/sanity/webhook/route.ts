// app/api/sanity/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId, token } from '@/sanity/env';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Verify this is a Sanity webhook
		if (!body._type || !body._id) {
			return NextResponse.json(
				{ error: 'Invalid webhook payload' },
				{ status: 400 },
			);
		}

		// Only process startup document changes
		if (body._type !== 'startup') {
			return NextResponse.json({ message: 'Ignored - not a startup document' });
		}

		// Check if this is a create, update, or delete operation
		const operation = body._rev ? 'update' : 'create';

		console.log(
			`Sanity webhook received: ${operation} for startup ${body._id}`,
		);

		// Revalidate sitemap and related pages
		revalidatePath('/sitemap.xml');
		revalidatePath('/');
		revalidatePath('/feed');
		revalidatePath('/startups');
		revalidatePath('/rss.xml');

		// If it's a specific startup, revalidate its page too
		if (body.slug?.current) {
			revalidatePath(`/startups/${body.slug.current}`);
		}

		// Also trigger our custom sitemap revalidation endpoint
		try {
			const baseUrl =
				process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
			const revalidateUrl = `${baseUrl}/api/sitemap/revalidate`;

			// Make internal request to revalidate sitemap
			await fetch(revalidateUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});
		} catch (revalidateError) {
			console.warn('Failed to trigger sitemap revalidation:', revalidateError);
		}

		// If published or updated with slug, email subscribers with the post
		try {
			if (token) {
				const client = createClient({
					projectId,
					dataset,
					apiVersion,
					useCdn: false,
					token,
				});
				// fetch the latest startup document data
				const startup = await client.fetch(
					`*[_type == "startup" && _id == $id][0]{ title, slug, description, image }`,
					{ id: body._id },
				);
				if (startup?.slug?.current) {
					const subscribers: Array<{ email: string; status?: string }> =
						await client.fetch(
							`*[_type == "subscriber" && status != 'unsubscribed']{ email, status }`,
						);
					if (subscribers?.length) {
						const baseUrl =
							process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
						const postUrl = `${baseUrl}/startups/${startup.slug.current}`;
						const subject = `New post: ${startup.title || 'A new update'}`;
						const RESEND_API_KEY = process.env.RESEND_API_KEY;
						const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
						const RESEND_LOGO_URL = process.env.RESEND_LOGO_URL;
						const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;
						const computedLogoUrl =
							RESEND_LOGO_URL ||
							(NEXT_PUBLIC_APP_URL ?
								`${NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/logo.png`
							:	undefined);
						if (RESEND_API_KEY && RESEND_FROM_EMAIL) {
							// send sequentially (simple, small lists). For larger lists, you'd batch or use ESP lists.
							for (const s of subscribers) {
								await fetch('https://api.resend.com/emails', {
									method: 'POST',
									headers: {
										Authorization: `Bearer ${RESEND_API_KEY}`,
										'Content-Type': 'application/json',
									},
									body: JSON.stringify({
										from: RESEND_FROM_EMAIL,
										to: s.email,
										subject,
										html: `
											<div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;line-height:1.6;color:#0f172a;background:#ffffff;padding:24px">
											  ${computedLogoUrl ? `<div style="margin-bottom:16px"><img src="${computedLogoUrl}" alt="Logo" style="height:36px;width:auto;display:block" /></div>` : ''}
											  <h2 style="margin:0 0 12px;font-size:20px">${startup.title || 'New post'}</h2>
											  ${startup.description ? `<p style="margin:0 0 12px;color:#334155">${startup.description}</p>` : ''}
											  <p style="margin:16px 0"><a href="${postUrl}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:9999px">Read the post</a></p>
											  <p style="margin:16px 0 0;color:#64748b;font-size:12px">You are receiving this because you subscribed.</p>
											</div>
										`,
									}),
								});
							}
						}
					}
				}
			}
		} catch (mailErr) {
			console.warn('Failed to email subscribers on publish', mailErr);
		}

		return NextResponse.json({
			success: true,
			message: `Sitemap revalidated for ${operation} operation`,
			documentId: body._id,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Sanity webhook processing failed:', error);
		return NextResponse.json(
			{ error: 'Webhook processing failed' },
			{ status: 500 },
		);
	}
}

// Allow GET for testing
export async function GET() {
	return NextResponse.json({
		message: 'Sanity webhook endpoint is active',
		endpoint: '/api/sanity/webhook',
		method: 'POST',
		note: 'Configure this URL in your Sanity project webhooks',
	});
}

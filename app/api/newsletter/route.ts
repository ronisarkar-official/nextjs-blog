// app/api/newsletter/route.ts
import { NextResponse } from 'next/server';
import { writeClient } from '@/sanity/lib/write-client';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const RESEND_LOGO_URL = process.env.RESEND_LOGO_URL; // optional absolute logo URL
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL; // optional base URL

export async function POST(request: Request) {
	try {
		const { email } = await request.json();
		if (
			typeof email !== 'string' ||
			!email ||
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
		) {
			return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
		}

		if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
			return NextResponse.json(
				{ error: 'Server not configured for email sending' },
				{ status: 500 },
			);
		}

		// Upsert subscriber in Sanity (idempotent by email)
		try {
			const existing = await writeClient.fetch(
				`*[_type == "subscriber" && email == $email][0]{ _id, status }`,
				{ email },
			);
			if (!existing) {
				await writeClient.create({
					_type: 'subscriber',
					email,
					status: 'subscribed',
				});
			} else if (existing.status !== 'subscribed') {
				await writeClient
					.patch(existing._id)
					.set({ status: 'subscribed' })
					.commit();
			}
		} catch (dbErr) {
			console.warn('Failed to upsert subscriber', dbErr);
		}

		// Send a simple confirmation email via Resend REST API
		const subject = 'Thanks for subscribing';
		const computedLogoUrl =
			RESEND_LOGO_URL ||
			(NEXT_PUBLIC_APP_URL ?
				`${NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/logo.png`
			:	undefined);
		const html = `
				<div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;line-height:1.6;color:#0f172a;background:#ffffff;padding:24px">
				  ${computedLogoUrl ? `<div style="margin-bottom:16px"><img src="${computedLogoUrl}" alt="Logo" style="height:36px;width:auto;display:block" /></div>` : ''}
				  <h2 style="margin:0 0 12px;font-size:20px">Welcome!</h2>
				  <p style="margin:0 0 12px">You've subscribed with <strong>${email}</strong>.</p>
				  <p style="margin:0 0 12px">We'll send you occasional updates. You can unsubscribe anytime.</p>
				</div>
			`;

		const res = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${RESEND_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: RESEND_FROM_EMAIL,
				to: email,
				subject,
				html,
			}),
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return NextResponse.json(
				{ error: err?.message || 'Failed to send email' },
				{ status: 502 },
			);
		}

		return NextResponse.json({ ok: true });
	} catch (e) {
		return NextResponse.json({ error: 'Bad request' }, { status: 400 });
	}
}

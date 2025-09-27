// app/api/sanity/update/route.ts
import 'server-only';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { writeClient } from '@/sanity/lib/write-client';
import { client as readClient } from '@/sanity/lib/client';
import { STARTUP_BY_SLUG_QUERY } from '@/sanity/lib/queries';

/** Upload remote image and return uploaded object (may contain .url or ._id). */
async function uploadImageFromUrlToSanity(
	url: string,
	filename = 'remote-image',
) {
	if (!url) return null;
	if (!/^https?:\/\//i.test(url)) return null;

	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(
			`Failed to fetch image URL: ${res.status} ${res.statusText}`,
		);
	}

	const arrayBuffer = await res.arrayBuffer();

	let fileBody: any;
	try {
		// prefer Blob when available (Node 18+/edge)
		// @ts-ignore
		if (typeof Blob !== 'undefined') {
			// @ts-ignore
			fileBody = new Blob([arrayBuffer]);
		} else {
			fileBody = Buffer.from(arrayBuffer);
		}
	} catch {
		fileBody = Buffer.from(arrayBuffer);
	}

	const ct = res.headers.get('content-type') || '';
	const extFromCt = ct.split('/')[1]?.split(';')[0];
	const ext = extFromCt ? `.${extFromCt.replace(/[^a-z0-9]/gi, '')}` : '';

	const uploaded = await writeClient.assets.upload('image', fileBody as any, {
		filename: filename + ext,
	});

	return uploaded;
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { slug, docId: incomingDocId, payload } = body ?? {};

		if (!payload || typeof payload !== 'object') {
			return NextResponse.json(
				{ success: false, message: 'Missing payload' },
				{ status: 400 },
			);
		}

		let docId = incomingDocId ?? null;

		// resolve docId by slug if not provided
		if (!docId) {
			if (!slug) {
				return NextResponse.json(
					{ success: false, message: 'Missing slug and docId' },
					{ status: 400 },
				);
			}
			const doc = await readClient
				.fetch(STARTUP_BY_SLUG_QUERY, { slug })
				.catch(() => null);
			if (doc?._id) docId = doc._id;
		}

		if (!docId) {
			return NextResponse.json(
				{
					success: false,
					message: 'Could not determine document id for update',
				},
				{ status: 404 },
			);
		}

		// Build base patch object from payload BUT we will avoid overwriting
		// image/link unless the payload explicitly includes a non-empty link.
		const patchObject: Record<string, any> = { ...payload };

		// If payload does NOT include link (or it's empty), remove image/link from patchObject
		// so we don't overwrite existing/default image in the doc.
		if (
			!('link' in payload) ||
			!payload.link ||
			typeof payload.link !== 'string' ||
			!payload.link.trim()
		) {
			// Ensure we don't set image/link to undefined/empty when user didn't intend to.
			delete patchObject.link;
			delete patchObject.image;
		} else {
			// payload.link exists and is non-empty — upload behind the scenes but preserve the original URL
			try {
				const uploaded = await uploadImageFromUrlToSanity(
					payload.link,
					`startup-${docId ?? slug ?? 'img'}`,
				);

				// preserve the original user-supplied URL string as visible fields
				patchObject.link = payload.link;
				patchObject.image = payload.link;

				// Extract any asset id/ref to store separately (so we can use the uploaded asset if needed)
				const assetId =
					uploaded?._id ??
					uploaded?.asset?._id ??
					uploaded?.asset?._ref ??
					null;

				if (assetId) {
					patchObject.imageAssetRef = {
						_type: 'reference',
						_ref: assetId,
					};
					patchObject.imageAssetId = assetId;
				}
			} catch (imgErr) {
				console.error(
					'Image upload failed; preserving original URL as image/link:',
					imgErr,
				);
				// Fall back to preserving the original link so we don't remove the visible image
				patchObject.image = payload.link;
				patchObject.link = payload.link;
			}
		}

		// Strip any File-like things (defensive)
		for (const [k, v] of Object.entries(patchObject)) {
			if (
				typeof v === 'object' &&
				v !== null &&
				(v as any).size &&
				(v as any).name
			) {
				delete patchObject[k];
			}
		}

		// Perform the patch — avoid touching image/link unless intended
		const patched = await writeClient
			.patch(docId)
			.set(patchObject)
			.commit({ autoGenerateArrayKeys: true });

		return NextResponse.json({ success: true, data: patched }, { status: 200 });
	} catch (err: any) {
		console.error('/api/sanity/update error', err?.message ?? err);
		return NextResponse.json(
			{ success: false, message: err?.message ?? 'Server error' },
			{ status: 500 },
		);
	}
}

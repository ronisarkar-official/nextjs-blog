'use server';

import { auth } from '@/auth';
import { stat } from 'fs';
import { parseServerActionResponse } from './utils';
import slugify from 'slugify';
import { writeClient } from '@/sanity/lib/write-client';

export const createPitch = async (
	state: any,
	form: FormData,
	pitch: string,
) => {
	const session = await auth();
	if (!session)
		return parseServerActionResponse({
			error: 'Not signed in',
			status: 'ERROR',
		});

	// get form entries (excluding the editor pitch field)
	const entries = Object.fromEntries(
		Array.from(form).filter(([key]) => key !== 'pitch'),
	) as Record<string, any>;

	const { title, description, category, link } = entries;

	// Prefer explicit slug from form if provided, otherwise fall back to title.
	// Normalize using slugify.
	const providedSlug = String(form.get('slug') ?? entries.slug ?? '').trim();
	const rawForSlug = providedSlug || String(title ?? '').trim();
	const normalizedSlug = slugify(rawForSlug, { lower: true, strict: true });

	try {
		const startup = {
			title,
			description,
			category,
			image: link,
			slug:
				normalizedSlug ? { _type: 'slug', current: normalizedSlug } : undefined,
			author: {
				_type: 'reference',
				_ref: session?.id,
			},
			pitch,
		};
		const result = await writeClient.create({ _type: 'startup', ...startup });
		return parseServerActionResponse({
			data: result,
			error: '',
			status: 'SUCCESS',
		});
	} catch (error: any) {
		console.log(error);
		return parseServerActionResponse({
			error: JSON.stringify(error) || 'Failed to create pitch',
			status: 'ERROR',
		});
	}
};

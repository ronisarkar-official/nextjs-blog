import { z } from 'zod';

const imageCheckCache = new Map<string, boolean>();

async function isImageUrl(url: string, timeoutMs = 3000): Promise<boolean> {
	if (imageCheckCache.has(url)) return imageCheckCache.get(url)!;

	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeoutMs);

	const checkContentType = (ct: string | null) => {
		if (!ct) return false;
		// take mime before any ; charset=
		const mime = ct.split(';')[0].trim().toLowerCase();
		return mime.startsWith('image/');
	};

	try {
		// prefer HEAD (lightweight), but some servers block HEAD -> fallback to ranged GET
		let res: Response | undefined;
		try {
			res = await fetch(url, { method: 'HEAD', signal: controller.signal });
		} catch (e) {
			// HEAD failed (network / server rejects) — we'll try ranged GET below
			res = undefined;
		}

		if (res && res.ok) {
			const ct = res.headers.get('content-type');
			const ok = checkContentType(ct);
			imageCheckCache.set(url, ok);
			return ok;
		}

		// Fallback: request only first byte to avoid full download
		const rangeRes = await fetch(url, {
			method: 'GET',
			headers: { Range: 'bytes=0-0' },
			signal: controller.signal,
		});

		if (!rangeRes.ok) return false;
		const ct = rangeRes.headers.get('content-type');
		const ok = checkContentType(ct);
		imageCheckCache.set(url, ok);
		return ok;
	} catch {
		return false;
	} finally {
		clearTimeout(id);
	}
}

/**
 * Preprocess helper to trim strings (so min/max are enforced on trimmed values)
 */
const trimmedString = (minLen = 0, maxLen?: number) =>
	z.preprocess(
		(val) => (typeof val === 'string' ? val.trim() : val),
		maxLen ? z.string().min(minLen).max(maxLen) : z.string().min(minLen),
	);

export const formSchema = z.object({
	title: trimmedString(3, 100),
	description: trimmedString(20, 500),
	category: trimmedString(3, 20),
	link: z
		.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().url())
		.refine(
			async (url) => {
				// zod passes the *preprocessed value* (still typed as unknown) — cast to string
				return await isImageUrl(String(url));
			},
			{ message: 'Link must be a reachable URL that points to an image' },
		),
	pitch: trimmedString(10),
});

// Type helper
export type FormValues = z.infer<typeof formSchema>;

// Example usage (server-side):
// await formSchema.parseAsync(data); // throws on invalid
// const result = await formSchema.safeParseAsync(data); // returns { success: true|false, ... }

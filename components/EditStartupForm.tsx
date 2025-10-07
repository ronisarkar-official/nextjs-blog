'use client';

import React, {
	useCallback,
	useEffect,
	useRef,
	useState,
	useMemo,
	type ChangeEvent,
} from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Trash } from 'lucide-react';
import { formSchema } from '@/lib/validation';
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import { Category } from '@/components/Category';
import { useTheme } from 'next-themes';
import ImageUploadButton from '@/components/ImageUploadButton';

// NEW: sanity client + slugs query
import { client } from '@/sanity/lib/client';
import { ALL_STARTUP_SLUG_STRINGS } from '@/sanity/lib/queries';
import DeletePostButton from './DeletePostButton';

type ErrorsMap = Record<string, string | undefined>;

const mapZodFieldErrors = (zErr: z.ZodError): ErrorsMap => {
	const flattened = zErr.flatten().fieldErrors;
	const out: ErrorsMap = {};
	for (const [k, v] of Object.entries(flattened)) {
		out[k] = Array.isArray(v) && v.length > 0 ? String(v[0]) : 'Invalid value';
	}
	return out;
};

type PreviewStatus = 'idle' | 'loading' | 'ok' | 'error';
const previewCache = new Map<string, PreviewStatus>();

function loadImagePreview(
	url: string,
	timeoutMs = 5000,
): Promise<PreviewStatus> {
	if (!url) return Promise.resolve('idle');

	// Validate URL format before proceeding
	try {
		new URL(url);
	} catch {
		previewCache.set(url, 'error');
		return Promise.resolve('error');
	}

	const cached = previewCache.get(url);
	if (cached) return Promise.resolve(cached);

	return new Promise((resolve) => {
		let finished = false;

		// Use document.createElement instead of new Image() to avoid potential issues
		const img = document.createElement('img');
		const timer = window.setTimeout(() => {
			if (!finished) {
				finished = true;
				previewCache.set(url, 'error');
				resolve('error');
			}
		}, timeoutMs);

		img.onload = () => {
			if (finished) return;
			finished = true;
			clearTimeout(timer);
			previewCache.set(url, 'ok');
			resolve('ok');
		};

		img.onerror = () => {
			if (finished) return;
			finished = true;
			clearTimeout(timer);
			previewCache.set(url, 'error');
			resolve('error');
		};

		try {
			img.src = url;
		} catch {
			if (!finished) {
				finished = true;
				clearTimeout(timer);
				previewCache.set(url, 'error');
				resolve('error');
			}
		}
	});
}

interface ImageUrlPreviewInputProps extends React.ComponentProps<typeof Input> {
	debounceMs?: number;
	previewHeightClassName?: string;
	onPreviewStatusChange?: (status: PreviewStatus) => void;
}

const ImageUrlPreviewInput = React.memo(function ImageUrlPreviewInput({
	id,
	name,
	defaultValue,
	className = 'h-fit',
	placeholder = 'https://example.com/image.jpg',
	debounceMs = 500,
	previewHeightClassName = 'h-28',
	onPreviewStatusChange,
	...rest
}: ImageUrlPreviewInputProps) {
	const [value, setValue] = useState<string>(() =>
		defaultValue ? String(defaultValue) : '',
	);
	const [status, setStatus] = useState<PreviewStatus>('idle');
	const [previewSrc, setPreviewSrc] = useState<string | null>(() =>
		defaultValue ? String(defaultValue) : null,
	);
	const timerRef = useRef<number | null>(null);
	const lastRequestedRef = useRef<string>('');

	useEffect(() => {
		return () => {
			if (timerRef.current) window.clearTimeout(timerRef.current);
		};
	}, []);

	useEffect(() => {
		if (!value) {
			setStatus('idle');
			setPreviewSrc(null);
			onPreviewStatusChange?.('idle');
			return;
		}

		if (timerRef.current) window.clearTimeout(timerRef.current);
		timerRef.current = window.setTimeout(() => {
			const url = value.trim();
			lastRequestedRef.current = url;
			setStatus('loading');
			onPreviewStatusChange?.('loading');

			loadImagePreview(url).then((result) => {
				if (lastRequestedRef.current !== url) return;
				setStatus(result);
				onPreviewStatusChange?.(result);
				if (result === 'ok') setPreviewSrc(url);
				else setPreviewSrc(null);
			});
		}, debounceMs);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value, debounceMs]);

	const handleChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setValue(e.target.value);
			if (typeof rest.onChange === 'function') rest.onChange(e as any);
		},
		[rest],
	);

	const statusText =
		status === 'idle' ? 'Add an image URL to preview'
		: status === 'loading' ? 'Checking image…'
		: status === 'ok' ? 'Image ready'
		: 'Invalid image URL';

	return (
		<div>
			<Input
				id={id}
				name={name}
				type="url"
				value={value}
				onChange={handleChange}
				placeholder={placeholder}
				className={className}
				{...rest}
			/>

			<div className="mt-3">
				<div
					className={`rounded-md overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center ${previewHeightClassName}`}>
					{status === 'idle' && (
						<span className="text-xs text-gray-400">{statusText}</span>
					)}

					{status === 'loading' && (
						<div
							role="status"
							aria-live="polite"
							className="flex items-center gap-2 text-sm text-gray-500">
							<svg
								className="animate-spin h-4 w-4"
								viewBox="0 0 24 24"
								fill="none"
								aria-hidden="true">
								<circle
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="3"
									strokeOpacity="0.25"
								/>
								<path
									d="M22 12a10 10 0 10-10 10"
									stroke="currentColor"
									strokeWidth="3"
									strokeLinecap="round"
								/>
							</svg>
							<span>Checking image…</span>
						</div>
					)}

					{status === 'ok' && previewSrc && (
						<img
							src={previewSrc}
							alt="Image preview"
							className="object-cover w-full h-full"
						/>
					)}

					{status === 'error' && (
						<div className="text-center px-4">
							<div className="text-sm font-medium text-red-600 mb-1">
								Can't preview image
							</div>
							<div className="text-xs text-gray-500">
								Make sure the URL points to a public image (jpg/png/webp)
							</div>
						</div>
					)}
				</div>

				<div
					className="mt-2 text-xs"
					aria-live="polite">
					<span
						className={status === 'error' ? 'text-red-500' : 'text-gray-400'}>
						{statusText}
					</span>
				</div>
			</div>
		</div>
	);
});

const ToastEditor = dynamic(
	() => import('@toast-ui/react-editor').then((mod) => mod.Editor),
	{
		ssr: false,
		loading: () => <div className="p-4">Loading editor…</div>,
	},
);

interface EditStartupFormProps {
	initialData: any; // startup object from Sanity (may be null)
	slug: string;
}

// small slugify helper (same logic used elsewhere)
const slugify = (s: string) =>
	String(s)
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
		.replace(/\s+/g, '-') // collapse whitespace -> hyphen
		.replace(/-+/g, '-') // collapse multiple hyphens
		.replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens

export default function EditStartupForm({
	initialData,
	slug,
}: EditStartupFormProps) {
	const { resolvedTheme } = useTheme();
	const editorTheme = resolvedTheme === 'dark' ? 'dark' : 'light';
	const [errors, setErrors] = useState<ErrorsMap>({});
	const [pitch, setPitch] = useState<string>(() =>
		String(initialData?.pitch ?? ''),
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
	const [category, setCategory] = useState<string>(() =>
		String(initialData?.category ?? ''),
	);
	const formRef = useRef<HTMLFormElement | null>(null);
	const editorRef = useRef<any>(null);
	const docIdRef = useRef<string | null>(initialData?._id ?? null);

	// Normalize initial slug so inputs receive a string instead of [object Object]
	const initialSlug = useMemo(() => {
		const s = initialData?.slug;
		if (!s) return '';
		if (typeof s === 'string') return s;
		return String((s as any).current ?? '') || '';
	}, [initialData]);
	const handleImageUploaded = useCallback((url: string) => {
		setUploadedImageUrl(url);
		setErrors((prev) => ({ ...prev, link: undefined }));
		// eslint-disable-next-line no-console
		console.log('Image uploaded successfully, URL:', url);
	}, []);

	const handleImageRemoved = useCallback(() => {
		setUploadedImageUrl('');
		setErrors((prev) => ({ ...prev, link: undefined }));
		// eslint-disable-next-line no-console
		console.log('Image removed');
	}, []);

	// Sync initial data to editor & pitch state when it changes
	useEffect(() => {
		if (initialData) {
			if (initialData._id) docIdRef.current = initialData._id;
			setPitch(String(initialData.pitch ?? ''));
			setCategory(String(initialData.category ?? ''));
			if (editorRef.current?.getInstance?.()?.setMarkdown) {
				try {
					editorRef.current
						.getInstance()
						.setMarkdown(String(initialData.pitch ?? ''));
				} catch {
					// ignore
				}
			}
		}
	}, [initialData]);

	const onEditorChange = useCallback(() => {
		const md = editorRef.current?.getInstance?.()?.getMarkdown?.() ?? '';
		setPitch(String(md ?? ''));
	}, []);

	const handleUpdate = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			setErrors({});
			setIsSubmitting(true);

			const formEl = e.currentTarget;
			const fd = new FormData(formEl);

			const editorMarkdown =
				editorRef.current?.getInstance?.()?.getMarkdown?.() ?? pitch ?? '';
			fd.set('pitch', editorMarkdown.trim());

			// Build payload (serializable)
			const payload: Record<string, any> = {};
			for (const [key, val] of fd.entries()) {
				payload[key] = typeof val === 'string' ? (val as string).trim() : val;
			}

			// Prefer uploaded image URL over manual link input
			const imageUrl = uploadedImageUrl || payload.link;
			if (imageUrl) {
				payload.image = { url: imageUrl };
				// Optionally keep link in sync for backward compatibility
				payload.link = imageUrl;
			}

			const toastId = toast.loading('Updating startup…');

			try {
				await formSchema.parseAsync(payload);

				// docId optional: server route can resolve by slug if docId missing
				const docId = docIdRef.current ?? undefined;

				// --- SLUG HANDLING & UNIQUENESS CHECK:
				// prefer form value, fall back to initialSlug; normalize
				let rawSlugCandidate = '';
				if (payload.slug) {
					// payload.slug could be string or object { _type, current }
					if (typeof payload.slug === 'string') rawSlugCandidate = payload.slug;
					else if (typeof payload.slug === 'object' && payload.slug?.current)
						rawSlugCandidate = String(payload.slug.current);
				}
				// if nothing from form, use initialSlug
				if (!rawSlugCandidate) rawSlugCandidate = initialSlug ?? '';

				const sendSlug = slugify(String(rawSlugCandidate ?? '').trim());

				// Check uniqueness: fetch all existing slug strings and compare.
				// Allow if sendSlug === initialSlug (editing without changing).
				if (sendSlug) {
					try {
						const existing =
							(await client.fetch(ALL_STARTUP_SLUG_STRINGS)) || [];
						const slugStrings =
							Array.isArray(existing) ?
								existing.map((s: any) => String(s ?? '').trim())
							:	[];

						// if slug exists and it's not the same as the original slug on this doc, block
						if (slugStrings.includes(sendSlug) && sendSlug !== initialSlug) {
							setErrors({ slug: 'Slug already taken' });
							toast.error('Slug already taken — choose a different one.', {
								id: toastId,
							});
							setIsSubmitting(false);
							return { error: 'Slug already taken', status: 'ERROR' };
						}
					} catch (err) {
						// if slug check fails, log and continue (optional: you can abort instead)
						console.warn('Slug uniqueness check failed — proceeding', err);
					}
				}

				// Ensure payload.slug is a proper Sanity slug object for writing/updating
				if (sendSlug) payload.slug = { _type: 'slug', current: sendSlug };
				else delete payload.slug;

				const res = await fetch('/api/sanity/update', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ slug: sendSlug, docId, payload }),
				});

				// try to parse JSON safely
				const responseBody = await res.json().catch(() => null);

				if (!res.ok) {
					const msg =
						responseBody?.message || responseBody?.error || 'API update failed';
					throw new Error(msg);
				}

				toast.success('Startup updated.', { id: toastId });

				// update docIdRef if server returned the patched doc id
				if (responseBody?.data?._id) docIdRef.current = responseBody.data._id;

				return responseBody;
			} catch (err) {
				if (err instanceof z.ZodError) {
					const fieldErrs = mapZodFieldErrors(err);
					setErrors(fieldErrs);
					toast.error('Validation error — please review highlighted fields.', {
						id: toastId,
					});
					return { error: 'Validation failed', status: 'ERROR' };
				}

				const message =
					err instanceof Error ? err.message : 'An unexpected error occurred';
				setErrors({ form: message });
				toast.error(message, { id: toastId });
				// eslint-disable-next-line no-console
				console.error(err);
				return { error: message, status: 'ERROR' };
			} finally {
				setIsSubmitting(false);
			}
		},
		[pitch, initialSlug, uploadedImageUrl],
	);

	return (
		<>
			<Toaster position="top-right" />

			<form
				ref={formRef}
				onSubmit={handleUpdate}
				className="min-h-screen bg-transparent "
				aria-busy={isSubmitting}>
				<div className="relative flex flex-col lg:flex-row gap-4">
					<main className="flex-1">
						<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
							<div className="px-6 py-5">
								<label
									htmlFor="title"
									className="font-medium">
									Post title
								</label>
								<Input
									aria-label="Post title"
									id="title"
									name="title"
									required
									defaultValue={initialData?.title ?? ''}
									placeholder="Give your pitch a clear, catchy title"
									className="w-full text-xl sm:text-2xl font-semibold placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent outline-none pb-1"
								/>
								{errors.title && (
									<p className="text-sm text-red-500 mt-2">{errors.title}</p>
								)}
							</div>

							<div className="border-t border-gray-100 dark:border-gray-700" />

							<div className="px-6 py-4 max-w-4xl">
								<div className="mb-3 flex items-center justify-between gap-4">
									<div className="flex items-center gap-3 text-xs text-gray-500">
										<span>{(pitch?.length ?? 0).toLocaleString()} chars</span>
									</div>

									<div className="text-xs text-gray-400">
										Tip: use headings and bullets for clarity
									</div>
								</div>

								<div
									data-color-mode={editorTheme}
									className=" h-fit bg-white dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-800 shadow-inner overflow-auto">
									<ToastEditor
										ref={editorRef}
										initialValue={initialData?.pitch ?? ''}
										previewStyle="vertical"
										height="500px"
										initialEditType="markdown"
										useCommandShortcut={true}
										usageStatistics={false}
										theme={editorTheme}
										textareaProps={{
											placeholder:
												'Write your startup pitch — problem, solution, traction, ask...',
											'aria-label': 'Startup pitch editor',
										}}
										onChange={onEditorChange}
									/>
								</div>
								{errors.pitch && (
									<p className="text-sm text-red-500 mt-2">{errors.pitch}</p>
								)}
							</div>
						</div>

						<div className="lg:hidden fixed left-0 right-0 bottom-4 px-4 ml-4">
							<div className="max-w-3xl mx-auto">
								<Button
									type="submit"
									className="w-full py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg disabled:opacity-60 cursor-pointer"
									disabled={isSubmitting}
									aria-disabled={isSubmitting}>
									{isSubmitting ? 'Updating...' : 'Update'}
									<Send className="ml-1 h-4 w-4" />
								</Button>
							</div>
						</div>
					</main>

					<aside className="w-full lg:w-80 flex-shrink-0">
						<div className="sticky top-6">
							<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4">
								<div className="flex items-center justify-between mb-3">
									<h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
										Post settings
									</h3>
								</div>

								<div className="mb-4">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										<DeletePostButton
											slug={initialSlug}
											className="w-full py-2 rounded-md bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center gap-2 cursor-pointer"
											aria-label="Delete startup">
											<Trash className="h-4 w-4" />
											<span>Delete</span>
										</DeletePostButton>

										<Button
											type="submit"
											className="w-full py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-60 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
											disabled={isSubmitting}
											aria-disabled={isSubmitting}
											aria-label="Update startup">
											{isSubmitting ? 'Updating...' : 'Update'}
											<Send className="ml-1 h-4 w-4" />
										</Button>
									</div>
								</div>

								<div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
									<div>
										<label
											htmlFor="category"
											className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
											Category
										</label>
										<Category
											value={category}
											onValueChange={setCategory}
											disabled={isSubmitting}
										/>
										{errors.category && (
											<p className="text-sm text-red-500 mt-1">
												{errors.category}
											</p>
										)}
										<div className="mt-2 text-xs text-gray-400">
											Choose the most relevant category
										</div>
									</div>

									<div>
										<label
											htmlFor="slug"
											className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
											Slug
										</label>
										<Input
											aria-label="Post category"
											id="slug"
											name="slug"
											required
											defaultValue={initialSlug}
											placeholder="slug-slug-slug"
											className="w-full text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent outline-none"
										/>
										{errors.slug && (
											<p className="text-sm text-red-500 mt-1">{errors.slug}</p>
										)}
										<div className="mt-2 text-xs text-gray-400">
											Choose the most relevant slug
										</div>
									</div>

									<div className="border-t border-gray-100 dark:border-gray-700 pt-3">
										<label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
											Image Upload
										</label>
										<ImageUploadButton
											onImageUploaded={handleImageUploaded}
											onImageRemoved={handleImageRemoved}
											disabled={isSubmitting}
											className="w-full"
										/>
										{errors.link && (
											<p className="text-sm text-red-500 mt-1">{errors.link}</p>
										)}
										<div className="mt-2 text-xs text-gray-400 dark:text-gray-400">
											Upload an image or paste a URL below
										</div>
									</div>

									<div className="border-t border-gray-100 dark:border-gray-700 pt-3">
										<label
											htmlFor="link"
											className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
											Or Image URL
										</label>
										{uploadedImageUrl ?
											<div className="space-y-2">
												<div className="text-xs text-green-600 dark:text-green-400">
													✓ Using uploaded image
												</div>
											</div>
										:	<ImageUrlPreviewInput
												id="link"
												name="link"
												defaultValue={
													initialData?.link ?? initialData?.image ?? ''
												}
												placeholder="https://example.com/image.jpg"
												className="w-full text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent outline-none "
											/>
										}

										{errors.link && (
											<p className="text-sm text-red-500 mt-1">{errors.link}</p>
										)}
									</div>

									<div className="border-t border-gray-100 dark:border-gray-700 pt-3">
										<label
											htmlFor="description"
											className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
											Post Meta Description
										</label>
										<Textarea
											aria-label="Post description"
											id="description"
											name="description"
											required
											defaultValue={initialData?.description ?? ''}
											placeholder="Short summary that appears in previews"
											className="w-full text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent outline-none"
										/>
										{errors.description && (
											<p className="text-sm text-red-500 mt-1">
												{errors.description}
											</p>
										)}
										<div className="mt-2 text-xs text-gray-400 dark:text-gray-400">
											Make the description under 150 characters
										</div>
									</div>
								</div>
							</div>

							<div className="h-44" />
						</div>
					</aside>
				</div>

				{/* Hidden textarea so FormData picks up the markdown pitch value */}
				<textarea
					name="pitch"
					value={pitch}
					readOnly
					hidden
				/>
				{/* Hidden input for category */}
				<input
					name="category"
					value={category}
					readOnly
					hidden
				/>
			</form>
		</>
	);
}

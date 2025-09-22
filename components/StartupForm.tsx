'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import MDEditor from '@uiw/react-md-editor';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { formSchema } from '@/lib/validation';
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { createPitch } from '@/lib/actions';

type ErrorsMap = Record<string, string | undefined>;

/* ---------- Helpers (kept pure & outside component) ---------- */
const mapZodFieldErrors = (zErr: z.ZodError): ErrorsMap => {
	const flattened = zErr.flatten().fieldErrors;
	const out: ErrorsMap = {};
	for (const [k, v] of Object.entries(flattened)) {
		out[k] = Array.isArray(v) && v.length > 0 ? String(v[0]) : 'Invalid value';
	}
	return out;
};

const fetchFallback = async (payload: Record<string, any>) => {
	const res = await fetch('/api/startups', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

	const text = await res.text();
	let parsed: any = null;
	try {
		parsed = text ? JSON.parse(text) : null;
	} catch {
		parsed = { message: text };
	}

	if (!res.ok) {
		const msg =
			parsed?.message ||
			parsed?.error ||
			res.statusText ||
			'Failed to create startup';
		throw new Error(msg);
	}
	return parsed;
};

const extractCreatedId = (result: any) =>
	result?.id ?? result?._id ?? result?.data?.id ?? null;

/* ---------- Image preview helpers (cache + loader) ---------- */
type PreviewStatus = 'idle' | 'loading' | 'ok' | 'error';
const previewCache = new Map<string, PreviewStatus>();

/**
 * Loads an image via the browser Image() API and resolves ok/error.
 * Uses a timeout and caches results.
 */
function loadImagePreview(
	url: string,
	timeoutMs = 5000,
): Promise<PreviewStatus> {
	if (!url) return Promise.resolve('idle');
	const cached = previewCache.get(url);
	if (cached) return Promise.resolve(cached);

	return new Promise((resolve) => {
		let finished = false;
		const img = new Image();
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

/* ---------- Inline ImageUrlPreviewInput component ---------- */
interface ImageUrlPreviewInputProps extends React.ComponentProps<typeof Input> {
	debounceMs?: number;
	previewHeightClassName?: string;
	onPreviewStatusChange?: (status: PreviewStatus) => void;
}

function ImageUrlPreviewInput({
	id,
	name,
	defaultValue,
	className = '',
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
				// ignore stale results
				if (lastRequestedRef.current !== url) return;
				setStatus(result);
				onPreviewStatusChange?.(result);
				if (result === 'ok') {
					setPreviewSrc(url);
				} else {
					setPreviewSrc(null);
				}
			});
		}, debounceMs);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value, debounceMs]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
		// Call original onChange if provided via props (Input supports onChange)
		if (typeof rest.onChange === 'function') {
			rest.onChange(e);
		}
	};

	const statusText =
		status === 'idle' ? 'Add an image URL to preview'
		: status === 'loading' ? 'Checking image…'
		: status === 'ok' ? 'Image ready'
		: 'Invalid image URL';

	return (
		<div>
			{/* Use your Input component so name/id/styles remain identical */}
			<Input
				id={id}
				name={name}
				type="url"
				value={value}
				onChange={handleChange}
				placeholder={placeholder}
				className={`${className}`}
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
}

/* ---------- Component ---------- */
const StartupForm: React.FC = () => {
	const [errors, setErrors] = useState<ErrorsMap>({});
	const [pitch, setPitch] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const formRef = useRef<HTMLFormElement | null>(null);

	// update pitch handler memoized
	const handlePitchChange = useCallback((val?: string | null) => {
		setPitch(String(val ?? ''));
	}, []);

	const handleSubmit = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			setErrors({});
			setIsSubmitting(true);

			const formEl = e.currentTarget;
			const fd = new FormData(formEl);

			// Build trimmed payload from FormData (handles File values safely)
			const payload: Record<string, any> = {};
			for (const [key, val] of fd.entries()) {
				payload[key] =
					typeof val === 'string' ? (val as string).trim() : (val as File);
			}
			// ensure pitch is included / trimmed
			payload.pitch = (pitch ?? '').toString().trim();

			const toastId = toast.loading('Posting your startup pitch...');

			try {
				await formSchema.parseAsync(payload);

				let result: any = null;
				const hasCreatePitch = typeof createPitch === 'function';

				if (hasCreatePitch) {
					try {
						// Prefer server action when available (keep fd for file support)
						result = await createPitch(undefined, fd, pitch);
					} catch (actionErr) {
						// fallback to fetch if action fails
						// eslint-disable-next-line no-console
						console.warn(
							'createPitch failed — falling back to /api/startups',
							actionErr,
						);
						result = await fetchFallback(payload);
					}
				} else {
					result = await fetchFallback(payload);
				}

				const createdId = extractCreatedId(result);

				toast.success('Startup pitch created.', { id: toastId });

				// reset form + editor
				if (formRef.current) formRef.current.reset();
				setPitch('');

				if (createdId) {
					router.push(`/startup/${createdId}`);
				}

				return result;
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
		[pitch, router],
	);

	return (
		<>
			{/* Remove this if Toaster is already placed globally */}
			<Toaster position="top-right" />

			<form
				ref={formRef}
				onSubmit={handleSubmit}
				className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4"
				aria-busy={isSubmitting}>
				<div className="max-w-7xl mx-auto">
					<div className="relative flex flex-col lg:flex-row gap-6">
						{/* Main editor column */}
						<main className="flex-1">
							<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
								{/* Title area */}
								<div className="px-6 py-5">
									<label
										htmlFor="title"
										className="sr-only">
										Post title
									</label>
									<Input
										aria-label="Post title"
										id="title"
										name="title"
										required
										defaultValue=""
										placeholder="Give your pitch a clear, catchy title"
										className="w-full text-xl sm:text-2xl font-semibold placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent outline-none pb-1"
									/>
									{errors.title && (
										<p className="text-sm text-red-500 mt-2">{errors.title}</p>
									)}

									{/* small meta row */}
								</div>

								<div className="border-t border-gray-100 dark:border-gray-700" />

								{/* Editor */}
								<div className="px-6 py-4">
									<div className="mb-3 flex items-center justify-between gap-4">
										<div className="flex items-center gap-3 text-xs text-gray-500">
											<span>{(pitch?.length ?? 0).toLocaleString()} chars</span>
										</div>

										<div className="text-xs text-gray-400">
											Tip: use headings and bullets for clarity
										</div>
									</div>
									<div
										data-color-mode="light"
										className="w-full bg-white dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-800 shadow-inner overflow-auto">
										<MDEditor
											value={pitch}
											onChange={(val) => handlePitchChange(String(val ?? ''))}
											height={520}
											textareaProps={{
												placeholder:
													'Write your startup pitch — problem, solution, traction, ask...',
												'aria-label': 'Startup pitch editor',
											}}
										/>
									</div>
									{errors.pitch && (
										<p className="text-sm text-red-500 mt-2">{errors.pitch}</p>
									)}
								</div>
							</div>

							{/* Mobile sticky bottom action */}
							<div className="lg:hidden fixed left-0 right-0 bottom-4 px-4">
								<div className="max-w-3xl mx-auto">
									<Button
										type="submit"
										className="w-full py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg disabled:opacity-60"
										disabled={isSubmitting}
										aria-disabled={isSubmitting}>
										{isSubmitting ? 'Posting...' : 'Post'}
									</Button>
								</div>
							</div>
						</main>

						{/* Right sidebar */}
						<aside className="w-full lg:w-80 flex-shrink-0">
							<div className="sticky top-6">
								<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4">
									{/* Header inside sidebar */}
									<div className="flex items-center justify-between mb-3">
										<h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
											Post settings
										</h3>

										{/* small status pill */}
									</div>

									{/* Post button on top of settings for convenience */}
									<div className="mb-4">
										<Button
											type="submit"
											className="w-full py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-60"
											disabled={isSubmitting}
											aria-disabled={isSubmitting}>
											{isSubmitting ? 'Posting...' : 'Post'}
											<Send className="ml-2 h-4 w-4" />
										</Button>
									</div>

									<div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
										<div>
											<label
												htmlFor="category"
												className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
												Category
											</label>
											<Input
												aria-label="Post category"
												id="category"
												name="category"
												required
												defaultValue=""
												placeholder="Category (Tech, Health, Finance...)"
												className="w-full text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent outline-none"
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

										<div className="border-t border-gray-100 dark:border-gray-700 pt-3">
											<label
												htmlFor="link"
												className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
												Image URL
											</label>

											{/* IMAGE URL WITH PREVIEW */}
											<ImageUrlPreviewInput
												id="link"
												name="link"
												required
												defaultValue=""
												placeholder="https://example.com/image.jpg"
												className="w-full text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent outline-none"
											/>

											{errors.link && (
												<p className="text-sm text-red-500 mt-1">
													{errors.link}
												</p>
											)}
										</div>

										<div className="border-t border-gray-100 dark:border-gray-700 pt-3">
											<label
												htmlFor="description"
												className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
												Description
											</label>
											<Textarea
												aria-label="Post description"
												id="description"
												name="description"
												required
												defaultValue=""
												placeholder="Short summary that appears in previews"
												className="w-full text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent outline-none"
											/>
											{errors.description && (
												<p className="text-sm text-red-500 mt-1">
													{errors.description}
												</p>
											)}
										</div>
									</div>
								</div>

								{/* spacer so the sticky area has breathing room */}
								<div className="h-44" />
							</div>
						</aside>
					</div>
				</div>

				{/* Hidden textarea so FormData picks up the markdown pitch value */}
				<textarea
					name="pitch"
					value={pitch}
					readOnly
					hidden
				/>
			</form>
		</>
	);
};

export default StartupForm;

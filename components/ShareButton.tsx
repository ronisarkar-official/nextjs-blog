'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

type Props = {
	postTitle: string;
	postDescription?: string;
	postUrl: string;
	className?: string;
	onShare?: (method: 'native' | 'clipboard' | 'error') => void;
};

export default function ShareButton({
	postTitle,
	postDescription,
	postUrl,
	className = '',
	onShare,
}: Props) {
	const [status, setStatus] = useState<null | 'shared' | 'copied' | 'error'>(
		null,
	);
	const mounted = useRef(false);
	const timerRef = useRef<number | null>(null);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			if (timerRef.current) window.clearTimeout(timerRef.current);
		};
	}, []);

	// Clear internal status after a short delay (visual + accessible)
	useEffect(() => {
		if (!status) return;
		timerRef.current = window.setTimeout(() => {
			if (mounted.current) setStatus(null);
		}, 2500);
		return () => {
			if (timerRef.current) window.clearTimeout(timerRef.current);
		};
	}, [status]);

	async function handleShare() {
		try {
			// Native share if available
			if (typeof navigator !== 'undefined' && (navigator as any).share) {
				await (navigator as any).share({
					title: postTitle,
					text: postDescription || postTitle,
					url: postUrl,
				});
				setStatus('shared');
				toast.success('Shared!');
				onShare?.('native');
				return;
			}

			// Clipboard fallback
			if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(postUrl);
				setStatus('copied');
				toast.success('Link copied to clipboard');
				onShare?.('clipboard');
				return;
			}

			// Legacy execCommand fallback
			const textarea = document.createElement('textarea');
			textarea.value = postUrl;
			textarea.setAttribute('readonly', '');
			textarea.style.position = 'absolute';
			textarea.style.left = '-9999px';
			document.body.appendChild(textarea);
			textarea.select();
			const success = document.execCommand('copy');
			textarea.remove();
			if (success) {
				setStatus('copied');
				toast.success('Link copied to clipboard');
				onShare?.('clipboard');
			} else {
				throw new Error('Copy fallback failed');
			}
		} catch (err: any) {
			console.error('Share failed:', err);
			setStatus('error');
			toast.error(err?.message || 'Share failed');
			onShare?.('error');
		}
	}

	const ariaLabel =
		status === 'shared' ? 'Content shared'
		: status === 'copied' ? 'Link copied'
		: status === 'error' ? 'Share failed'
		: 'Share';

	return (
		<div className={`inline-flex items-center ${className}`}>
			<button
				
				onClick={handleShare}
				title="Share"
				aria-label={ariaLabel}
				className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-shadow shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
				<Share2
					className="w-4 h-4"
					aria-hidden
				/>
				<span className="hidden sm:inline">Share</span>
			</button>

			{/* small accessible/visual hint (kept minimal because react-hot-toast shows toasts) */}
			<div
				aria-live="polite"
				role="status"
				className="sr-only">
				{status === 'shared' && 'Shared'}
				{status === 'copied' && 'Link copied'}
				{status === 'error' && 'Share failed'}
			</div>
		</div>
	);
}
